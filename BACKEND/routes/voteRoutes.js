const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");
const authenticateUser = require("../middleware/authMiddleware");

// POST /api/votes/upvote/:questionId
router.post("/upvote/:questionId", authenticateUser, async (req, res) => {
  const userId = req.user.userId;
  const questionId = req.params.questionId;

  try {
    const existingVote = await Vote.findOne({ userId, questionId });

    if (existingVote) {
      if (existingVote.voteType === "upvote") {
        return res.status(400).json({ message: "You already upvoted this question" });
      }

      existingVote.voteType = "upvote";
      await existingVote.save();
      return res.status(200).json({ message: "Vote updated to upvote" });
    }

    const newVote = new Vote({ userId, questionId, voteType: "upvote" });
    await newVote.save();
    res.status(201).json({ message: "Upvote registered" });
  } catch (error) {
    console.error("Upvote error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/votes/downvote/:questionId
router.post("/downvote/:questionId", authenticateUser, async (req, res) => {
  const userId = req.user.userId;
  const questionId = req.params.questionId;

  try {
    const existingVote = await Vote.findOne({ userId, questionId });

    if (existingVote) {
      if (existingVote.voteType === "downvote") {
        return res.status(400).json({ message: "You already downvoted this question" });
      }

      existingVote.voteType = "downvote";
      await existingVote.save();
      return res.status(200).json({ message: "Vote updated to downvote" });
    }

    const newVote = new Vote({ userId, questionId, voteType: "downvote" });
    await newVote.save();
    res.status(201).json({ message: "Downvote registered" });
  } catch (error) {
    console.error("Downvote error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/votes/:questionId
router.get("/:questionId", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const votes = await Vote.find({ questionId });

    const upvotes = votes.filter(v => v.voteType === "upvote").length;
    const downvotes = votes.filter(v => v.voteType === "downvote").length;

    res.json({ upvotes, downvotes });
  } catch (error) {
    console.error("Vote count fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
