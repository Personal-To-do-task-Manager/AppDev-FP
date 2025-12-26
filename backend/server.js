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

let isConnected = false; 

const connectToDatabase = async () => {
    if (isConnected) return;
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
};

app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.post('/api/login', async (clientRequest, serverResponse) => {
    try {
        const { username, password } = clientRequest.body;
        let user = await UserAccountModel.findOne({ username });
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new UserAccountModel({
                username,
                password: hashedPassword
            });
            await user.save();
        } else {
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return serverResponse.status(401).json({ message: "Invalid credentials." });
            }
        }
        const sessionToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        serverResponse.json({ token: sessionToken, userId: user._id });

    } catch (error) {
        console.error(error);
        serverResponse.status(500).json({ message: "Server error during authentication." });
    }
});

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

module.exports = app;
