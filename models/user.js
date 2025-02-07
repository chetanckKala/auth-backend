const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, min: [3, "Name should have a min length chatacter"]},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, },
    otpVerify: {type: String, default: ""},
    isVerified: {type: Boolean, default: false},
    otpVerifyExpires: {type: Number, default: 0},
    otpReset: {type: String, default: ""},
    otpResetExpires: {type: Number, default: 0},
})

const User = mongoose.model("User", userSchema)

module.exports = User