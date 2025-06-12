import swagger from "@elysiajs/swagger";
import { Elysia, t, status } from "elysia";
import { jwt } from '@elysiajs/jwt'


const PORT = 3000

const SECRET = process.env.SECRET || 'fallback-secret-for-development'

const users = [
  { id: 1, username: 'guillaume', password: '123', role: 'admin'},
  { id: 2, username: 'user', password: 'user123', role: 'basic'}
]

const authPlugin = new Elysia()
    .derive({ as: 'scoped'}, ({ headers }) => {
        
        const { username, password } = headers

        if (!username || !password) {
            return { isAuthenticated: false, user: null }
        }

        const user = users.find(u => u.username === username && u.password === password)

        if (user) {
            return { isAuthenticated: true, user: user}
        } else {
            return { isAuthenticated: false, user: null }
        }
    })

const jwtPlugin = new Elysia()
    .use(
        jwt({
            name: 'jwt',
            secret: SECRET
        })
    )
    const login = new Elysia()
    .use(authPlugin)
    .use(jwtPlugin)
    .post('/login', async (context) => {
    const { jwt, isAuthenticated, user } = context as any

    if (!isAuthenticated) {
        return status(401)
    }
        const token = await jwt.sign({ 
            id: user.id,
            username: user.username,
            role: user.role
        })
        return { success: true, token: token, message: 'welcome to the promised land!'}
    })

const protectedPlugin = new Elysia()
    .use(jwtPlugin)
    .derive({ as: 'scoped' }, async ({ headers, jwt }) => {
        const authHeader = headers.authorization

        if (!authHeader) {
            return { isTokenValid: false, tokenUser: null }
        }
        // Verify the JWT token
        const payload = await jwt.verify(authHeader)
        
        if (payload) {
            return { isTokenValid: true, tokenUser: payload }
        } else {
            return { isTokenValid: false, tokenUser: null }
        }

    })

const protectedRoutes = new Elysia()
    .use(protectedPlugin)
    .get('/protected', (context) => {
        const { isTokenValid, tokenUser } = context as any

        if (!isTokenValid) {
            return status(401)
        }
        
        return { 
            message: 'Access granted!', 
            user: tokenUser,
            secretData: 'This is protected information'
        }
    })

const app = new Elysia()
  .use(swagger())
  .get('/', () => {
    return { message: "this is public hello world" }
  })
  .use(login)
  .use(protectedRoutes)
  .listen(PORT)

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

