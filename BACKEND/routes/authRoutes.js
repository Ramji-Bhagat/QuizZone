const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();



// Register Route
router.post(
    "/register",
    [
        body("username").notEmpty(),
        body("password").isLength({ min: 6 }),
        body("role").optional().isIn(["admin", "user"])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { username, password, role } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({ username, password: hashedPassword, role });
            await newUser.save();

            res.status(201).json({ message: "User registered successfully" });
        } catch (err) {
            res.status(500).json({ error: "Server error" });
        }
    }
);

// Login Route
router.post(
    "/login",
    [
        body("username").notEmpty(),
        body("password").notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });

            if (!user || !(await bcrypt.compare(password, user.password)))
                return res.status(400).json({ error: "Invalid credentials" });

            const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.json({ token });
        } catch (err) {
            res.status(500).json({ error: "Server error" });
        }
    }
);

module.exports = router;
