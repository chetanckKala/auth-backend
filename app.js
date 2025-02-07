const express = require("express")
const app = express()
const dotenv = require("dotenv")
dotenv.config()
const port = process.env.PORT
const connect = require("./config/db.js")
const userRoutes = require("./routes/user.js")
const cors = require("cors")
const allowedOrigins = ["*"]
const cookiParser = require("cookie-parser")


// setup
connect()
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({origin: allowedOrigins, credentials: true}))
app.use(cookiParser())


// routing
app.use("/api/user", userRoutes)


app.listen(port, ()=> {console.log("server activated on port", port)})