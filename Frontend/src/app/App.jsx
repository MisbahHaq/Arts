import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"
function App() {

  const editorRef = useRef(null)
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  const [users, setUsers] = useState([])

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  const handleMount = (editor) => {
    editorRef.current = editor

    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
    )
  }

  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)

  }

  useEffect(() => {
    if (username) {
      const socketServer = window.location.port === "5173" ? "http://localhost:3000" : "/"
      const provider = new SocketIOProvider(socketServer, "monaco", ydoc, {
        autoConnect: true,
      })

      provider.awareness.setLocalStateField("user", { username })

      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))


      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
      })

      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null)
      }

      window.addEventListener("beforeunload", handleBeforeUnload)

      return () => {
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }

  }, [
    username
  ])

  if (!username) {
    return (
      <main className="h-screen w-full bg-obsidian flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)'
        }}></div>
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-serif text-5xl font-bold text-ivory tracking-wider mb-3" style={{ textShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}>
              SERVER PLAY
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-imperial-gold to-transparent mx-auto"></div>
            <p className="font-sans text-ivory/60 text-sm tracking-[0.3em] mt-4 uppercase">
              Collaborative Code Editor
            </p>
          </div>
          <form
            onSubmit={handleJoin}
            className="flex flex-col gap-6 p-8 border border-imperial-gold/40 bg-obsidian-light/80 backdrop-blur-sm relative"
            style={{ boxShadow: '0 0 60px rgba(212, 175, 55, 0.08), inset 0 1px 0 rgba(212, 175, 55, 0.1)' }}
          >
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-imperial-gold"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-imperial-gold"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-imperial-gold"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-imperial-gold"></div>

            <input
              type="text"
              placeholder="Enter your username"
              className="p-4 bg-obsidian-lighter border border-obsidian-border text-ivory font-sans text-sm tracking-wide outline-none transition-all duration-300 focus:border-imperial-gold/60 focus:shadow-[0_0_20px_rgba(212,175,55,0.1)]"
              name="username"
              required
            />
            <button
              type="submit"
              className="p-4 bg-imperial-gold text-obsidian font-serif font-semibold text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:bg-imperial-gold/90 active:scale-[0.98]"
            >
              Enter Session
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-obsidian flex gap-0 relative">
      <aside className="h-full w-72 bg-royal-blue/40 border-r border-imperial-gold/20 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-imperial-gold/40 to-transparent"></div>
        
        <div className="p-6 border-b border-imperial-gold/15">
          <h2 className="font-serif text-xl font-semibold text-ivory tracking-wider">
            USERS
          </h2>
          <div className="w-12 h-0.5 bg-imperial-gold/60 mt-3"></div>
        </div>
        
        <ul className="flex-1 p-4 space-y-2 overflow-y-auto">
          {users.map((user, index) => (
            <li 
              key={index} 
              className="p-3 bg-obsidian-light/60 border-l-2 border-imperial-gold/50 text-ivory/90 font-sans text-sm tracking-wide transition-all duration-300 hover:bg-obsidian-light hover:border-imperial-gold hover:pl-4"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-imperial-gold/80"></span>
                {user.username}
              </span>
            </li>
          ))}
        </ul>

        <div className="p-4 border-t border-imperial-gold/15">
          <div className="text-ivory/40 font-sans text-xs tracking-widest text-center uppercase">
            {users.length} {users.length === 1 ? 'participant' : 'participants'} online
          </div>
        </div>
      </aside>

      <section className="flex-1 flex flex-col bg-obsidian relative">
        <div className="h-12 bg-obsidian-light/50 border-b border-imperial-gold/10 flex items-center px-6">
          <span className="font-serif text-ivory/50 text-xs tracking-[0.2em] uppercase">
            Live Session
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-sans text-ivory/40 text-xs tracking-wide">Connected</span>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0 border border-imperial-gold/10 pointer-events-none z-10"></div>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Begin your collaboration here..."
            theme="vs-dark"
            onMount={handleMount}
            options={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: 14,
              lineHeight: 21,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
            }}
          />
        </div>
      </section>
    </main>
  )
}

export default App
