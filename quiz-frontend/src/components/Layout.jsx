import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-blue-600 p-4 text-white text-xl font-bold">QuizZone - A crowd-sourced Competitive Exam Question Aggregator and Practicing platform</header>
      <main className="p-4">{children}</main>
    </div>
  )
}

export default Layout
