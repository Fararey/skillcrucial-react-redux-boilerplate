import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const { readFile, writeFile, stat, unlink } = require('fs').promises
require('colors')

let Root
try {
  // eslint-disable-next-line import/no-unresolved
  Root = require('../dist/assets/js/ssr/root.bundle').default
} catch {
  console.log('SSR not found. Please run "yarn run build:ssr"'.red)
}

let connections = []

const port = process.env.PORT || 8090
const server = express()

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser()
]

middleware.forEach((it) => server.use(it))

server.get('/api/v1/users', async (req, res) => {
  let isFileExist
  await stat(`${__dirname}/users.json`)
    .then(() => {
      isFileExist = true
    })
    .catch(() => {
      isFileExist = false
    })
  if (!isFileExist) {
    const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
    await writeFile(`${__dirname}/users.json`, JSON.stringify(users), { encoding: 'utf8' })
  }
  await readFile(`${__dirname}/users.json`, { encoding: 'utf8' }).then((text) => {
    res.json(JSON.parse(text))
  })
})

server.post('/api/v1/users', async (req, res) => {
  let newUserId
  const result = await readFile(`${__dirname}/users.json`, { encoding: 'utf8' }).then((text) => {
    const usersArr = JSON.parse(text)
    newUserId = usersArr.length + 1
    const newUser = { id: newUserId }
    usersArr.push({ ...newUser, ...req.body })
    return usersArr
  })
  await writeFile(`${__dirname}/users.json`, JSON.stringify(result), { encoding: 'utf8' })
  res.json({ status: 'success', id: newUserId })
})

server.patch('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const result = await readFile(`${__dirname}/users.json`, { encoding: 'utf8' }).then((text) => {
    const usersArr = JSON.parse(text)
    return usersArr.map((user) => {
      if (user.id === +userId) {
        return { ...user, ...req.body }
      }
      return user
    })
  })
  await writeFile(`${__dirname}/users.json`, JSON.stringify(result), { encoding: 'utf8' })
  res.json({ status: 'success', id: userId })
})

server.delete('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params // originaly req.params gives you string
  const result = await readFile(`${__dirname}/users.json`, { encoding: 'utf8' }).then((text) => {
    const usersArr = JSON.parse(text)
    return usersArr.filter((user) => user.id !== +userId)
  })
  await writeFile(`${__dirname}/users.json`, JSON.stringify(result), { encoding: 'utf8' })
  res.json({ status: 'success', id: userId })
})

server.delete('/api/v1/users', async (req, res) => {
  unlink(`${__dirname}/users.json`)
})

server.post('/api/v1/input', (req, res) => {
  const str = req.body.input.toUpperCase()
  res.json({ result: str })
})

// server.get('/api/v1/users/:number', async (req, res) => {
//   // получаем определенное кол-во юзеров по ссылке, используя деструктуризацию
//   const { number } = req.params
//   const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
//   res.json(users.slice(0, +number))
// })

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'Skillcrucial'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
