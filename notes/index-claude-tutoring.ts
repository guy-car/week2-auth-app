import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'

const app = new Elysia()
    // Step 1: Set up JWT with a secret key
    // essentially gives Elysia the secret key to be used later. 
    // we're giving it as an object called 'jwt' that has a 'name' and 'secret' property
    // Elysia server now has access to this objet with its secret
    // Now every route in your app can access these JWT abilities

    //More accurate:
    // We're giving Elysia a JWT plugin configuration. The name: 'jwt' tells Elysia "when I want to use JWT functions later, I'll access them through the name 'jwt'."
    // So it's less about creating an object called 'jwt', and more about telling Elysia "register these JWT capabilities under the name 'jwt'."

    .use(
        jwt({
            name: 'jwt',
            secret: 'your-super-secret-key-here' // In production, we would use a .env file
        })
    )

    // we assume that there is a form on the client side
    // this form collects a username and password
    // submitting the form triggers a POST request (below) with username and password in the request body
    
    .post('/login', async ({ jwt, body }) => { // we destructure the request object and keep only the body and jwt properties

        // at this stage, we could check in the DB that: 
        // username / password combination exists in the DB
        // but we'll skip that step for now

        const { username, password } = body 
        // the above can also be written as:
        // const username = body.username
        // const password = body.password

        //"I expect body to be an object"
        // "Extract the username property and put it in a variable called username"
        // "Extract the password property and put it in a variable called password"

        // Simple hardcoded check (replace with real authentication)

        // Real app would do something like:
        // const user = await database.findUser(username)
        // if (user && user.password === password) {
        // login successful }

        // here we assume that the DB has a username 'guillaume' with password '123'
        if (username === 'guillaume' && password === '123') {
            // Create a JWT token with user info
            const token = await jwt.sign({ 
                username: username,
                role: 'admin',
                userId: 1 
            })
            console.log('Token created! Token is :', token)
            
            return { 
                success: true, 
                token: token,
                message: 'Login successful! Use this token in your requests.'
            }
        }
        
        return { success: false, message: 'Invalid credentials' }
    }, {
        // Add schema validation for the request body
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    
    // Step 3: Create a protected route that requires the token
    .get('/protected', async ({ jwt, headers }) => {
        // Get the token from the Authorization header
        const authHeader = headers.authorization
        
        if (!authHeader) {
            return { error: 'No token provided. Send token in Authorization header.' }
        }
        
        // Verify the token
        const payload = await jwt.verify(authHeader)
        
        if (!payload) {
            return { error: 'Invalid or expired token' }
        }
        
        // Token is valid! Return protected data
        return { 
            message: 'Access granted!', 
            user: payload,
            secretData: 'This is protected information'
        }
    })
    
    // Step 4: A public route (no authentication needed)
    .get('/', () => {
        return { 
            message: 'This is public - no authentication needed',
            instructions: {
                step1: 'POST to /login with {"username": "admin", "password": "password123"}',
                step2: 'Copy the token from the response',
                step3: 'Send GET to /protected with Authorization header containing the token'
            }
        }
    })
    
    .listen(3000)

console.log('🦊 Server running on http://localhost:3000')
console.log('Try these steps:')
console.log('1. POST http://localhost:3000/login with body: {"username": "admin", "password": "password123"}')
console.log('2. Copy the token from response')
console.log('3. GET http://localhost:3000/protected with Authorization header: <your-token>')