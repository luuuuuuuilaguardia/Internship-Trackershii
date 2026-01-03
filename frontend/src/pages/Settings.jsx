import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { API_URL } from '../utils/api.js';

const Settings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [holidayCalendarOpen, setHolidayCalendarOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const excludeSaturday = watch('excludeSaturday');
  const excludeSunday = watch('excludeSunday');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/config`);
      const configData = response.data.config;
      setConfig(configData);
      
      setValue('targetHours', configData.targetHours || 500);
      setValue('startDate', configData.startDate ? new Date(configData.startDate) : null);
      setValue('excludeSaturday', configData.excludeWeekends?.saturday || false);
      setValue('excludeSunday', configData.excludeWeekends?.sunday || false);
      setValue('excludedWeekdays', configData.excludedWeekdays || []);
      setValue('lunchBreakEnabled', configData.lunchBreak?.enabled || false);
      setValue('lunchBreakHours', configData.lunchBreak?.hours || 1);
      setValue('defaultStartTime', configData.defaultStartTime || '08:00');
      setValue('defaultEndTime', configData.defaultEndTime || '17:00');
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load configuration');
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        targetHours: parseInt(data.targetHours),
        startDate: data.startDate ? data.startDate.toISOString() : undefined,
        excludeWeekends: {
          saturday: data.excludeSaturday || false,
          sunday: data.excludeSunday || false
        },
        excludedWeekdays: data.excludedWeekdays || [],
        holidays: config?.holidays?.map(h => new Date(h).toISOString()) || [],
        lunchBreak: {
          enabled: data.lunchBreakEnabled || false,
          hours: parseFloat(data.lunchBreakHours) || 1
        },
        defaultStartTime: data.defaultStartTime || '08:00',
        defaultEndTime: data.defaultEndTime || '17:00'
      };

      await axios.put(`${API_URL}/user/config`, payload);
      setSuccess('Configuration saved successfully!');
      fetchConfig();
      setSaving(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save configuration');
      setSaving(false);
    }
  };

  const toggleHoliday = (date) => {
    const dateStr = date.toISOString();
    const holidays = config?.holidays || [];
    const holidayDates = holidays.map(h => new Date(h).toISOString());
    
    let newHolidays;
    if (holidayDates.includes(dateStr)) {
      newHolidays = holidays.filter(h => new Date(h).toISOString() !== dateStr);
    } else {
      newHolidays = [...holidays, date];
    }

    setConfig({ ...config, holidays: newHolidays });
  };

  const saveHolidays = async () => {
    try {
      await axios.put(`${API_URL}/user/config`, {
        holidays: config.holidays.map(h => new Date(h).toISOString())
      });
      setSuccess('Holidays saved successfully!');
      setHolidayCalendarOpen(false);
    } catch (error) {
      setError('Failed to save holidays');
    }
  };

  const tileClassName = ({ date }) => {
    if (!config?.holidays) return null;
    const isHoliday = config.holidays.some(holiday =>
      isSameDay(new Date(holiday), date)
    );
    return isHoliday ? 'holiday' : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Configure your internship parameters</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Target Hours</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Required Hours
            </label>
            <input
              {...register('targetHours', {
                required: 'Target hours are required',
                min: { value: 1, message: 'Must be at least 1 hour' },
                valueAsNumber: true
              })}
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            {errors.targetHours && (
              <p className="mt-1 text-sm text-red-600">{errors.targetHours.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Start Date</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internship Start Date
            </label>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: 'Start date is required' }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  maxDate={new Date()}
                  dateFormat="MMMM dd, yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholderText="Select start date"
                />
              )}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Working Days</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                {...register('excludeSaturday')}
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700">Exclude Saturdays</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('excludeSunday')}
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700">Exclude Sundays</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Default Work Hours</h2>
          <p className="text-sm text-gray-600 mb-4">
            These times will be pre-filled when logging attendance
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Start Time
              </label>
              <input
                {...register('defaultStartTime', {
                  pattern: {
                    value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                    message: 'Invalid time format (HH:MM)'
                  }
                })}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.defaultStartTime && (
                <p className="mt-1 text-sm text-red-600">{errors.defaultStartTime.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default End Time
              </label>
              <input
                {...register('defaultEndTime', {
                  pattern: {
                    value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                    message: 'Invalid time format (HH:MM)'
                  }
                })}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.defaultEndTime && (
                <p className="mt-1 text-sm text-red-600">{errors.defaultEndTime.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Lunch Break</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                {...register('lunchBreakEnabled')}
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700">Enable lunch break deduction</span>
            </label>
            {watch('lunchBreakEnabled') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lunch Break Duration (hours)
                </label>
                <input
                  {...register('lunchBreakHours', {
                    min: { value: 0, message: 'Must be 0 or greater' },
                    max: { value: 8, message: 'Cannot exceed 8 hours' },
                    valueAsNumber: true
                  })}
                  type="number"
                  step="0.25"
                  min="0"
                  max="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                {errors.lunchBreakHours && (
                  <p className="mt-1 text-sm text-red-600">{errors.lunchBreakHours.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  This will be automatically deducted from calculated work hours
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Holidays</h2>
            <button
              type="button"
              onClick={() => setHolidayCalendarOpen(!holidayCalendarOpen)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              {holidayCalendarOpen ? 'Hide Calendar' : 'Select Holidays'}
            </button>
          </div>
          {holidayCalendarOpen && (
            <div className="mt-4">
              <div className="flex justify-center mb-4">
                <Calendar
                  onClickDay={toggleHoliday}
                  tileClassName={tileClassName}
                  className="w-full max-w-md mx-auto"
                />
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Click dates to mark/unmark as holidays. Selected holidays:
                </p>
                <div className="flex flex-wrap gap-2">
                  {config?.holidays?.map((holiday, index) => (
                    <span
                      key={index}
                      className="bg-primary text-white px-3 py-1 rounded-full text-sm"
                    >
                      {format(new Date(holiday), 'MMM dd, yyyy')}
                      <button
                        type="button"
                        onClick={() => toggleHoliday(new Date(holiday))}
                        className="ml-2 hover:text-red-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {(!config?.holidays || config.holidays.length === 0) && (
                    <span className="text-gray-500 text-sm">No holidays selected</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={saveHolidays}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Holidays
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

