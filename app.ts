import * as dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import http from 'http'
import https from 'https'

import express, { Request } from 'express'

import { google } from 'googleapis'
google.options({auth: process.env.YT_KEY});

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

app.get('/comments', async (req: Request<{}, {}, {}, CommentsQuery>, res) => {
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
  res.send(result)
})

const key = fs.readFileSync(__dirname + '/certs/selfsigned.key');
const cert = fs.readFileSync(__dirname + '/certs/selfsigned.crt');
const credentials = {key: key, cert: cert}

const httpsServer = https.createServer(credentials, app);
console.log('https://localhost:8843')

httpsServer.listen(8443)

const httpServer = http.createServer(app);
httpServer.listen(8080)