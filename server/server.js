import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'

import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'

const { readFile, writeFile, unlink } = require('fs').promises
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

const setHeaders = (req, res, next) => {
  res.set('x-skillcrucial-user', '4b9ae8bc-25a4-4b8f-9bcb-953a5b83e3df')
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER')
  next()
}

const toReadFile = () => readFile(`${__dirname}/users.json`, { encoding: 'utf8' })

const toWriteFile = (file) =>
  writeFile(`${__dirname}/users.json`, JSON.stringify(file), { encoding: 'utf8' })

const toDelete = () => unlink(`${__dirname}/users.json`)

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser(),
  setHeaders
]

middleware.forEach((it) => server.use(it))

server.get('/api/v1/users/', async (req, res) => {
  await toReadFile()
    .then((text) => {
      res.json(JSON.parse(text))
    })
    .catch(async () => {
      const { data } = await axios('https://jsonplaceholder.typicode.com/users')
      await toWriteFile(data)
      await toReadFile().then((text) => {
        res.json(JSON.parse(text))
      })
    })
})

server.post('/api/v1/users/', async (req, res) => {
  const usersArr = await toReadFile().then((text) => JSON.parse(text))
  usersArr.push({ id: usersArr[usersArr.length - 1].id + 1, ...req.body })
  await toWriteFile(usersArr)
  res.json({ status: `user ${usersArr[usersArr.length - 1].id} was created with your data` })
})

server.patch('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const usersArr = await toReadFile().then((text) => JSON.parse(text))
  if (usersArr[+userId - 1]) {
    usersArr[+userId - 1] = { ...usersArr[+userId - 1], ...req.body }
    await toWriteFile(usersArr)
    res.json({ status: `user ${userId} was updated` })
  } else {
    res.json({ status: `user ${userId} not exist` })
  }
})

server.delete('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  let usersArr = await toReadFile().then((text) => JSON.parse(text))
  usersArr = [...usersArr.filter((user) => user.id !== +userId)]
  await toWriteFile(usersArr)
  res.json({ status: `user ${userId} was deleted` })
})

server.delete('/api/v1/users/', (req, res) => {
  toDelete()
  res.json({ status: 'deleted' })
})

server.post('/api/v1/input', (req, res) => {
  const testAdd = ' Сработало'
  const str = req.body.input.toUpperCase() + testAdd
  res.json({ result: str })
})

server.get('/api/v1/users/:number', async (req, res) => {
  // получаем определенное кол-во юзеров по ссылке, используя деструктуризацию
  const { number } = req.params
  const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
  res.json(users.slice(0, +number))
})

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
