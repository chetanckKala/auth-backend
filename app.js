const express = require("express")
const app = express()
const dotenv = require("dotenv")
dotenv.config()
const port = process.env.PORT
const connect = require("./config/db.js")
const userRoutes = require("./routes/user.js")
const cors = require("cors")
const allowedOrigins = ["*", 'https://auth-frontend-hazel.vercel.app']
const cookiParser = require("cookie-parser")


// setup
connect()
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://auth-frontend-hazel.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({origin: allowedOrigins, credentials: true}))
app.use(cookiParser())


// routing
app.use("/", userRoutes)


app.listen(port, ()=> {console.log("server activated on port", port)})