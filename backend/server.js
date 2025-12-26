require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserAccountModel = require('./user');
const TaskEntryModel = require('./task');
const authenticationGuard = require('./auth');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch(err => console.log("Database Connection Error:", err));

// --- AUTHENTICATION: LOGIN ONLY ---
app.post('/api/login', async (clientRequest, serverResponse) => {
    try {
        const { username, password } = clientRequest.body;
        
        const existingUser = await UserAccountModel.findOne({ username });
        if (!existingUser) {
            return serverResponse.status(404).json({ message: "Account not found." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return serverResponse.status(401).json({ message: "Invalid credentials." });
        }

        const sessionToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
        serverResponse.json({ token: sessionToken });
    } catch (error) {
        serverResponse.status(500).json({ message: "Server error during login." });
    }
});

// --- TASK OPERATIONS ---

app.get('/api/tasks', authenticationGuard, async (clientRequest, serverResponse) => {
    const userSpecificTasks = await TaskEntryModel.find({ userId: clientRequest.user.id });
    serverResponse.json(userSpecificTasks);
});

app.post('/api/tasks', authenticationGuard, async (clientRequest, serverResponse) => {
    const newTask = new TaskEntryModel({ 
        ...clientRequest.body, 
        userId: clientRequest.user.id 
    });
    await newTask.save();
    serverResponse.json(newTask);
});

app.put('/api/tasks/:id', authenticationGuard, async (clientRequest, serverResponse) => {
    const modifiedTask = await TaskEntryModel.findOneAndUpdate(
        { _id: clientRequest.params.id, userId: clientRequest.user.id }, 
        clientRequest.body, 
        { new: true }
    );
    serverResponse.json(modifiedTask);
});

app.delete('/api/tasks/:id', authenticationGuard, async (clientRequest, serverResponse) => {
    await TaskEntryModel.findOneAndDelete({ 
        _id: clientRequest.params.id, 
        userId: clientRequest.user.id 
    });
    serverResponse.sendStatus(204);
});

const LISTENING_PORT = process.env.PORT || 5000;
app.listen(LISTENING_PORT, () => {
    console.log(`Task Manager Server active on port ${LISTENING_PORT}`);
});