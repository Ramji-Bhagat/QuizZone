const express = require("express");
const Quiz = require("../models/quiz");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get all quizzes (Admin panel, or filtered)
router.get("/", async (req, res) => {
  try {
    const { category, tags, onlyApproved } = req.query;
    let filter = {};

    if (onlyApproved === "true") {
      filter.isApproved = true;
    }

    if (category) {
      filter.category = category;
    }

    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    const quizzes = await Quiz.find(filter);
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get approved questions for quiz attempt (for users)
router.get("/attempt", authMiddleware, async (req, res) => {
  try {
    const { category, tags, difficulty } = req.query;
    let filter = { isApproved: true };

    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(",") };
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Quiz.find(filter).limit(10); // You can change limit
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved questions" });
  }
});

// ✅ Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Quiz.distinct("category");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ✅ Admin: Add a new quiz
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

  try {
    const newQuiz = new Quiz(req.body);
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

// ✅ Admin: Delete quiz by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Admin: Update quiz by ID
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(updatedQuiz);
  } catch (err) {
    res.status(400).json({ error: "Failed to update quiz" });
  }
});

// ✅ User: Contribute a question
router.post("/contribute", authMiddleware, async (req, res) => {
  try {
    const newQuestion = new Quiz({
      ...req.body,
      createdBy: req.user.id,
      isApproved: false,
    });
    await newQuestion.save();
    res.status(201).json({ message: "Question submitted for approval" });
  } catch (err) {
    res.status(500).json({ error: "Failed to contribute question" });
  }
});

// ✅ Admin: View pending (unapproved) questions
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const pendingQuestions = await Quiz.find({ isApproved: false });
    res.json(pendingQuestions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending questions" });
  }
});

// ✅ Admin: Approve a question (PUT)
// router.put("/approve/:id", authMiddleware, async (req, res) => {
//   if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

//   try {
//     const approvedQuestion = await Quiz.findByIdAndUpdate(
//       req.params.id,
//       { isApproved: true },
//       { new: true }
//     );
//     res.json(approvedQuestion);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to approve question" });
//   }
// });


// 🔄 OPTIONAL: If you still want to support PATCH as well, uncomment this
router.patch("/approve/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

  try {
    const approvedQuestion = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.json(approvedQuestion);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve question" });
  }
});

// Admin rejects a question (deletes it)
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});


module.exports = router;
