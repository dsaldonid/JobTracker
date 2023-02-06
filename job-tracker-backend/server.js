const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const authRoutes = require("./routes/altAuth")
const { NotFoundError } = require("./utils/errors")
const fs = require('fs')

const psClient = require('./psPool')

// Create instance of express application
const app = express()

// Enable cross-origin resource sharing for all origins
app.use(cors())

// Parse request with JSON payload
app.use(express.json())

// Log request throughout app
app.use(morgan("tiny"))

//Add routes for user authentication
require('./auth')(app);

// Add routes for non-google user authentication
app.use("/altAuth", authRoutes)

// Creating one route
app.get("/", async(req,res,next) =>{
    res.status(200).json({'ping':'pong'})
})

// If no routes are touched then we will get a 404 error
app.use((req, res, next) => {
    return next(new NotFoundError())
})

// Gives message on error as a responds if hit
app.use((err, req, res, next) => {
    const status = err.status || 500
    const message = err. message

    return res.status(status).json({
        error: { message, status },
    })
})

const PORT = 3001
app.listen(PORT, () => {
    console.log('Server listening in port ' + PORT)
})