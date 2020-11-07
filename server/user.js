const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    rotation: {
        type: Number,
        required: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        requried: true
    },
    playerId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);