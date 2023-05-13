const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true,
    },
    UserId: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
})

module.exports = mongoose.model("Post", postSchema)