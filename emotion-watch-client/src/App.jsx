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

// Watch frame photo, served from /public, referenced by root-relative path.
const WATCH_FRAME = "/watch.png"

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

// Background glow orbs — their colors are passed in from App and react to
// each person's current emotion color.
const orbConfigs = [
  { size: 340, top: "-100px", left: "-80px", duration: 18, delay: 0, pulseDur: 6 },
  { size: 280, bottom: "-80px", right: "-60px", duration: 22, delay: 2, pulseDur: 8 },
  { size: 200, top: "60px", right: "80px", duration: 15, delay: 1, pulseDur: 5 },
  { size: 170, bottom: "60px", left: "100px", duration: 20, delay: 3, pulseDur: 7 },
  { size: 140, top: "140px", left: "30px", duration: 25, delay: 0, pulseDur: 9 },
  { size: 120, bottom: "100px", right: "120px", duration: 17, delay: 4, pulseDur: 6 },
]

function LiveBackground({ myColor, friendColor }) {
  const colors = [
    myColor || "#c084fc",
    friendColor || "#7c3aed",
    myColor || "#c084fc",
    friendColor || "#7c3aed",
    myColor || "#c084fc",
    friendColor || "#7c3aed",
  ]

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      overflow: "hidden",
      background: "linear-gradient(135deg, #0d0010, #18051e, #0a0a0a)"
    }}>
      <style>{`
        @keyframes orbDrift {
          0%   { transform: translate(0px, 0px) scale(1); }
          25%  { transform: translate(30px, -25px) scale(1.05); }
          50%  { transform: translate(12px, 32px) scale(0.95); }
          75%  { transform: translate(-22px, 12px) scale(1.07); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.13; }
          50%       { opacity: 0.22; }
        }
      `}</style>

      {orbConfigs.map((cfg, i) => (
        <div key={i} style={{
          position: "absolute",
          width: cfg.size,
          height: cfg.size,
          top: cfg.top,
          bottom: cfg.bottom,
          left: cfg.left,
          right: cfg.right,
          borderRadius: "50%",
          background: colors[i],
          filter: "blur(70px)",
          opacity: 0.15,
          transition: "background 3s ease",
          animation: `orbDrift ${cfg.duration}s ease-in-out ${i % 2 === 0 ? "" : "reverse"} infinite, orbPulse ${cfg.pulseDur}s ease-in-out ${cfg.delay}s infinite`,
        }} />
      ))}
    </div>
  )
}

