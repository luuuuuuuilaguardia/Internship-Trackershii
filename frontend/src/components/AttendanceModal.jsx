import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AttendanceModal = ({ isOpen, onClose, date, entry, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userConfig, setUserConfig] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    if (isOpen) {
      axios.get(`${API_URL}/user/config`)
        .then(response => {
          setUserConfig(response.data.config);
        })
        .catch(error => {
          console.error('Error fetching user config:', error);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (entry) {
      setValue('hoursLogged', entry.hoursLogged);
      setValue('startTime', entry.startTime || '');
      setValue('endTime', entry.endTime || '');
      setValue('notes', entry.notes || '');
    } else {
      const defaultStart = userConfig?.defaultStartTime || '08:00';
      const defaultEnd = userConfig?.defaultEndTime || '17:00';
      setValue('startTime', defaultStart);
      setValue('endTime', defaultEnd);
      setValue('hoursLogged', '');
      setValue('notes', '');
    }
  }, [entry, setValue, userConfig]);

  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      let diffMinutes = endMinutes - startMinutes;
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
      }
      let hours = diffMinutes / 60;
      
      if (userConfig?.lunchBreak?.enabled && userConfig.lunchBreak.hours) {
        hours = Math.max(0, hours - userConfig.lunchBreak.hours);
      }
      
      if (hours > 0 && hours <= 24) {
        setValue('hoursLogged', hours.toFixed(2));
      }
    }
  }, [startTime, endTime, setValue, userConfig]);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const payload = {
        date: dateStr,
        hoursLogged: parseFloat(data.hoursLogged),
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
        notes: data.notes || undefined
      };

      if (entry) {
        await axios.put(`${API_URL}/attendance/${entry._id}`, payload);
      } else {
        await axios.post(`${API_URL}/attendance`, payload);
      }

      onSave();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save entry');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`${API_URL}/attendance/${entry._id}`);
        onSave();
      } catch (error) {
        setError('Failed to delete entry');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {entry ? 'Edit Entry' : 'Log Hours'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="text"
              value={format(date, 'MMMM dd, yyyy')}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time (optional)
              </label>
              <input
                {...register('startTime', {
                  pattern: {
                    value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                    message: 'Invalid time format (HH:MM)'
                  }
                })}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time (optional)
              </label>
              <input
                {...register('endTime', {
                  pattern: {
                    value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                    message: 'Invalid time format (HH:MM)'
                  }
                })}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours Logged *
            </label>
            <input
              {...register('hoursLogged', {
                required: 'Hours are required',
                min: { value: 0, message: 'Hours cannot be negative' },
                max: { value: 24, message: 'Hours cannot exceed 24' }
              })}
              type="number"
              step="0.1"
              min="0"
              max="24"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            {errors.hoursLogged && (
              <p className="mt-1 text-sm text-red-600">{errors.hoursLogged.message}</p>
            )}
            {parseFloat(watch('hoursLogged') || 0) > 12 && (
              <p className="mt-1 text-sm text-warning">
                Warning: You're logging more than 12 hours
              </p>
            )}
            {userConfig?.lunchBreak?.enabled && startTime && endTime && (
              <p className="mt-1 text-sm text-gray-500">
                {userConfig.lunchBreak.hours} hour{userConfig.lunchBreak.hours !== 1 ? 's' : ''} lunch break deducted
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              {...register('notes', {
                maxLength: { value: 500, message: 'Notes cannot exceed 500 characters' }
              })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Add any notes about this day..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : entry ? 'Update' : 'Save'}
            </button>
            {entry && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;

