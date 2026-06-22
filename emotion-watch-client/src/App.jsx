import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const socket = io("http://localhost:3001")

const getUserId = () => {
  let id = localStorage.getItem("userId")
  if (!id) {
    id = Math.random().toString(36).substring(2, 9)
    localStorage.setItem("userId", id)
  }
  return id
}

const USER_ID = getUserId()

const generateRoomCode = () => Math.random().toString(36).substring(2, 7).toUpperCase()

const emotions = [
  { name: "Happy", emoji: "😊", color: "#FFD700" },
  { name: "Grief", emoji: "🖤", color: "#1a1a1a" },
  { name: "Angry", emoji: "😡", color: "#FF3B30" },
  { name: "Anxious", emoji: "😰", color: "#ADFF2F" },
  { name: "In Love", emoji: "🥰", color: "#FF6B8A" },
  { name: "Affectionate", emoji: "🌸", color: "#FFB6C1" },
  { name: "Lonely", emoji: "😔", color: "#A0A0A0" },
  { name: "Heartbroken", emoji: "💔", color: "#1C3A5E" },
  { name: "Frustrated", emoji: "😤", color: "#8B5E3C" },
  { name: "Disgusted", emoji: "🤢", color: "#6B7C3A" },
  { name: "Excited", emoji: "🤩", color: "#FF8C00" },
  { name: "Curious", emoji: "🔹", color: "#00CED1" },
]

function WatchFace({ emotion, label }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-semibold text-gray-500 tracking-widest uppercase">{label}</p>
      <div
        className="w-52 h-52 rounded-3xl flex flex-col items-center justify-center shadow-2xl transition-all duration-700"
        style={{ backgroundColor: emotion ? emotion.color : "#e5e7eb" }}
      >
        <span className="text-6xl">{emotion ? emotion.emoji : "❓"}</span>
        <span className="mt-3 text-lg font-bold text-white drop-shadow">
          {emotion ? emotion.name : "No feeling yet"}
        </span>
      </div>
    </div>
  )
}

function RoomScreen({ onJoin }) {
  const [inputCode, setInputCode] = useState("")

  const handleCreate = () => {
    const code = generateRoomCode()
    onJoin(code)
  }

  const handleJoin = () => {
    if (inputCode.trim()) onJoin(inputCode.trim().toUpperCase())
  }

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold text-rose-300 tracking-wide">💗 emotion watch</h1>
      <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 w-80">
        <button
          onClick={handleCreate}
          className="bg-rose-300 hover:bg-rose-400 text-white font-bold py-3 rounded-2xl transition-colors"
        >
          Create a Room
        </button>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter room code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="border-2 border-rose-200 rounded-xl px-4 py-3 text-center tracking-widest uppercase outline-none focus:border-rose-400"
          />
          <button
            onClick={handleJoin}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-colors"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [roomCode, setRoomCode] = useState(() => localStorage.getItem("roomCode") || null)
  const [myEmotion, setMyEmotion] = useState(() => {
    const saved = localStorage.getItem("myEmotion")
    return saved ? JSON.parse(saved) : null
  })
  const [friendEmotion, setFriendEmotion] = useState(null)

  const handleJoinRoom = (code) => {
    localStorage.setItem("roomCode", code)
    setRoomCode(code)
  }

  useEffect(() => {
    if (!roomCode) return

    const joinRoom = () => {
      socket.emit("join-room", { roomCode, userId: USER_ID })
      const saved = localStorage.getItem("myEmotion")
      if (saved) {
        socket.emit("my-emotion", { emotion: JSON.parse(saved), roomCode, userId: USER_ID })
      }
    }

    if (socket.connected) {
      joinRoom()
    } else {
      socket.on("connect", joinRoom)
    }

    socket.on("room-emotions", ({ roomEmotions, myUserId }) => {
      for (const [uid, emotion] of Object.entries(roomEmotions)) {
        if (uid !== myUserId) setFriendEmotion(emotion)
      }
    })

    socket.on("friend-emotion", (emotion) => {
      setFriendEmotion(emotion)
    })

    return () => {
      socket.off("connect", joinRoom)
      socket.off("room-emotions")
      socket.off("friend-emotion")
    }
  }, [roomCode])

  const handleSelect = (emotion) => {
  setMyEmotion(emotion)
  localStorage.setItem("myEmotion", JSON.stringify(emotion))
  console.log("Emitting:", { emotion: emotion.name, roomCode, userId: USER_ID })
  socket.emit("my-emotion", { emotion, roomCode, userId: USER_ID })
}

  const handleLeaveRoom = () => {
    localStorage.removeItem("roomCode")
    localStorage.removeItem("myEmotion")
    setRoomCode(null)
    setMyEmotion(null)
    setFriendEmotion(null)
  }

  if (!roomCode) return <RoomScreen onJoin={handleJoinRoom} />

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center gap-10 p-8">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-3xl font-bold text-rose-300 tracking-wide">💗 emotion watch</h1>
        <p className="text-sm text-gray-400 tracking-widest">Room: <span className="font-bold text-rose-300">{roomCode}</span></p>
      </div>

      <div className="flex gap-16">
        <WatchFace emotion={myEmotion} label="You" />
        <WatchFace emotion={friendEmotion} label="Friend" />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {emotions.map((e) => (
          <button
            key={e.name}
            onClick={() => handleSelect(e)}
            className="flex flex-col items-center p-3 rounded-2xl bg-white shadow hover:scale-105 transition-transform cursor-pointer border-2"
            style={{ borderColor: e.color }}
          >
            <span className="text-2xl">{e.emoji}</span>
            <span className="text-xs text-gray-500 mt-1">{e.name}</span>
          </button>
        ))}
      </div>

      <button onClick={handleLeaveRoom} className="text-sm text-gray-400 hover:text-rose-400 underline mt-2">
        Leave Room
      </button>
    </div>
  )
}

export default App