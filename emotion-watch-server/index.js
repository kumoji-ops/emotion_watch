import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// { roomCode: { userId: emotion } }
const roomEmotions = {}

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id)

  socket.on('join-room', ({ roomCode, userId }) => {
  socket.join(roomCode)
  socket.userId = userId
  socket.roomCode = roomCode
  console.log(`User ${userId} joined room: ${roomCode}`)

  socket.to(roomCode).emit('friend-online')

  if (roomEmotions[roomCode]) {
    socket.emit('room-emotions', { roomEmotions: roomEmotions[roomCode], myUserId: userId })
  }
})


 socket.on('my-emotion', ({ emotion, roomCode, userId }) => {
  console.log(`Emotion received in room ${roomCode} from ${userId}:`, emotion.name)
  if (!roomEmotions[roomCode]) roomEmotions[roomCode] = {}
  roomEmotions[roomCode][userId] = emotion
  socket.to(roomCode).emit('friend-emotion', emotion)
})

 socket.on('disconnect', () => {
  console.log('user disconnected:', socket.id)
  if (socket.roomCode) {
    socket.to(socket.roomCode).emit('friend-offline')
  }
})
})
server.listen(3001, () => {
  console.log('Server running on port 3001')
})

