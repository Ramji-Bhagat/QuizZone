import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";

const HistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [attempts, setAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/quizAttempt/history`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await res.json();
      setAttempts(data.history);

      // Extract unique categories
      const uniqueCategories = [...new Set(data.history.map(a => a.category))];
      setCategories(uniqueCategories);
      setFilteredAttempts(data.history);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat);
    if (cat === "") {
      setFilteredAttempts(attempts);
    } else {
      setFilteredAttempts(attempts.filter((a) => a.category === cat));
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-300 min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-center">Quiz Attempt History</h2>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${selectedCategory === "" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => handleCategoryFilter("")}
          >
            All
          </button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded ${
                selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => handleCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredAttempts.length === 0 ? (
          <p className="text-center text-gray-500">No attempts found.</p>
        ) : (
          filteredAttempts.map((attempt, i) => (
            <div key={i} className="bg-blue-100 p-4 rounded shadow mb-6">
              <h3 className="font-bold mb-2">
                Attempted on {new Date(attempt.createdAt).toLocaleString()} — Score:{" "}
                {attempt.score}/{attempt.totalQuestions} — Category: {attempt.category}
              </h3>
              {attempt.questions.map((q, idx) => (
                <div key={idx} className="mb-3 pl-4">
                  <p className="font-medium">{idx + 1}. {q.questionId?.question}</p>
                  <ul className="list-disc ml-6">
                    {q.questionId?.options.map((opt, index) => {
                      const isSelected = q.selectedOption === opt;
                      const isCorrect = q.isCorrect && isSelected;
                      const optionClass = isSelected
                        ? isCorrect
                          ? "text-green-600 font-semibold"
                          : "text-red-500 font-semibold"
                        : "text-gray-700";
                      return (
                        <li key={index} className={optionClass}>
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;
