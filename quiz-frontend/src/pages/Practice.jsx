// src/pages/Practice.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const Practice = () => {
  const { category } = useParams();
  const { user } = useContext(AuthContext);

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`https://quizzone-backend-g4xm.onrender.com/api/quiz?category=${category}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setQuestions(data.filter(q => q.isApproved)); // Only approved
      } catch (err) {
        console.error('Failed to load practice questions', err);
      }
    };

    fetchQuestions();
  }, [category, user]);

  const currentQuestion = questions[currentIdx];

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowResult(true);
    setIsCorrect(option === currentQuestion.correctAnswer);
  };

  const handleNext = () => {
    setSelectedOption('');
    setShowResult(false);
    setIsCorrect(null);
    setCurrentIdx(prev => prev + 1);
  };

  if (!currentQuestion) return <Layout><p className="p-6">Loading or no questions found.</p></Layout>;

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(option)}
              disabled={showResult}
              className={`px-4 py-2 border rounded ${
                showResult
                  ? option === currentQuestion.correctAnswer
                    ? 'bg-green-200 border-green-600'
                    : option === selectedOption
                    ? 'bg-red-200 border-red-600'
                    : 'bg-gray-100'
                  : 'hover:bg-blue-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {showResult && (
          <div className="mt-4">
            <p className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </p>
            <p className="mt-2 text-gray-700"><strong>Explanation:</strong> {currentQuestion.explanation || 'No explanation provided.'}</p>
            {currentIdx + 1 < questions.length ? (
              <button
                onClick={handleNext}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next Question
              </button>
            ) : (
              <p className="mt-4 text-lg font-semibold text-purple-600">You’ve completed all practice questions.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Practice;
