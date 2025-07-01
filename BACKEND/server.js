const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); 
const quizRoutes = require("./routes/quizRoutes");
const authRoutes = require("./routes/authRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");
const voteRoutes = require('./routes/voteRoutes');

const app = express();

// ✅ Enable CORS for frontend origin
app.use(cors({
  origin: "*", // your Vite dev server
  credentials: true
}));

app.use(express.json());

// ✅ Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/quizDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use("/api/quiz", quizRoutes);
app.use("/api/quizAttempt", quizAttemptRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/votes", voteRoutes);


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
