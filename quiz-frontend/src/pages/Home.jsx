import React from 'react'
import Layout from '../components/Layout'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
        {/* Background SVG Decoration */}
        <svg className="absolute left-0 top-0 transform -translate-x-1/2 -translate-y-1/2 opacity-20 blur-xl" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="300" fill="#3B82F6" />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto min-h-[calc(100vh-64px)]"
        >
          <div className="flex justify-center mb-4">
            <SparklesIcon className="w-12 h-12 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
            Welcome to QuizZone
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sharpen your mind. Test your knowledge. Compete on the leaderboard.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
              >
                Start Quiz
              </motion.button>
            </Link>

            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-xl hover:bg-blue-50 transition"
              >
                Login
              </motion.button>
            </Link>

            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-xl hover:bg-blue-50 transition"
              >
                Register
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default Home
