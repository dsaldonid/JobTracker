const express = require("express")
const cors = require("cors")
const morgan = require("morgan")

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

// Creating one route
app.get("/", async(req,res,next) =>{
    res.status(200).json({'ping':'pong'})
})
// Will change when we move our app to GCP
const port = 3000

app.listen(port, () => {
    console.log('Server listening in port ' + port)
})