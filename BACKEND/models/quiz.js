const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  timeLimit: { type: Number, default: 30 }, // Default 30 seconds
  explanation: { type: String, default: "" },
  tags: { type: [String], default: [] }, // Example: ["recursion", "sorting"]
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

const Quiz = mongoose.model("Quiz", quizSchema);
module.exports = Quiz;

