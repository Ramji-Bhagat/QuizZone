const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  voteType: { type: String, enum: ["upvote", "downvote"], required: true },
}, { timestamps: true });

// Ensure a user can only vote once per question
VoteSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", VoteSchema);
