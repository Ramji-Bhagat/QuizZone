import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';

const QuizPage = () => {
  const { category } = useParams();
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [votes, setVotes] = useState({});


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`https://quizzone-backend-g4xm.onrender.com/api/quiz?category=${category}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setQuestions(data.filter(q => q.isApproved)); // Only approved
        setTimeLeft(data[0]?.timeLimit || 30);
      } catch (err) {
        console.error('Failed to load practice questions', err);
      }
    };

    fetchQuestions();
  }, [category, user]);

  useEffect(() => {
    if (showResult || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResult, questions, currentIndex]);

  useEffect(() => {
    const fetchVotes = async () => {
      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      try {
        const res = await fetch(`https://quizzone-backend-g4xm.onrender.com/api/votes/${currentQ._id}`);
        const data = await res.json();
        setVotes((prev) => ({
          ...prev,
          [currentQ._id]: {
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            voted: false,
          },
        }));
      } catch (err) {
        console.error('Failed to fetch vote counts:', err);
      }
    };

    fetchVotes();
  }, [currentIndex, questions]);

  const fetchVotesById = async (questionId) => {
    try {
      const res = await fetch(`https://quizzone-backend-g4xm.onrender.com/api/votes/${questionId}`);
      const data = await res.json();
      setVotes((prev) => ({
        ...prev,
        [questionId]: {
          ...data,
          voted: true,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch vote counts:", err);
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleNext = (autoAdvance = false) => {
    if (currentIndex >= questions.length) return;

    const currentQ = questions[currentIndex];
    const userAnswer = autoAdvance && selectedOption === null ? null : selectedOption;
    const isCorrect = userAnswer === currentQ.correctAnswer;

    if (isCorrect) setScore((prev) => prev + 1);

    const updatedAnswers = [
      ...answers,
      {
        question: currentQ.question,
        questionId: currentQ._id,
        selectedOption: userAnswer,
        correct: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        isCorrect,
      },
    ];
    setAnswers(updatedAnswers);

    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setTimeLeft(questions[nextIndex]?.timeLimit || 30);
    } else {
      setShowResult(true);
      const payload = {
        answers: updatedAnswers.map((ans) => ({
          questionId: ans.questionId,
          selectedOption: ans.selectedOption,
        })),
      };

      fetch('https://quizzone-backend-g4xm.onrender.com/api/quizAttempt/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Attempt submitted successfully:', data);
        })
        .catch((err) => {
          console.error('Failed to submit attempt:', err);
        });
    }
  };

  const handleVote = async (questionId, voteType) => {
    try {
      const res = await fetch(`https://quizzone-backend-g4xm.onrender.com/api/votes/${voteType}/${questionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Vote failed");
      }

      await fetchVotesById(questionId);
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const currentQ = questions[currentIndex];
  const currentVotes = votes[currentQ?._id] || { upvotes: 0, downvotes: 0, voted: false };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-200 py-12 px-4">
        {questions.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">Loading questions...</p>
        ) : showResult ? (
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-green-600 text-center mb-4">Quiz Completed!</h2>
            <p className="text-lg text-center mb-6">Your Score: {score} / {questions.length}</p>
            {answers.map((ans, idx) => (
              <div key={idx} className="p-4 mb-4 bg-gray-100 rounded shadow-sm">
                <p className="font-semibold text-gray-800">{idx + 1}. {ans.question}</p>
                <p className={`text-sm mt-1 ${ans.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  Your Answer: {ans.selectedOption || 'Not Answered'} — {ans.isCorrect ? 'Correct' : 'Wrong'}
                </p>
                {!ans.isCorrect && ans.correct && (
                  <p className="text-sm text-blue-700 mt-1">Correct Answer: {ans.correct}</p>
                )}
                {ans.explanation && (
                  <p className="text-sm text-gray-600 mt-1">Explanation: {ans.explanation}</p>
                )}

              </div>
            ))}
          </div>
        ) : currentQ ? (
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">
                Question {currentIndex + 1} of {questions.length}
              </h2>
              <span className="text-sm font-medium text-red-500">Time Left: {timeLeft}s</span>
            </div>
            <p className="text-lg font-medium text-gray-800 mb-6">{currentQ.question}</p>
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className={`w-full text-left px-4 py-3 rounded border transition-all duration-200 ${selectedOption === option
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-gray-100 hover:bg-indigo-100'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Vote buttons */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => handleVote(currentQ._id, 'upvote')}
                className="px-3 py-1 bg-green-200 rounded hover:bg-green-300"
              >
                ⬆️ {currentVotes.upvotes}
              </button>
              <button
                onClick={() => handleVote(currentQ._id, 'downvote')}
                className="px-3 py-1 bg-red-200 rounded hover:bg-red-300"
              >
                ⬇️ {currentVotes.downvotes}
              </button>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                disabled={selectedOption === null}
                onClick={() => handleNext(false)}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {currentIndex + 1 === questions.length ? 'Finish' : 'Next'}
              </button>
              <button
                onClick={() => handleNext(true)}
                className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-red-600 font-semibold">Invalid Question</p>
        )}
      </div>
    </Layout>
  );
};

export default QuizPage;
