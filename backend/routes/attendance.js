import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { protect } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { 
  calculateAverageHoursPerDay, 
  calculateCompletionDate,
  countWorkingDays 
} from '../utils/dateCalculations.js';
import { parseLocalDate } from '../utils/dateUtils.js';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

const router = express.Router();

router.use(protect);

router.post('/', [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('hoursLogged')
    .isFloat({ min: 0, max: 24 })
    .withMessage('Hours must be between 0 and 24'),
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, hoursLogged, startTime, endTime, notes } = req.body;
    const entryDate = parseLocalDate(date);
    if (!entryDate || isNaN(entryDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (entryDate > today) {
      return res.status(400).json({ message: 'Cannot log hours for future dates' });
    }

    const existing = await Attendance.findOne({
      userId: req.user._id,
      date: entryDate
    });

    if (existing) {
      return res.status(400).json({ message: 'Entry already exists for this date. Use PUT to update.' });
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      date: entryDate,
      hoursLogged,
      startTime,
      endTime,
      notes
    });

    res.status(201).json({
      message: 'Attendance entry created successfully',
      attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Entry already exists for this date' });
    }
    next(error);
  }
});

// @route   GET /api/attendance
// @desc    Get all attendance entries (with optional filters)
// @access  Protected
router.get('/', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = parseLocalDate(startDate);
        if (start) {
          query.date.$gte = start;
        }
      }
      if (endDate) {
        const end = parseLocalDate(endDate);
        if (end) {
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .select('-__v');

    res.json({
      count: attendance.length,
      attendance
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allAttendance = await Attendance.find({ userId: req.user._id });

    const totalHours = allAttendance.reduce((sum, record) => sum + record.hoursLogged, 0);
    const targetHours = user.internshipConfig?.targetHours || 500;
    const hoursRemaining = Math.max(0, targetHours - totalHours);
    const progressPercentage = targetHours > 0 ? (totalHours / targetHours) * 100 : 0;

    const averageHoursPerDay = calculateAverageHoursPerDay(allAttendance);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completionDate = calculateCompletionDate(
      hoursRemaining,
      averageHoursPerDay,
      today,
      user.internshipConfig
    );

    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const thisWeekAttendance = allAttendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });
    const thisWeekHours = thisWeekAttendance.reduce((sum, record) => sum + record.hoursLogged, 0);
    const thisWeekDays = thisWeekAttendance.length;
    const thisWeekAverage = thisWeekDays > 0 ? thisWeekHours / thisWeekDays : 0;

    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const thisMonthAttendance = allAttendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });
    const thisMonthHours = thisMonthAttendance.reduce((sum, record) => sum + record.hoursLogged, 0);
    const thisMonthDays = thisMonthAttendance.length;

    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
    const prevMonthStart = startOfMonth(prevMonthEnd);
    const prevMonthAttendance = allAttendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= prevMonthStart && recordDate <= prevMonthEnd;
    });
    const prevMonthHours = prevMonthAttendance.reduce((sum, record) => sum + record.hoursLogged, 0);

    const workingDaysRemaining = countWorkingDays(
      today,
      completionDate,
      user.internshipConfig
    );

    res.json({
      totalHours,
      targetHours,
      hoursRemaining,
      progressPercentage: Math.min(100, Math.round(progressPercentage * 100) / 100),
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
      completionDate,
      workingDaysRemaining,
      thisWeek: {
        hours: thisWeekHours,
        days: thisWeekDays,
        average: Math.round(thisWeekAverage * 100) / 100
      },
      thisMonth: {
        hours: thisMonthHours,
        days: thisMonthDays
      },
      previousMonth: {
        hours: prevMonthHours
      },
      totalEntries: allAttendance.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/calendar/:year/:month', async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1;

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return res.status(400).json({ message: 'Invalid year or month' });
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).select('date hoursLogged');

    const calendarData = attendance.map(record => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return {
        date: `${year}-${month}-${day}`,
        hours: record.hoursLogged
      };
    });

    res.json({
      year,
      month: month + 1,
      attendance: calendarData
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance entry not found' });
    }

    res.json({ attendance });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', [
  body('hoursLogged')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Hours must be between 0 and 24'),
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('notes')
    .optional()
    .isLength({ max: 500 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const attendance = await Attendance.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance entry not found' });
    }

    if (req.body.hoursLogged !== undefined) {
      attendance.hoursLogged = req.body.hoursLogged;
    }
    if (req.body.startTime !== undefined) {
      attendance.startTime = req.body.startTime;
    }
    if (req.body.endTime !== undefined) {
      attendance.endTime = req.body.endTime;
    }
    if (req.body.notes !== undefined) {
      attendance.notes = req.body.notes;
    }

    await attendance.save();

    res.json({
      message: 'Attendance entry updated successfully',
      attendance
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const attendance = await Attendance.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance entry not found' });
    }

    res.json({
      message: 'Attendance entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

