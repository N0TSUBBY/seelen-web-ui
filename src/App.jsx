import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  BatteryFull,
  Disc3,
  Folder,
  Minus,
  Search,
  Settings2,
  Shield,
  Volume2,
  Wifi,
  X,
} from 'lucide-react'

const APPS = [
  {
    id: 'files',
    label: 'Files',
    icon: Folder,
    color: '#f5be3d',
    content: (
      <div className="pane">
        <h3>Files</h3>
        <p>Clean file launcher panel. Add your folders in the next step.</p>
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
]

const initialWindows = [
  {
    id: 'welcome',
    title: 'Welcome',
    x: 72,
    y: 92,
    w: 420,
    h: 250,
    minimized: false,
    z: 10,
    content: (
      <div className="pane">
        <h3>Seelen-style Web Desktop</h3>
        <p>Designed clean, minimal and responsive for desktop and mobile.</p>
        <p>Use the dock buttons to open apps. Drag window by its title bar.</p>
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
      x: 100 + Math.random() * 140,
      y: 110 + Math.random() * 90,
      w: 410,
      h: 260,
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

      <header className="topbar">
        <div className="pill left-pill">
          <span className="logo-dot" />
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
              className="window"
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
                <span>{w.title}</span>
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
        <section className="start-menu">
          <div className="search-wrap">
            <Search size={16} />
            <input placeholder="Search apps" />
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
        <div className="dock">
          <button className="dock-btn start" onClick={() => setStartOpen((s) => !s)} title="Start">
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
