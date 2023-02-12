const fs = require('fs')

const rawdata = fs.readFileSync('ps-credentials.json')
const dbCreds = JSON.parse(rawdata)

const { Pool } = require('pg')

const pool = new Pool({
    host: dbCreds.host,
    port: 5432,
    user: dbCreds.user,
    password: dbCreds.password
})

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

module.exports = pool