function WatchFace({ emotion, label, isOnline }) {
  const timeAgo = useTimeAgo(emotion?.updatedAt)
  const color = emotion ? emotion.color : "#2d1f3d"

  // Single control for the whole watch's size — everything below is
  // either a percentage (scales automatically) or derived from this.
  const size = 210
  const faceSize = size * 0.49   // diameter of the clipped orb circle
  const faceOffset = (size - faceSize) / 2  // centers the orb circle in the box

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <p className="text-lg font-semibold tracking-widest uppercase" style={{ color: "#fdfdff" }}>{label}</p>
        <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-600"}`} />
      </div>

      {/* Outer box just sizes/positions things now — the PNG provides the
          bezel, border, and band, so this div no longer draws its own
          circle/border like the old version did. */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: "relative",
        }}
      >
        {/* Orb layer — clipped to a circle and positioned to sit exactly
            inside the empty watch-face area of the PNG. Tweak the top/left/
            width/height percentages below if the orb doesn't line up with
            your specific watch.png. */}
        <div
          style={{
            position: "absolute",
            top: `${faceOffset}px`,
            left: `${faceOffset}px`,
            width: `${faceSize}px`,
            height: `${faceSize}px`,
            borderRadius: "50%",
            overflow: "hidden",
            backgroundColor: "#0d0d0d",
            boxShadow: "inset 0 0 20px rgba(128, 126, 126, 0.5)",
            zIndex: 1,
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
            top: "-12%",
            left: "-12%",
            width: "124%",
            height: "124%",
            borderRadius: "42% 58% 53% 47% / 48% 44% 56% 52%",
            backgroundColor: color,
            opacity: 1,
            animation: "waterWobble 6s ease-in-out infinite",
            transition: "background-color 6s ease",
          }} />

          {/* White highlight swirl — bigger, more opaque, clearly visible */}
          <div style={{
            position: "absolute",
            top: "-14%",
            left: "-14%",
            width: "129%",
            height: "129%",
            borderRadius: "46% 54% 58% 42% / 52% 48% 52% 48%",
            background: `radial-gradient(ellipse at 30% 25%, rgba(255, 255, 255, 0.42) 0%, rgba(255,255,255,0.15) 35%, transparent 55%)`,
            mixBlendMode: "screen",
            animation: "waterDrift 6s ease-in-out infinite",
          }} />

          {/* Black shadow swirl — bigger, more opaque, clearly visible */}
          <div style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "119%",
            height: "119%",
            borderRadius: "53% 47% 45% 55% / 47% 53% 47% 53%",
            background: `radial-gradient(ellipse at 65% 70%, rgba(3, 3, 3, 0.65) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)`,
            mixBlendMode: "multiply",
            animation: "waterDrift 6s ease-in-out infinite reverse",
          }} />

          {/*  2 Black shadow swirl — top right */}
          <div style={{
            position: "absolute",
            top: "-33%",
            right: "10%",
            width: "119%",
            height: "119%",
            borderRadius: "47% 53% 55% 45% / 53% 47% 53% 47%",
            background: `radial-gradient(
              ellipse at 35% 30%,
              rgb(3, 3, 3) 0%,
              rgba(0, 0, 0, 0.37) 40%,
              transparent 60%
            )`,
            mixBlendMode: "multiply",
            animation: "waterDrift 8s ease-in-out infinite",
          }} />

          {/* Mid-tone streak — adds a third visible current moving across */}
          <div style={{
            position: "absolute",
            top: "-5%",
            left: "5%",
            width: "110%",
            height: "110%",
            borderRadius: "50% 50% 55% 45% / 45% 55% 45% 55%",
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 30%, rgba(0,0,0,0.3) 60%, transparent 90%)`,
            animation: "waterDrift 6s linear infinite",
          }} />

          {/* Mid-tone streak — top right */}
          <div style={{
            position: "absolute",
            top: "-5%",
            right: "-19%",
            width: "110%",
            height: "110%",
            borderRadius: "55% 45% 50% 50% / 55% 45% 55% 45%",
            background: `linear-gradient(
              315deg,
              rgba(255,255,255,0.3) 0%,
              transparent 30%,
              rgba(0,0,0,0.3) 60%,
              transparent 90%
            )`,
            animation: "waterDrift 7s linear infinite reverse",
          }} />

          {/* Floating glint — soft, round, natural light flicker on water */}
          <div style={{
            position: "absolute",
            top: "18%",
            left: "22%",
            width: "33%",
            height: "33%",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.18)",
            filter: "blur(12px)",
            animation: "glintFloat 6s ease-in-out infinite"
          }} />

          {/* Shine overlay */}
          <div style={{
            position: "absolute",
            top: "6%",
            left: "14%",
            width: "29%",
            height: "10%",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.12)",
            transform: "rotate(-30deg)",
            filter: "blur(6px)"
          }} />
        </div>

        {/* Watch frame photo, sits on top of the orb */}
        <img
          src={WATCH_FRAME}
          alt="watch frame"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-8" style={{ position: "relative" }}>
      <LiveBackground myColor={myEmotion?.color} friendColor={friendEmotion?.color} />

      <div className="flex flex-col items-center gap-1" style={{ position: "relative", zIndex: 10 }}>
        <h1 className="text-3xl font-bold tracking-wide" style={{ color: "#fdfdff" }}> Emotions watch</h1>
        <p className="text-sm tracking-widest" style={{ color: "#a1a1aa" }}>
          Room: <span className="font-bold" style={{ color: "#fdfdff" }}>{roomCode}</span>
        </p>
      </div>

      <div className="flex gap-16" style={{ position: "relative", zIndex: 10 }}>
        <WatchFace emotion={myEmotion} label="you" isOnline={true} />
        <WatchFace emotion={friendEmotion} label="friend" isOnline={friendOnline} />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4" style={{ position: "relative", zIndex: 10 }}>
        {emotions.map((e) => (
          <button
            key={e.name}
            onClick={() => handleSelect(e)}
            className="flex flex-col items-center p-3 rounded-2xl shadow hover:scale-105 transition-transform cursor-pointer border-2"
            style={{ backgroundColor: "#18181bcc", borderColor: e.color }}
          >
            <span className="text-2xl">{e.emoji}</span>
            <span className="text-xs mt-1" style={{ color: e.color }}>{e.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleLeaveRoom}
        className="text-sm underline mt-2"
        style={{ color: "#a78bfa", position: "relative", zIndex: 10 }}
      >
        Leave Room
      </button>
    </div>
  )
}

export default App