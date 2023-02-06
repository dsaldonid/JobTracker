const psPool = require('../psPool')
const bcrypt = require("bcrypt")
const { UnauthorizedError, BadRequestError } = require('../utils/errors')
const uuid = require('uuid-random');
const encryption_factor = 13

class User{
    static async login(credentials){
        // Make sure user is registering with required fields in database
        const requiredFields = [ "email", "password"]
        requiredFields.forEach(field => {
            if (!credentials.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body`)
            }
        })

        // Look up exisiting users in our db
        const existingUser = await User.fetchUserByEmail(credentials.email)
        
        if (existingUser) {
            // Compare existing user password to password entered
            const isValid = await bcrypt.compare(credentials.password, existingUser.password)
            if (isValid) {
                return existingUser
            }
        }
        return new BadRequestError("Invalid Log in")
    }

    static async register(credentials){
        // Make sure user is registering with required fields in database
        const requiredFields = [ "email", "password", "firstName", "lastName"]
        requiredFields.forEach(field => {
            if (!credentials.hasOwnProperty(field)) {
                throw new BadRequestError(`Missing ${field} in request body`)
            }
        })

        // Make sure user entered valid email
        if (credentials.email.indexOf("@") <= 0) {
            throw new BadRequestError("Invalid Email")
        }

        // Make sure that user registering has unique email
        const existingUser = await User.fetchUserByEmail(credentials.email)
        if (existingUser) {
            throw new BadRequestError(`Duplicate email: ${credentials.email}`)
        }

        // Hash input password
        const hashedPassword = await bcrypt.hash(credentials.password, encryption_factor)

        const email = credentials.email.toLowerCase()

        const query = `INSERT into app_user (
            "userId",
            email,
            password,
            "firstName",
            "lastName"
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING "userId", email, password, "firstName", "lastName"`

        const client = await psPool.connect()
        let user;
        try{
            const res = await client.query(query, [uuid(), email, hashedPassword, credentials.firstName, credentials.lastName])
            user = await res.rows[0]
        } catch (err) {
            throw new BadRequestError(err.message)
        } finally {
            client.release()
        }


        return user
    }

    static async fetchUserByEmail(email) {
        if (!email) {
            throw new BadRequestError("No email provided")
        }

        const query = `SELECT * FROM app_user WHERE email = $1`
        
        const client = await psPool.connect()
        let user;
        try{
            const res = await client.query(query, [email.toLowerCase()])
            user = res.rows[0]
        } catch (err) {
            console.log(err.stack)
        } finally {
            client.release()
        }

        return user
    }
}

module.exports = User;