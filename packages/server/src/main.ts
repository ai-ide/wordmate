import 'reflect-metadata'
import Koa from 'koa'
import Router from 'koa-router'
import { koaBody } from 'koa-body'
import cors from 'koa-cors'
import { DataSource } from 'typeorm'
import User from './models/User'

const app = new Koa()
const router = new Router()

// Database connection
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: true,
  entities: [User],
  subscribers: [],
  migrations: [],
})

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!')
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err)
  })

// Middleware
app.use(koaBody())
app.use(cors())

// Routes
router.get('/', async (ctx) => {
  ctx.body = { message: 'Welcome to Wordmate API' }
})

app.use(router.routes()).use(router.allowedMethods())

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
