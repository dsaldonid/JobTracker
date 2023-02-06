const { Client } = require('pg')
const { getDbInfo } = require('./config')
require("colors")

const db = new Client({ connectionString: getDbInfo() })

db.connect((err) => {
    if(err){
        console.log("Connection error".red, err.stack)
    } else{
        console.log("Successfully connected to GCP database!".green)
    }
})

module.exports = db