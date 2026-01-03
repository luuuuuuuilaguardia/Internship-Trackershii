import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Track Your Internship Progress
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Monitor your daily hours, calculate completion dates, and stay on track
            with your internship goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-primary px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary hover:bg-gray-50 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Track Hours</h3>
              <p className="text-gray-600">
                Log your daily internship hours with ease
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Smart Calendar</h3>
              <p className="text-gray-600">
                Visual calendar view with holiday tracking
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                See your completion date and progress metrics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

