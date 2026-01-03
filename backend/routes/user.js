import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.use(protect);

router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        internshipConfig: user.internshipConfig
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/config', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      config: user.internshipConfig
    });
  } catch (error) {
    next(error);
  }
});

router.put('/config', [
  body('targetHours')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target hours must be a positive integer'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('excludeWeekends.saturday')
    .optional()
    .isBoolean(),
  body('excludeWeekends.sunday')
    .optional()
    .isBoolean(),
  body('excludedWeekdays')
    .optional()
    .isArray(),
  body('excludedWeekdays.*')
    .optional()
    .isInt({ min: 0, max: 6 }),
  body('holidays')
    .optional()
    .isArray(),
  body('lunchBreak.enabled')
    .optional()
    .isBoolean(),
  body('lunchBreak.hours')
    .optional()
    .isFloat({ min: 0, max: 8 }),
  body('defaultStartTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('defaultEndTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { targetHours, startDate, excludeWeekends, excludedWeekdays, holidays, lunchBreak, defaultStartTime, defaultEndTime } = req.body;

    if (targetHours !== undefined) {
      user.internshipConfig.targetHours = targetHours;
    }
    if (startDate !== undefined) {
      const date = new Date(startDate);
      if (date > new Date()) {
        return res.status(400).json({ message: 'Start date cannot be in the future' });
      }
      user.internshipConfig.startDate = date;
    }
    if (excludeWeekends !== undefined) {
      if (excludeWeekends.saturday !== undefined) {
        user.internshipConfig.excludeWeekends.saturday = excludeWeekends.saturday;
      }
      if (excludeWeekends.sunday !== undefined) {
        user.internshipConfig.excludeWeekends.sunday = excludeWeekends.sunday;
      }
    }
    if (excludedWeekdays !== undefined) {
      user.internshipConfig.excludedWeekdays = excludedWeekdays;
    }
    if (holidays !== undefined) {
      user.internshipConfig.holidays = holidays.map(holiday => new Date(holiday));
    }
    if (lunchBreak !== undefined) {
      if (lunchBreak.enabled !== undefined) {
        user.internshipConfig.lunchBreak.enabled = lunchBreak.enabled;
      }
      if (lunchBreak.hours !== undefined) {
        user.internshipConfig.lunchBreak.hours = lunchBreak.hours;
      }
    }
    if (defaultStartTime !== undefined) {
      user.internshipConfig.defaultStartTime = defaultStartTime;
    }
    if (defaultEndTime !== undefined) {
      user.internshipConfig.defaultEndTime = defaultEndTime;
    }

    await user.save();

    res.json({
      message: 'Configuration updated successfully',
      config: user.internshipConfig
    });
  } catch (error) {
    next(error);
  }
});

export default router;

