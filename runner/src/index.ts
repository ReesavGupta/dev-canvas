import express from 'express'
import http from 'node:http'
import cors from 'cors'
import dotenv from 'dotenv'
import { initWsConnection } from './ws'
dotenv.config()

const app = express()
app.use(cors())
const runnerHttpServer = http.createServer(app)

initWsConnection(runnerHttpServer)

const port = process.env.PORT ?? 3001

runnerHttpServer.listen(port, () => {
  console.log(`Runner Server listening on port: ${port}`)
})