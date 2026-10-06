import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middleware/error.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || '*', credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use('/api', routes)
app.use(notFound)
app.use(errorHandler)

export default app