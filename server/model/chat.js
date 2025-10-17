const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    senderID: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    senderEmail: { type: String },
    senderRole: { type: String },
    totalMessage: [{
        recieverData: [{
            recieverID: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
            senderMessage: { type: String },
            recieverMessage: { type: String },
            createdAt: { type: Date, default: Date.now }
        }]
    }]
})

module.exports = mongoose.model("chatDetail", chatSchema);