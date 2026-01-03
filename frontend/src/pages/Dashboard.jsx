import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/api.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance/stats`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load statistics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const progressPercentage = Math.min(100, stats.progressPercentage);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progressPercentage / 100) * circumference;

  const milestones = [
    { label: '25%', target: stats.targetHours * 0.25 },
    { label: '50%', target: stats.targetHours * 0.5 },
    { label: '75%', target: stats.targetHours * 0.75 },
    { label: '100%', target: stats.targetHours }
  ].filter(m => stats.totalHours < m.target);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Track your internship progress</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overall Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="text-primary transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {progressPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Target</span>
                <span className="font-semibold">{stats.targetHours} hours</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Hours Completed</span>
                <span className="font-semibold text-success">
                  {stats.totalHours.toFixed(1)} hours ({progressPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Hours Remaining</span>
                <span className="font-semibold">{stats.hoursRemaining.toFixed(1)} hours</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Average Daily Hours</span>
                <span className="font-semibold">{stats.averageHoursPerDay.toFixed(1)} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Completion</span>
                <span className="font-semibold">
                  {format(new Date(stats.completionDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {stats.workingDaysRemaining} working days remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Hours</span>
              <span className="font-semibold text-xl">{stats.thisWeek.hours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days</span>
              <span className="font-semibold">{stats.thisWeek.days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average</span>
              <span className="font-semibold">{stats.thisWeek.average.toFixed(1)} hrs/day</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Hours</span>
              <span className="font-semibold text-xl">{stats.thisMonth.hours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days</span>
              <span className="font-semibold">{stats.thisMonth.days}</span>
            </div>
            {stats.previousMonth.hours > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">vs Last Month</span>
                <span className={`font-semibold ${
                  stats.thisMonth.hours > stats.previousMonth.hours ? 'text-success' : 'text-gray-600'
                }`}>
                  {stats.thisMonth.hours > stats.previousMonth.hours ? '+' : ''}
                  {(stats.thisMonth.hours - stats.previousMonth.hours).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Entries</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Days Logged</span>
              <span className="font-semibold text-xl">{stats.totalEntries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Hours</span>
              <span className="font-semibold">{stats.totalHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg per Entry</span>
              <span className="font-semibold">
                {stats.totalEntries > 0
                  ? (stats.totalHours / stats.totalEntries).toFixed(1)
                  : '0.0'}{' '}
                hrs
              </span>
            </div>
          </div>
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Milestones</h2>
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const hoursNeeded = milestone.target - stats.totalHours;
              const daysNeeded = stats.averageHoursPerDay > 0
                ? Math.ceil(hoursNeeded / stats.averageHoursPerDay)
                : 0;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-semibold text-lg">{milestone.label} Complete</span>
                    <div className="text-sm text-gray-600">
                      {hoursNeeded.toFixed(1)} hours remaining
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      ~{daysNeeded} days at current pace
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/attendance"
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Log Hours
          </Link>
          <Link
            to="/settings"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Update Settings
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-2">Smart Predictions</h2>
        <p className="text-gray-600 italic">Coming soon: AI-based completion date prediction and pace analysis</p>
      </div>
    </div>
  );
};

export default Dashboard;

