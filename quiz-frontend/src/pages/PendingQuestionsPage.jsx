import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const PendingQuestionsPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/quiz/pending', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setQuestions(res.data);
        } catch (error) {
            console.error('Error fetching pending questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id, approved) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `/api/quiz/approve/${id}`,
                { approved },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Remove the question from UI after action
            setQuestions((prev) => prev.filter((q) => q._id !== id));
        } catch (error) {
            console.error('Error updating approval:', error);
        }
    };

    const handleReject = async (id) => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`/api/quiz/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setQuestions((prev) => prev.filter((q) => q._id !== id));
        } catch (err) {
          console.error("Error rejecting question:", err);
        }
      };
      

    useEffect(() => {
        fetchPendingQuestions();
    }, []);

    return (
        <Layout>
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Pending Questions</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : questions.length === 0 ? (
                    <p>No pending questions.</p>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q) => (
                            <div key={q._id} className="bg-white p-4 rounded shadow">
                                <h3 className="text-lg font-semibold">{q.question}</h3>
                                <ul className="list-disc list-inside mt-2">
                                    {q.options.map((opt, idx) => (
                                        <li
                                            key={idx}
                                            className={
                                                opt === q.correctAnswer
                                                    ? 'text-green-700 font-medium'
                                                    : ''
                                            }
                                        >
                                            {opt}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-2 text-sm text-gray-600">
                                    Explanation: {q.explanation}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Category: {q.category}</p>
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => handleApproval(q._id, true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(q._id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PendingQuestionsPage;
