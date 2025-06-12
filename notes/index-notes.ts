import swagger from "@elysiajs/swagger";
import { Elysia, status } from "elysia";

const PORT = 3000

// Simple API key store (use database in production)
const validApiKeys = new Set(['api-key-123', 'api-key-456'])

// add a system for issuing api key

const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "basic" },
  { id: 3, username: "user", password: "test123", role: "admin" },
  { id: 4, username: "user", password: "tsdfsdft123", role: "admin" },
  { id: 5, username: "user", password: "tessdfsdf", role: "admin" },
  { id: 6, username: "user", password: "tesdsdfsdfsdfst123", role: "admin" },
  { id: 7, username: "user", email: 'ajroberts0417@gmail.com', password: "tesdfsdfsdfdst123", role: "admin" }
];

const protectedRoutesAlt = new Elysia()
  .derive({ as: 'local' }, (request) => {
    return { user: { name: 'guillaume', role: 'admin' }, isAuthenticated: true }
  })
  .onBeforeHandle((req) => {
    const headers = req.headers

    // who is this user now?
    // LIST ALL THE OPTIONS:
    // 1. the user who has the email that matches the email provided in the headers['email']
    // 2. undefined
    const user = users.find(user => user.email === headers['email'])
    if(!user) return status(401)
      console.log('user has an existing email in DB');
    
      // this user exists.
    const isPasswordCorrect = user.password === headers['password']
    if(!isPasswordCorrect) return status(401)

    // the user exists and is identified, but what role are they?
    const isAdmin = user.role === 'admin'
    if(!isAdmin) return status(403)

  })
  // .onBeforeHandle({ as: 'local' }, (request) => {
  //   const headers = request.headers
  //   const apiKey = headers['x-api-key']

  //   if (!apiKey) {
  //     console.log('user doesnt have an apiKey')
  //     return status(401)
  //   }
  //   const isAuthenticated = validApiKeys.has(apiKey)

  //   if (!isAuthenticated)  {

  //     return status(401)
  //   }

  //   if (request.user.role !== 'admin') return status(401)
  // })
  .get('/protected-alt', () => {
    return { message: 'access granted! now try /protected-with-context' }
  })
  .get('/protected-with-context-alt', ({ user, isAuthenticated }) => {
    return { message: 'Access granted!', user: user, authenticated: isAuthenticated }
  })
// .derive() // exists to add CONTEXT to requests.


// Andrew's example code
const protectedRoutes = new Elysia()
  .derive({ as: 'local' }, (request) => {
    return { user: { name: 'guillaume', role: 'admin' }, isAuthenticated: true }
  })
  .onBeforeHandle({ as: 'local' }, (request) => {
    const headers = request.headers
    const apiKey = headers['x-api-key']

    if (!apiKey) return status(401)

    const isAuthenticated = validApiKeys.has(apiKey)

    if (!isAuthenticated) return status(401)

    if (request.user.role !== 'admin') return status(401)
  })
  .get('/protected', () => {
    return { message: 'access granted! now try /protected-with-context' }
  })
  .get('/protected-with-context', ({ user, isAuthenticated }) => {
    return { message: 'Access granted!', user: user, authenticated: isAuthenticated }
  })

const app = new Elysia()
  .use(swagger())
  .get('/', () => {
    return { message: "this is public hello world" }
  })
  .use(protectedRoutes)
  .use(protectedRoutesAlt)
  .listen(PORT)

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

