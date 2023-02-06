require("dotenv").config()
require("colors")

const PORT = process.env.PORT ? Number(process.env.PORT) :3001

function getDbInfo(){
    const dbUser = process.env.DATABASE_USER || "postgres"
    const dbPass = process.env.DATABASE_PASS || "postgres"
    const dbHost = process.env.DATABASE_HOST || "localhost"
    const dbPort = process.env.DATABASE_PORT || 5432
    const dbName = process.env.DATABASE_NAME || "postgres"

    return process.env.DATABASE_URL || `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`
}


console.log("Job tracker Config".red)
console.log("PORT".blue, PORT)
console.log("Database Info".blue,getDbInfo())
console.log("-----")

module.exports ={
    PORT,
    getDbInfo
}