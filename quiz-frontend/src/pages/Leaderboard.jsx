import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Leaderboard = () => {
  const { user } = useContext(AuthContext);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [todayLeaderboard, setTodayLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchLeaderboards();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://quizzone-backend-g4xm.onrender.com/api/quiz/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      const catQuery = selectedCategory ? `&category=${selectedCategory}` : "";
      const resAll = await fetch(`https://quizzone-backend-g4xm.onrender.com/api/quizAttempt/leaderboard?${catQuery}`);
      const resToday = await fetch(`https://quizzone-backend-g4xm.onrender.com/api/quizAttempt/leaderboard?today=true${catQuery}`);

      const dataAll = await resAll.json();
      const dataToday = await resToday.json();

      setAllTimeLeaderboard(dataAll);
      setTodayLeaderboard(dataToday);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const renderRow = (entry, index) => {
    const isCurrentUser = user?.username === entry.username;
    const medal = ["🥇", "🥈", "🥉"][index] || index + 1;

    return (
      <tr key={index} className={`text-center ${isCurrentUser ? "bg-green-100 font-semibold" : ""}`}>
        <td className="py-2 px-4">{medal}</td>
        <td className="py-2 px-4">{entry.username}</td>
        <td className="py-2 px-4">{entry.category}</td>
        <td className="py-2 px-4">{entry.totalScore}</td>
      </tr>
    );
  };

  const currentData = activeTab === "all" ? allTimeLeaderboard : todayLeaderboard;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🏆 Leaderboard</h1>

      {/* Time Toggle */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("all")}
        >
          All Time
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "today" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("today")}
        >
          Today
        </button>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-3 py-1 rounded-full ${selectedCategory === "" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          All
        </button>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full ${selectedCategory === cat ? "bg-green-500 text-white" : "bg-gray-200"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <table className="w-full bg-gray-500 shadow rounded-lg overflow-hidden">
        <thead className="bg-blue-100 text-blue-700">
          <tr>
            <th className="py-2 px-4">Rank</th>
            <th className="py-2 px-4">User</th>
            <th className="py-2 px-4">Category</th>
            <th className="py-2 px-4">Total Score</th>
          </tr>
        </thead>
        <tbody className="text-white">
          {currentData.length > 0 ? (
            currentData.map(renderRow)
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-100">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
