import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()
import { copyS3Folder } from './aws'

const app = express()
app.use(express.json())
app.use(cors())

app.post('/project', async (req, res) => {
  const { canvasID, language } = req.body

  if (!canvasID) {
    res.status(400).send('Bad request')
    return
  }

  await copyS3Folder(`base/base-${language}`, `code/${canvasID}`)

  res.status(200).send('Project created')
})

const port = process.env.PORT || 3002

app.listen(port, () => {
  console.log(`init service listening on port:${port}`)
})
