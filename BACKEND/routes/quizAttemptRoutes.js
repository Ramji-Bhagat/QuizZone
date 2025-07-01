const express = require("express");
const Quiz = require("../models/quiz");
const Attempt = require("../models/attempt");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();


// Route to get quiz attempt history for a user
router.get("/history", authenticateUser, async (req, res) => {
    try {
        const { category } = req.query; // Optional category filter
        let filter = { userId: req.user.userId };

        if (category) {
            filter.category = category; // Filter by category if provided
        }

        const attempts = await Attempt.find(filter)
            .populate("questions.questionId", "question options") // Populate question details
            .sort({ createdAt: -1 }); // Sort by most recent attempts

        res.json({ history: attempts });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

// Route to start a quiz attempt
router.get("/attempt", authenticateUser, async (req, res) => {
    try {
        const { category, limit = 5 } = req.query;
        let filter = {};
        if (category) {
            filter.category = category;
        }

        const questions = await Quiz.find(filter).limit(parseInt(limit)).select("-correctAnswer");
        res.json({ questions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Route to submit quiz answers and calculate score
router.post("/submit", authenticateUser, async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: "Invalid request data" });
        }

        let score = 0;
        let correctAnswers = [];
        let category = "";
        const questions = [];

        for (let answer of answers) {
            const quiz = await Quiz.findById(answer.questionId);
            if (!quiz) continue;

            const isCorrect = quiz.correctAnswer === answer.selectedOption;
            if (isCorrect) score++;
            correctAnswers.push({ questionId: answer.questionId, selectedOption: answer.selectedOption, isCorrect });

            if (!category) category = quiz.category;

            questions.push({
                questionId: answer.questionId,
                selectedOption: answer.selectedOption,
                isCorrect
            });
        }

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: "Unauthorized request" });
        }

        // ✅ Check if this user already attempted this category before
        const previousAttempt = await Attempt.findOne({
            userId: req.user.userId,
            category
        });

        // Save the new attempt regardless (we want to track all attempts)
        const attempt = new Attempt({
            userId: req.user.userId,
            category,
            questions,
            score,
            totalQuestions: answers.length
        });

        await attempt.save();

        // Inform frontend if this was first attempt or not
        const firstAttempt = !previousAttempt;

        res.json({
            message: "Quiz submitted successfully!",
            score,
            totalQuestions: answers.length,
            correctAnswers,
            firstAttempt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/leaderboard", async (req, res) => {
    try {
      const { category, today } = req.query;
      const matchStage = {};
  
      if (category) {
        matchStage.category = category;
      }
  
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
  
      // If today=true, fetch only users whose first attempt in category is today
      if (today === "true") {
        const attempts = await Attempt.aggregate([
          // Step 1: Match today's attempts by category
          {
            $match: {
              ...matchStage,
              createdAt: { $gte: todayStart }
            }
          },
          // Step 2: Sort by creation date (earliest first)
          { $sort: { createdAt: 1 } },
          // Step 3: Group to get only the first attempt per user/category
          {
            $group: {
              _id: { userId: "$userId", category: "$category" },
              firstAttemptDate: { $first: "$createdAt" },
              score: { $first: "$score" },
              attemptId: { $first: "$_id" }
            }
          },
          // Step 4: Filter out users who had previous attempt before today
          {
            $lookup: {
              from: "attempts",
              let: { userId: "$_id.userId", category: "$_id.category", todayStart: todayStart },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$userId", "$$userId"] },
                        { $eq: ["$category", "$$category"] },
                        { $lt: ["$createdAt", "$$todayStart"] }
                      ]
                    }
                  }
                }
              ],
              as: "previousAttempts"
            }
          },
          // Step 5: Only keep users who have no earlier attempts
          {
            $match: {
              previousAttempts: { $size: 0 }
            }
          },
          // Step 6: Sort by score descending
          { $sort: { score: -1 } },
          { $limit: 10 },
          // Step 7: Join with users collection to get usernames
          {
            $lookup: {
              from: "users",
              localField: "_id.userId",
              foreignField: "_id",
              as: "userDetails"
            }
          },
          { $unwind: "$userDetails" },
          {
            $project: {
              _id: 0,
              username: "$userDetails.username",
              category: "$_id.category",
              totalScore: "$score"
            }
          }
        ]);
  
        return res.json(attempts);
      }
  
      // 🟢 Normal leaderboard (all time, first attempt per user/category)
      const leaderboard = await Attempt.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: { userId: "$userId", category: "$category" },
            score: { $first: "$score" }
          }
        },
        { $sort: { score: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id.userId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 0,
            username: "$userDetails.username",
            category: "$_id.category",
            totalScore: "$score"
          }
        }
      ]);
  
      res.json(leaderboard);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
  


module.exports = router;
