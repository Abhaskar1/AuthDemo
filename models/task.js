const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
})
const Task = mongoose.model("Task", taskSchema)
module.exports = Task