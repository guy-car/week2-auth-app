import swagger from "@elysiajs/swagger";
import { Elysia, status } from "elysia";

const PORT = 3000

// Simple API key store (use database in production)
const validApiKeys = new Set(['api-key-123', 'api-key-456'])

// add a system for issuing api key

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
// .derive() // exists to add CONTEXT to requests.

const app = new Elysia()
  .use(swagger())
  .get('/', () => {
    return { message: "this is public hello world" }
  })
  .use(protectedRoutes)
  .listen(PORT)

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

