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

function useTimeAgo(timestamp) {
  const [label, setLabel] = useState("")

  useEffect(() => {
    const update = () => {
      if (!timestamp) return setLabel("")
      const diff = Math.floor((Date.now() - timestamp) / 1000)
      if (diff < 10) setLabel("just now")
      else if (diff < 60) setLabel(`${diff}s ago`)
      else if (diff < 3600) setLabel(`${Math.floor(diff / 60)}m ago`)
      else setLabel(`${Math.floor(diff / 3600)}h ago`)
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [timestamp])

  return label
}

function WatchFace({ emotion, label, isOnline }) {
  const timeAgo = useTimeAgo(emotion?.updatedAt)
  const color = emotion ? emotion.color : "#2d1f3d"

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <p className="text-lg font-semibold tracking-widest uppercase" style={{ color: "#fdfdff" }}>{label}</p>
        <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-600"}`} />
      </div>

      <div
        style={{
          width: "210px",
          height: "210px",
          borderRadius: "50%",
          border: "16px solid #0a0a0a",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#0d0d0d",
          boxShadow: "inset 0 0 20px rgba(128, 126, 126, 0.5), 0 0 20px rgba(211, 208, 208, 0.1)",
        }}
      >
        <style>{`
         @keyframes waterWobble {
  0% { border-radius: 42% 58% 53% 47% / 48% 44% 56% 52%; transform: translate(0%, 0%) rotate(0deg) scale(1); }
  15% { border-radius: 55% 45% 48% 52% / 40% 60% 42% 58%; transform: translate(6%, -8%) rotate(10deg) scale(1.04); }
  30% { border-radius: 38% 62% 60% 40% / 58% 42% 50% 50%; transform: translate(-9%, -4%) rotate(-14deg) scale(1.06); }
  45% { border-radius: 60% 40% 42% 58% / 45% 55% 38% 62%; transform: translate(-4%, 7%) rotate(8deg) scale(1.03); }
  60% { border-radius: 45% 55% 55% 45% / 52% 48% 60% 40%; transform: translate(8%, 6%) rotate(-10deg) scale(1.05); }
  75% { border-radius: 50% 50% 40% 60% / 42% 58% 48% 52%; transform: translate(3%, -6%) rotate(12deg) scale(1.02); }
  100% { border-radius: 42% 58% 53% 47% / 48% 44% 56% 52%; transform: translate(0%, 0%) rotate(0deg) scale(1); }
}
         @keyframes waterDrift {
  0% { transform: translate(0%, 0%) rotate(0deg); }
  20% { transform: translate(-14%, -16%) rotate(20deg); }
  40% { transform: translate(-12%, -12%) rotate(-18deg); }
  60% { transform: translate(-15%, -10%) rotate(25deg); }
  80% { transform: translate(-14%, -10%) rotate(-20deg); }
  100% { transform: translate(0%, 0%) rotate(0deg); }
}
          @keyframes glintFloat {
            0%, 100% { transform: translate(0px, 0px) scale(2); opacity: 0.4; }
            50% { transform: translate(90px, 90px) scale(2.9); opacity: 0.7; }
          }
        `}</style>

        {/* Base water fill */}
        <div style={{
          position: "absolute",
          top: "-25px",
          left: "-25px",
          width: "260px",
          height: "260px",
          borderRadius: "42% 58% 53% 47% / 48% 44% 56% 52%",
          backgroundColor: color,
          opacity: 1,
          animation: "waterWobble 5s ease-in-out infinite",
          transition: "background-color 1s ease",
        }} />

        {/* White highlight swirl — bigger, more opaque, clearly visible */}
        <div style={{
          position: "absolute",
          top: "-30px",
          left: "-30px",
          width: "270px",
          height: "270px",
          borderRadius: "46% 54% 58% 42% / 52% 48% 52% 48%",
          background: `radial-gradient(ellipse at 30% 25%, rgba(255, 255, 255, 0.42) 0%, rgba(255,255,255,0.15) 35%, transparent 55%)`,
          mixBlendMode: "screen",
          animation: "waterDrift 6s ease-in-out infinite",
        }} />

        {/* Black shadow swirl — bigger, more opaque, clearly visible */}
        <div style={{
          position: "absolute",
          top: "-20px",
          left: "-20px",
          width: "250px",
          height: "250px",
          borderRadius: "53% 47% 45% 55% / 47% 53% 47% 53%",
          background: `radial-gradient(ellipse at 65% 70%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)`,
          mixBlendMode: "multiply",
          animation: "waterDrift 8s ease-in-out infinite reverse",
        }} />

        {/* Mid-tone streak — adds a third visible current moving across */}
        <div style={{
          position: "absolute",
          top: "-10px",
          left: "-10px",
          width: "230px",
          height: "230px",
          borderRadius: "50% 50% 55% 45% / 45% 55% 45% 55%",
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 30%, rgba(0,0,0,0.3) 60%, transparent 90%)`,
          animation: "waterDrift 4s linear infinite",
        }} />

       {/* Floating glint — soft, round, natural light flicker on water */}
<div style={{
  position: "absolute",
  top: "18%",
  left: "22%",
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.18)",
  filter: "blur(12px)",
  animation: "glintFloat 6s ease-in-out infinite"
}} />

        {/* Shine overlay */}
        <div style={{
          position: "absolute",
          top: "8px",
          left: "18px",
          width: "60px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.12)",
          transform: "rotate(-30deg)",
          filter: "blur(6px)"
        }} />
  
  
      </div>

      {timeAgo && (
        <p className="text-xs" style={{ color: "#a78bfa" }}>{timeAgo}</p>
      )}
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8" style={{ backgroundColor: "#76578d" }}>
      <h1 className="text-3xl font-bold tracking-wide" style={{ color: "#c084fc" }}>💗 emotion watch</h1>
      <div className="rounded-3xl shadow-xl p-8 flex flex-col gap-6 w-80" style={{ backgroundColor: "#2d1f3d" }}>
        <button
          onClick={handleCreate}
          className="font-bold py-3 rounded-2xl transition-colors"
          style={{ backgroundColor: "#7c3aed", color: "#f3e8ff" }}
          onMouseEnter={e => e.target.style.backgroundColor = "#6d28d9"}
          onMouseLeave={e => e.target.style.backgroundColor = "#7c3aed"}
        >
          Create a Room
        </button>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter room code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="rounded-xl px-4 py-3 text-center tracking-widest uppercase outline-none"
            style={{
              backgroundColor: "#1e1525",
              border: "2px solid #7c3aed",
              color: "#e9d5ff",
            }}
          />
          <button
            onClick={handleJoin}
            className="font-bold py-3 rounded-2xl transition-colors"
            style={{ backgroundColor: "#3b1f5e", color: "#c084fc" }}
            onMouseEnter={e => e.target.style.backgroundColor = "#4c2878"}
            onMouseLeave={e => e.target.style.backgroundColor = "#3b1f5e"}
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
  const [friendOnline, setFriendOnline] = useState(false)

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

    socket.on("friend-online", () => setFriendOnline(true))
    socket.on("friend-offline", () => setFriendOnline(false))

    return () => {
      socket.off("connect", joinRoom)
      socket.off("room-emotions")
      socket.off("friend-emotion")
      socket.off("friend-online")
      socket.off("friend-offline")
    }
  }, [roomCode])

  const handleSelect = (emotion) => {
    const emotionWithTime = { ...emotion, updatedAt: Date.now() }
    setMyEmotion(emotionWithTime)
    localStorage.setItem("myEmotion", JSON.stringify(emotionWithTime))
    socket.emit("my-emotion", { emotion: emotionWithTime, roomCode, userId: USER_ID })
  }

  const handleLeaveRoom = () => {
    localStorage.removeItem("roomCode")
    localStorage.removeItem("myEmotion")
    setRoomCode(null)
    setMyEmotion(null)
    setFriendEmotion(null)
    setFriendOnline(false)
  }

  if (!roomCode) return <RoomScreen onJoin={handleJoinRoom} />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-8" style={{ backgroundColor: "#dfd6d6" }}>
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-3xl font-bold tracking-wide" style={{ color: "#000000" }}> Emotions watch</h1>
        <p className="text-sm tracking-widest" style={{ color: "#000000" }}>
          Room: <span className="font-bold" style={{ color: "#000000" }}>{roomCode}</span>
        </p>
      </div>

      <div className="flex gap-16">
        <WatchFace emotion={myEmotion} label="you" isOnline={true} />
        <WatchFace emotion={friendEmotion} label="friend" isOnline={friendOnline} />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {emotions.map((e) => (
          <button
            key={e.name}
            onClick={() => handleSelect(e)}
            className="flex flex-col items-center p-3 rounded-2xl shadow hover:scale-105 transition-transform cursor-pointer border-2"
            style={{ backgroundColor: "#ffffff", borderColor: e.color }}
          >
            <span className="text-2xl">{e.emoji}</span>
            <span className="text-xs mt-1" style={{ color: "#a78bfa" }}>{e.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleLeaveRoom}
        className="text-sm underline mt-2"
        style={{ color: "#7c3aed" }}
      >
        Leave Room
      </button>
    </div>
  )
}

export default App