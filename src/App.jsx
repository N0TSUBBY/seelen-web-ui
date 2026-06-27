import { useEffect, useMemo, useState } from 'react'
import {
  BatteryFull,
  Bell,
  Minus,
  Search,
  Settings2,
  Sparkles,
  Volume2,
  Wifi,
  X,
  MessageCircle,
  Monitor,
  Music2,
  Youtube,
} from 'lucide-react'

const APPS = [
  {
    id: 'spotify',
    label: 'Spotify',
    icon: Music2,
    color: '#22c55e',
    url: 'https://open.spotify.com',
    frameUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: MessageCircle,
    color: '#818cf8',
    url: 'https://discord.com/app',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: Youtube,
    color: '#ef4444',
    url: 'https://www.youtube.com',
    frameUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'copilot',
    label: 'Copilot',
    icon: Sparkles,
    color: '#38bdf8',
    url: 'https://github.com/copilot',
  },
]

const INITIAL_WINDOWS = [
  {
    id: 'welcome',
    title: 'Seelen Session',
    x: 108,
    y: 98,
    w: 430,
    h: 245,
    minimized: false,
    z: 10,
    content: (
      <div className="pane">
        <h3>Exact-match v2</h3>
        <p>Minimal top pills, tiny dock, dark Fedora/GNOME vibe.</p>
        <p>Click apps in dock to open and drag windows around.</p>
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
    date: now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }),
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function App() {
  const { date, time } = useClock()
  const [windows, setWindows] = useState(INITIAL_WINDOWS)
  const [drag, setDrag] = useState(null)
  const [launcherOpen, setLauncherOpen] = useState(false)

  const topZ = useMemo(() => Math.max(10, ...windows.map((w) => w.z || 10)) + 1, [windows])

  const focusWindow = (id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: false, z: topZ } : w)))
  }

  const minimizeWindow = (id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
  }

  const closeWindow = (id) => setWindows((prev) => prev.filter((w) => w.id !== id))

  const openApp = (app) => {
    const existing = windows.find((w) => w.id === app.id)
    if (existing) {
      focusWindow(app.id)
      return
    }

    const Icon = app.icon
    const newWindow = {
      id: app.id,
      title: app.label,
      x: 132 + Math.random() * 130,
      y: 110 + Math.random() * 88,
      w: 520,
      h: 360,
      minimized: false,
      z: topZ,
      contentClass: 'frame-content',
      content: (
        <div className="web-app">
          <div className="pane-head">
            <span className="app-chip" style={{ background: app.color }}>
              <Icon size={14} />
            </span>
            <h3>{app.label}</h3>
            <a href={app.url} target="_blank" rel="noreferrer" className="open-link">
              Open in new tab
            </a>
          </div>
          <iframe title={app.label} src={app.frameUrl || app.url} className="app-frame" />
        </div>
      ),
    }

    setWindows((prev) => [...prev, newWindow])
    setLauncherOpen(false)
  }

  const onPointerMove = (e) => {
    if (!drag) return
    const { id, offsetX, offsetY } = drag
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x: e.clientX - offsetX, y: e.clientY - offsetY } : w)),
    )
  }

  return (
    <div
      className="desktop"
      onPointerMove={onPointerMove}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
    >
      <div className="vignette" />

      <header className="top-strip">
        <div className="micro-pill left">
          <span className="workspace-index">1</span>
          <span className="brand-dot" />
          <span>Seelen UI</span>
        </div>

        <button className="micro-pill center" onClick={() => setLauncherOpen((v) => !v)}>
          {date}, {time}
        </button>

        <div className="micro-pill right">
          <span>SLO</span>
          <Settings2 size={12} />
          <Wifi size={12} />
          <Volume2 size={12} />
          <Bell size={12} />
          <BatteryFull size={12} />
          <span className="percent">81%</span>
        </div>
      </header>

      <main className="windows-layer">
        {windows.map((w) =>
          w.minimized ? null : (
            <section
              key={w.id}
              className="window win-enter"
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
                  <Monitor size={13} />
                  <span>{w.title}</span>
                </div>
                <div className="actions">
                  <button onClick={() => minimizeWindow(w.id)} aria-label="Minimize">
                    <Minus size={13} />
                  </button>
                  <button onClick={() => closeWindow(w.id)} aria-label="Close">
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className={`content ${w.contentClass || ''}`.trim()}>{w.content}</div>
            </section>
          ),
        )}
      </main>

      {launcherOpen && (
        <section className="launcher menu-enter">
          <div className="search-row">
            <Search size={14} />
            <input placeholder="Search" />
          </div>
          <div className="grid">
            {APPS.map((app) => {
              const Icon = app.icon
              return (
                <button key={app.id} className="grid-item" onClick={() => openApp(app)}>
                  <span className="grid-icon" style={{ background: app.color }}>
                    <Icon size={14} />
                  </span>
                  <span>{app.label}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <footer className="dock-wrap">
        <div className="dock tiny-dock-enter">
          <button className="dock-btn" onClick={() => setLauncherOpen((v) => !v)} title="Launcher">
            ◼
          </button>

          {APPS.map((app) => {
            const Icon = app.icon
            return (
              <button key={app.id} className="dock-btn" onClick={() => openApp(app)} title={app.label}>
                <Icon size={15} />
              </button>
            )
          })}
        </div>
      </footer>
    </div>
  )
}
