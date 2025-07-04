import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminQuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    category: "",
    difficulty: "",
    timeLimit: 30,
    explanation: "",
    tags: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("/api/quiz");
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const handleAdd = async () => {
    const token = localStorage.getItem("token");
    try {
      const payload = {
        ...newQuestion,
        tags: newQuestion.tags.split(",").map(tag => tag.trim()), 
      };
      const res = await axios.post("/api/quiz", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuestions([...questions, res.data]);
      setNewQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        category: "",
        difficulty: "",
        timeLimit: 30,
        explanation: "",
        tags: "",
      });
    } catch (err) {
      console.error("Error adding question:", err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/quiz/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Error deleting question:", err);
    }
  };

  const handleEdit = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const q = questions.find((q) => q._id === id);
      const updated = {
        ...q,
        tags: typeof q.tags === "string" ? q.tags.split(",").map(t => t.trim()) : q.tags,
      };
      const res = await axios.put(`/api/quiz/${id}`, updated, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditingId(null);
    } catch (err) {
      console.error("Error editing question:", err);
    }
  };

  const updateField = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (id, index, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === id
          ? {
              ...q,
              options: q.options.map((opt, i) =>
                i === index ? value : opt
              ),
            }
          : q
      )
    );
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Admin Question Manager</h2>

      <div className="mb-6 border p-4 rounded shadow-md bg-cyan-800">
        <h3 className="text-lg font-medium mb-2">Add New Question</h3>
        <input
          type="text"
          placeholder="Question"
          value={newQuestion.question}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, question: e.target.value })
          }
          className="border p-2 rounded w-full mb-2 bg-sky-200"
        />
        {newQuestion.options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) =>
              setNewQuestion((prev) => {
                const newOptions = [...prev.options];
                newOptions[i] = e.target.value;
                return { ...prev, options: newOptions };
              })
            }
            className="border p-2 rounded w-full mb-2 bg-fuchsia-200"
          />
        ))}
        <input
          type="text"
          placeholder="Correct Answer"
          value={newQuestion.correctAnswer}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })
          }
          className="border p-2 rounded w-full mb-2 bg-green-200"
        />
        <input
          type="text"
          placeholder="Category"
          value={newQuestion.category}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, category: e.target.value })
          }
          className="border p-2 rounded w-full mb-2 bg-[#D4C9BE]"
        />
        <input
          type="text"
          placeholder="Difficulty (e.g., Easy, Medium, Hard)"
          value={newQuestion.difficulty}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, difficulty: e.target.value })
          }
          className="border p-2 rounded w-full mb-2 bg-[#FDFBEE]"
        />
        <input
          type="number"
          placeholder="Time Limit (in seconds)"
          value={newQuestion.timeLimit}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, timeLimit: parseInt(e.target.value) })
          }
          className="border p-2 rounded w-full mb-2 bg-indigo-100"
        />
        <textarea
          placeholder="Explanation"
          value={newQuestion.explanation}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, explanation: e.target.value })
          }
          className="border p-2 rounded w-full mb-2 bg-rose-200"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={newQuestion.tags}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, tags: e.target.value })
          }
          className="border p-2 rounded w-full mb-2 bg-cyan-200"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Question
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q) => (
          <div
            key={q._id}
            className="border p-4 rounded shadow-sm bg-gray-200"
          >
            {editingId === q._id ? (
              <div>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) =>
                    updateField(q._id, "question", e.target.value)
                  }
                  className="border p-2 w-full mb-2"
                />
                {q.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      updateOption(q._id, i, e.target.value)
                    }
                    className="border p-2 w-full mb-2"
                  />
                ))}
                <input
                  type="text"
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateField(q._id, "correctAnswer", e.target.value)
                  }
                  className="border p-2 w-full mb-2"
                />
                <input
                  type="text"
                  value={q.category}
                  onChange={(e) =>
                    updateField(q._id, "category", e.target.value)
                  }
                  className="border p-2 w-full mb-2"
                />
                <input
                  type="text"
                  value={q.difficulty}
                  onChange={(e) =>
                    updateField(q._id, "difficulty", e.target.value)
                  }
                  className="border p-2 w-full mb-2"
                />
                <input
                  type="number"
                  value={q.timeLimit}
                  onChange={(e) =>
                    updateField(q._id, "timeLimit", parseInt(e.target.value))
                  }
                  className="border p-2 w-full mb-2"
                />
                <textarea
                  value={q.explanation}
                  onChange={(e) =>
                    updateField(q._id, "explanation", e.target.value)
                  }
                  className="border p-2 w-full mb-2"
                />
                <input
                  type="text"
                  value={Array.isArray(q.tags) ? q.tags.join(", ") : q.tags}
                  onChange={(e) =>
                    updateField(q._id, "tags", e.target.value)
                  }
                  className="border p-2 w-full mb-2"
                />
                <button
                  onClick={() => handleEdit(q._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <p className="font-medium">{q.question}</p>
                <ul className="list-disc list-inside ml-2">
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
                <p className="text-sm mt-1">Answer: {q.correctAnswer}</p>
                <p className="text-sm">Category: {q.category}</p>
                <p className="text-sm">Difficulty: {q.difficulty}</p>
                <p className="text-sm">Time Limit: {q.timeLimit}s</p>
                <p className="text-sm">Tags: {Array.isArray(q.tags) ? q.tags.join(", ") : q.tags}</p>
                <p className="text-sm italic mb-2">Explanation: {q.explanation}</p>
                <button
                  onClick={() => setEditingId(q._id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQuestionManager;
