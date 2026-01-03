import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import AttendanceModal from '../components/AttendanceModal';
import AttendanceList from '../components/AttendanceList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Attendance = () => {
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
    fetchCalendarData();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const response = await axios.get(`${API_URL}/attendance`, {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      });
      setAttendance(response.data.attendance);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await axios.get(`${API_URL}/attendance/calendar/${year}/${month}`);
      const data = {};
      response.data.attendance.forEach(item => {
        data[item.date] = item.hours;
      });
      setCalendarData(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingEntry = attendance.find(entry => {
      const entryDate = new Date(entry.date);
      const entryDateStr = format(entryDate, 'yyyy-MM-dd');
      return entryDateStr === dateStr;
    });
    if (existingEntry) {
      setEditingEntry(existingEntry);
    } else {
      setEditingEntry(null);
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    fetchAttendance();
    fetchCalendarData();
    setModalOpen(false);
    setEditingEntry(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`${API_URL}/attendance/${id}`);
        fetchAttendance();
        fetchCalendarData();
      } catch (error) {
        alert('Failed to delete entry');
      }
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const hours = calendarData[dateStr];
      
      if (hours) {
        return 'has-hours';
      }
      if (isToday(date)) {
        return 'today';
      }
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const hours = calendarData[dateStr];
      if (hours) {
        return (
          <div className="text-xs mt-1 font-semibold text-success">
            {hours.toFixed(1)}h
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-2 text-gray-600">Log and track your daily hours</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-md ${
              view === 'calendar'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md ${
              view === 'list'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center mb-6">
            <Calendar
              onChange={setCurrentMonth}
              value={currentMonth}
              onActiveStartDateChange={({ activeStartDate }) => {
                if (activeStartDate) {
                  setCurrentMonth(activeStartDate);
                }
              }}
              onClickDay={handleDateClick}
              tileClassName={tileClassName}
              tileContent={tileContent}
              className="w-full max-w-md mx-auto"
            />
          </div>
          <div className="mt-6 flex justify-center">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-success rounded"></div>
                <span>Hours logged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary rounded"></div>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <AttendanceList
          attendance={attendance}
          onEdit={(entry) => {
            setEditingEntry(entry);
            setSelectedDate(parseISO(entry.date));
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {modalOpen && (
        <AttendanceModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingEntry(null);
          }}
          date={selectedDate}
          entry={editingEntry}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Attendance;

