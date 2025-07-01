import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import dbmsImg from '../assets/dbms.jpg';
import cnImg from '../assets/cn.jpg';
import osImg from '../assets/os.jpg';
import gkImg from '../assets/gk.jpg';
import scienceImg from '../assets/science.jpg';
import mathsImg from '../assets/maths.jpg';

const categories = [
  {
    name: 'DBMS',
    description: 'Test your knowledge on Database Management Systems',
    image: dbmsImg,
  },
  {
    name: 'CN',
    description: 'Assess your understanding of Computer Networks',
    image: cnImg,
  },
  {
    name: 'OS',
    description: 'Evaluate your skills in Operating Systems',
    image: osImg,
  },
  {
    name: 'Math',
    description: 'Challenge your Mathematics proficiency',
    image: mathsImg,
  },
  {
    name: 'GK',
    description: 'General Knowledge quizzes to keep you sharp',
    image: gkImg,
  },
  {
    name: 'Science',
    description: 'Unlock the secrets of science! Get ready to quiz!',
    image: scienceImg,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleTakeTest = (category) => {
    navigate(`/quiz/${category}`);
  };

  const handleContribute = (category) => {
    navigate(`/contribute?category=${encodeURIComponent(category)}`);
  };

  return (
    <Layout>
      <div className="p-4">
        {/* Top bar */}
        <div className="bg-gray-300 flex flex-col sm:flex-row sm:flex-wrap gap-2 justify-between items-start sm:items-center mb-6 px-4 py-3 rounded">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex flex-wrap gap-3 mt-2 sm:mt-0">
            <button
              onClick={() => navigate('/history')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-900"
            >
              History
            </button>

            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900"
            >
              Leaderboard
            </button>

            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Admin
                </button>

                <button
                  onClick={() => navigate('/pending-questions')}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                  Pending Questions
                </button>
              </>
            )}


            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-cyan-100 border border-cyan-400 p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col"
            >
              {/* Image box */}
              <div className="h-48 w-full overflow-hidden rounded mb-4">
                {category.image && (
                  <img
                    src={category.image}
                    alt={`${category.name} icon`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <h2 className="text-xl font-semibold text-gray-700">{category.name}</h2>
              <p className="text-gray-600 mt-2 text-sm flex-grow">{category.description}</p>

              <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:gap-3">
                <button
                  onClick={() => handleTakeTest(category.name)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Take Test
                </button>
                <button
                  onClick={() => navigate(`/practice/${category.name}`)}
                  className="w-50 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
                >
                  Practice
                </button>

                <button
                  onClick={() => handleContribute(category.name)}
                  className="flex-1 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition"
                >
                  Contribute
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
