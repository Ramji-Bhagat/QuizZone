const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  questions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      selectedOption: String,
      isCorrect: Boolean,
    },
  ],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attempt", AttemptSchema);
