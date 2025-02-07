const mongoose = require("mongoose")
const uri = process.env.MONGO_URI

async function main () 
{
    await mongoose.connect(uri)
    console.log("mongo db connected")
}

module.exports = main