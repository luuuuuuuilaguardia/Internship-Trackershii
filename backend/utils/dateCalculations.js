import { addDays, isSameDay, isBefore, isAfter, format, startOfDay, differenceInDays } from 'date-fns';

export const countWorkingDays = (startDate, endDate, config = {}) => {
  const { excludeWeekends = {}, excludedWeekdays = [], holidays = [] } = config;
  
  let count = 0;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  currentDate.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    
    let isExcluded = false;

    if (excludeWeekends.saturday && dayOfWeek === 6) {
      isExcluded = true;
    }
    if (excludeWeekends.sunday && dayOfWeek === 0) {
      isExcluded = true;
    }

    if (excludedWeekdays.includes(dayOfWeek)) {
      isExcluded = true;
    }

    const isHoliday = holidays.some(holiday => {
      const holidayDate = new Date(holiday);
      holidayDate.setHours(0, 0, 0, 0);
      return isSameDay(currentDate, holidayDate);
    });

    if (!isExcluded && !isHoliday) {
      count++;
    }

    currentDate = addDays(currentDate, 1);
  }

  return count;
};

export const calculateCompletionDate = (remainingHours, averageHoursPerDay, startFromDate, config = {}) => {
  if (remainingHours <= 0) {
    return startFromDate;
  }

  const effectiveAverage = averageHoursPerDay > 0 ? averageHoursPerDay : 8;
  
  const workingDaysNeeded = Math.ceil(remainingHours / effectiveAverage);

  let currentDate = new Date(startFromDate);
  currentDate.setHours(0, 0, 0, 0);
  
  let workingDaysCounted = 0;
  const maxDays = 365 * 2;
  let daysPassed = 0;

  while (workingDaysCounted < workingDaysNeeded && daysPassed < maxDays) {
    const dayOfWeek = currentDate.getDay();
    let isExcluded = false;

    if (config.excludeWeekends?.saturday && dayOfWeek === 6) {
      isExcluded = true;
    }
    if (config.excludeWeekends?.sunday && dayOfWeek === 0) {
      isExcluded = true;
    }

    if (config.excludedWeekdays?.includes(dayOfWeek)) {
      isExcluded = true;
    }

    const isHoliday = config.holidays?.some(holiday => {
      const holidayDate = new Date(holiday);
      holidayDate.setHours(0, 0, 0, 0);
      return isSameDay(currentDate, holidayDate);
    });

    if (!isExcluded && !isHoliday) {
      workingDaysCounted++;
    }

    if (workingDaysCounted < workingDaysNeeded) {
      currentDate = addDays(currentDate, 1);
      daysPassed++;
    }
  }

  return currentDate;
};

export const calculateAverageHoursPerDay = (attendanceRecords) => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return 0;
  }

  const totalHours = attendanceRecords.reduce((sum, record) => sum + record.hoursLogged, 0);
  return totalHours / attendanceRecords.length;
};

