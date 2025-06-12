import swagger from "@elysiajs/swagger";
import { Elysia, status } from "elysia";
import { jwt } from '@elysiajs/jwt'

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

const needsJwt = new Elysia()
  .use(
          jwt({
              name: 'jwt',
              secret: 'Fischl von Luftschloss Narfidort'
          })
      )
      .get('/sign/:name', ({ jwt, params: { name } }) => {
        return jwt.sign({ name })
      })
      .get('/profile', async ({ jwt, error, headers: { authorization } }) => {
          const profile = await jwt.verify(authorization)

          if (!profile)
              return status(401, 'Unauthorized')

          return `Hello ${profile.name}`
      })
      .listen(3000)