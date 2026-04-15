const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log(err));

// --- TASK MODEL (Updated with description) ---
const TaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String }, // <--- YE LINE MISSING THI, ISE ADD KAREIN
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now } // Date ke liye ye bhi add kar dein
});
const Task = mongoose.model('Task', TaskSchema);

// --- AUTH ROUTES ---

// Signup
app.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.json({ msg: "User registered successfully" });
    } catch (err) {
        res.status(500).send("Server Error: " + err.message);
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name } });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// --- TASK ROUTES ---

// Get tasks (Specific to user)
app.get('/tasks/:userId', async (req, res) => {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
});

// Add task
app.post('/tasks', async (req, res) => {
    console.log("Data received at backend:", req.body);
    try {
        const { userId, title, description } = req.body; // description nikalen req.body se
        if (!userId || !title) {
            return res.status(400).json({ msg: "UserId and Title are required" });
        }
        const newTask = new Task({ userId, title, description });
        await newTask.save();
        res.json(newTask);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// Task update karne ka sahi rasta (Route)
app.put('/tasks/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description },
            { new: true }
        );
        res.json(updatedTask);
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).send("Server Error");
    }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task Deleted" });
});

// SERVER LISTEN (Hamesha Last mein)
app.listen(5000, () => console.log("Server running on port 5000"));