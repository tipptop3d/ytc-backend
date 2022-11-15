import * as dotenv from 'dotenv'
dotenv.config()

import http from 'http'
import https from 'https'

import express, { Request } from 'express'
import cors from 'cors'

var corsOptions = {
  origin: 'https://www.youtube.com'
}

import { google } from 'googleapis'
google.options({ auth: process.env.YT_KEY });

const port = process.env.PORT || 8080

const youtube = google.youtube("v3")

const app = express()

interface CommentsQuery {
  videoId: string;
  filter: string;
  page?: string;
}

app.get('/', (req, res) => {
  res.send('Hello!');
})

app.get('/healthz', (req, res) => {
  res.sendStatus(200)
})

app.get('/comments', cors(corsOptions), async (req: Request<{}, {}, {}, CommentsQuery>, res) => {
  const videoId = req.query.videoId
  const filter = req.query.filter
  const page = req.query.page
  const result = await youtube.commentThreads.list({
    part: ['id', 'snippet'],
    pageToken: page,
    videoId: videoId,
    searchTerms: filter,
    maxResults: 100,
  })
  res.status(result.status)
  if (result.statusText = 'OK') {
    res.send(result.data)
  }
})

const key = process.env.SSL_KEY
const cert = process.env.CERT

if (key != null && cert != null) {
  const credentials = { key: key, cert: cert }
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(port)
  console.log('HTTPS Server started')
} else {
  const httpServer = http.createServer(app);
  httpServer.listen(port)
  console.log('HTTP Server started')
}