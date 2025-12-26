const mongoose = require('mongoose');

const taskEntrySchema = new mongoose.Schema({
    // Link to the UserAccountModel
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String,
        trim: true 
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Low' 
    }
});

module.exports = mongoose.model('Task', taskEntrySchema);