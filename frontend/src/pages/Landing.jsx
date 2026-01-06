import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Internship Tracker</h1>
            <p className="text-gray-600">Simple and efficient way to track your internship hours</p>
          </div>
          
          <div className="space-y-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </Link>
                <div className="text-sm text-center">
                  <span className="text-gray-500">Don't have an account? </span>
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-gray-500">
        <p> {new Date().getFullYear()} Internship Tracker</p>
      </footer>
    </div>
  );
};

export default Landing;
