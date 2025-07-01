import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const ContributeQuestion = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryFromURL = searchParams.get('category') || '';

  const [form, setForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    category: categoryFromURL,
    difficulty: '',
    explanation: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...form.options];
    updatedOptions[index] = value;
    setForm({ ...form, options: updatedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/quiz/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Question submitted for approval!');
        setForm({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          category: categoryFromURL,
          difficulty: '',
          explanation: '',
        });
      } else {
        setMessage(data.error || 'Failed to submit question');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Contribute a Question ({categoryFromURL})</h2>
        {message && <p className="text-center mb-4 text-blue-600">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Question</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              required
            />
          </div>

          {form.options.map((opt, index) => (
            <div key={index}>
              <label className="block mb-1 font-medium">Option {index + 1}</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 font-medium">Correct Answer</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={form.correctAnswer}
              onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Difficulty</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Category</label>
            <input
              className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
              value={form.category}
              disabled
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Explanation (optional)</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ContributeQuestion;
