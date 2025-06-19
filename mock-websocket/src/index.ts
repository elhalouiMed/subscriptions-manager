import { WebSocketServer } from 'ws'

const PORT = 8081

const wss = new WebSocketServer({ port: PORT }, () =>
  console.log(`mock-websocket running on ws://localhost:${PORT}`)
)

wss.on('connection', ws => {
  console.log('client connected')
  ws.on('message', msg =>
    console.log('received message:', msg.toString())
  )
  ws.on('close', () =>
    console.log('client disconnected')
  )
})
