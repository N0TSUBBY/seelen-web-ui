import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BatteryFull,
  Bell,
  Disc3,
  File,
  Folder,
  Globe,
  Minus,
  Search,
  Settings2,
  Shield,
  Volume2,
  Wifi,
  X,
  MessageCircle,
} from 'lucide-react'

const APPS = [
  {
    id: 'files',
    label: 'Files',
    icon: Folder,
    color: '#f6c244',
    content: (
      <div className="pane">
        <h3>Files</h3>
        <p>GNOME-style file browser card.</p>
      </div>
    ),
  },
  {
    id: 'browser',
    label: 'Browser',
    icon: Globe,
    color: '#60a5fa',
    content: (
      <div className="pane">
        <h3>Browser</h3>
        <p>Fast web launcher panel. Add your favorite links next.</p>
      </div>
    ),
  },
  {
    id: 'music',
    label: 'Music',
    icon: Disc3,
    color: '#22c55e',
    content: (
      <div className="pane">
        <h3>Now Playing</h3>
        <p>Shake Sum</p>
        <div className="music-mini">
          <button>⏮</button>
          <button>⏯</button>
          <button>⏭</button>
        </div>
      </div>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    color: '#fb923c',
    content: (
      <div className="pane">
        <h3>Security</h3>
        <p>System secure. No threats detected.</p>
      </div>
    ),
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    color: '#818cf8',
    content: (
      <div className="pane">
        <h3>Chat</h3>
        <p>Discord-style quick launcher panel.</p>
      </div>
    ),
  },
]

const initialWindows = [
  {
    id: 'welcome',
    title: 'Overview',
    x: 76,
    y: 96,
    w: 450,
    h: 270,
    minimized: false,
    z: 10,
    content: (
      <div className="pane">
        <h3>Fedora + GNOME style web desktop</h3>
        <p>Dark, clean, slick animations, and dock-centric workflow.</p>
        <p>Use the center clock or dock to open the app launcher.</p>
      </div>
    ),
  },
]

function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return {
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString([], {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
  }
}

export default function App() {
  const { time, date } = useClock()
  const [startOpen, setStartOpen] = useState(false)
  const [windows, setWindows] = useState(initialWindows)
  const [drag, setDrag] = useState(null)
  const desktopRef = useRef(null)

  const topZ = useMemo(() => Math.max(10, ...windows.map((w) => w.z || 10)) + 1, [windows])

  const focusWindow = (id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: false, z: topZ } : w)),
    )
  }

  const closeWindow = (id) => setWindows((prev) => prev.filter((w) => w.id !== id))

  const minimizeWindow = (id) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)))

  const openApp = (app) => {
    const found = windows.find((w) => w.id === app.id)
    if (found) {
      focusWindow(app.id)
      return
    }

    const newWindow = {
      id: app.id,
      title: app.label,
      x: 110 + Math.random() * 140,
      y: 110 + Math.random() * 90,
      w: 420,
      h: 270,
      minimized: false,
      z: topZ,
      content: app.content,
    }

    setWindows((prev) => [...prev, newWindow])
    setStartOpen(false)
  }

  const onPointerMove = (e) => {
    if (!drag) return
    const { id, offsetX, offsetY } = drag
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              x: e.clientX - offsetX,
              y: e.clientY - offsetY,
            }
          : w,
      ),
    )
  }

  return (
    <div
      className="desktop"
      ref={desktopRef}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      <div className="overlay" />
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <header className="topbar">
        <div className="pill left-pill">
          <span className="workspace-dot" />
          <span>Seelen UI</span>
        </div>

        <button className="pill time-pill" onClick={() => setStartOpen((s) => !s)}>
          {date}, {time}
        </button>

        <div className="pill right-pill">
          <span>SLO</span>
          <Settings2 size={14} />
          <Wifi size={14} />
          <Volume2 size={14} />
          <Bell size={14} />
          <BatteryFull size={14} />
          <span className="muted">81%</span>
        </div>
      </header>

      <main className="window-layer">
        {windows.map((w) =>
          w.minimized ? null : (
            <section
              key={w.id}
              className="window window-enter"
              style={{ left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
              onPointerDown={() => focusWindow(w.id)}
            >
              <div
                className="titlebar"
                onPointerDown={(e) => {
                  focusWindow(w.id)
                  setDrag({ id: w.id, offsetX: e.clientX - w.x, offsetY: e.clientY - w.y })
                }}
              >
                <div className="title-left">
                  <File size={14} />
                  <span>{w.title}</span>
                </div>
                <div className="window-actions">
                  <button onClick={() => minimizeWindow(w.id)} aria-label="Minimize">
                    <Minus size={14} />
                  </button>
                  <button onClick={() => closeWindow(w.id)} aria-label="Close">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="window-content">{w.content}</div>
            </section>
          ),
        )}
      </main>

      {startOpen && (
        <section className="start-menu menu-enter">
          <div className="search-wrap">
            <Search size={16} />
            <input placeholder="Type to search apps" />
          </div>

          <div className="start-grid">
            {APPS.map((app) => {
              const Icon = app.icon
              return (
                <button key={app.id} className="start-item" onClick={() => openApp(app)}>
                  <span className="start-icon" style={{ background: app.color }}>
                    <Icon size={16} />
                  </span>
                  <span>{app.label}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <footer className="dock-wrap">
        <div className="dock dock-enter">
          <button className="dock-btn start" onClick={() => setStartOpen((s) => !s)} title="Applications">
            ◼
          </button>

          {APPS.map((app) => {
            const Icon = app.icon
            return (
              <button key={app.id} className="dock-btn" onClick={() => openApp(app)} title={app.label}>
                <Icon size={18} />
              </button>
            )
          })}
        </div>
      </footer>
    </div>
  )
}
