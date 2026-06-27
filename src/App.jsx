import { useEffect, useMemo, useState } from 'react'
import {
  BatteryFull,
  Bell,
  Folder,
  Globe,
  Maximize2,
  MessageCircle,
  Minimize2,
  Minus,
  Monitor,
  Search,
  Settings2,
  Sparkles,
  TerminalSquare,
  Volume2,
  Wifi,
  X,
  Youtube,
} from 'lucide-react'

const DESKTOP_PADDING = 8
const TOP_BAR_HEIGHT = 46
const DOCK_HEIGHT = 56
const MIN_WINDOW_WIDTH = 320
const MIN_WINDOW_HEIGHT = 220

const APPS = [
  {
    id: 'files',
    label: 'Files',
    icon: Folder,
    color: '#60a5fa',
    logo: '📁',
    type: 'internal',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: TerminalSquare,
    color: '#34d399',
    logo: '⌨️',
    type: 'internal',
  },
  {
    id: 'browser',
    label: 'Browser',
    icon: Globe,
    color: '#f59e0b',
    logo: '🌐',
    type: 'web',
    url: 'https://www.wikipedia.org',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: MessageCircle,
    color: '#818cf8',
    logo: '💬',
    type: 'web',
    url: 'https://discord.com/app',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: Youtube,
    color: '#ef4444',
    logo: '▶️',
    type: 'web',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'copilot',
    label: 'Copilot',
    icon: Sparkles,
    color: '#38bdf8',
    logo: '🤖',
    type: 'web',
    url: 'https://github.com/features/copilot',
  },
]

const INITIAL_WINDOWS = [
  {
    id: 'welcome',
    appId: 'welcome',
    title: 'Seelen Session',
    x: 108,
    y: 98,
    w: 460,
    h: 280,
    minimized: false,
    maximized: false,
    z: 10,
    contentClass: 'pane',
  },
]

const FILES = ['Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Projects']

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

function clampWindow(win, desktop) {
  const maxW = Math.max(MIN_WINDOW_WIDTH, desktop.width - DESKTOP_PADDING * 2)
  const maxH = Math.max(MIN_WINDOW_HEIGHT, desktop.height - TOP_BAR_HEIGHT - DOCK_HEIGHT)
  const w = Math.min(Math.max(win.w, MIN_WINDOW_WIDTH), maxW)
  const h = Math.min(Math.max(win.h, MIN_WINDOW_HEIGHT), maxH)
  const maxX = desktop.width - w - DESKTOP_PADDING
  const maxY = desktop.height - h - DOCK_HEIGHT

  return {
    ...win,
    w,
    h,
    x: Math.min(Math.max(win.x, DESKTOP_PADDING), Math.max(DESKTOP_PADDING, maxX)),
    y: Math.min(Math.max(win.y, TOP_BAR_HEIGHT), Math.max(TOP_BAR_HEIGHT, maxY)),
  }
}

function AppContent({ app, filter }) {
  if (app?.id === 'files') {
    return (
      <div className="linux-pane">
        <div className="linux-pane-row">
          <strong>Home</strong>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <ul>
          {FILES.filter((item) => item.toLowerCase().includes(filter.toLowerCase() || '')).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (app?.id === 'terminal') {
    return (
      <div className="linux-pane terminal-pane">
        <p>subby@seelen:~$ neofetch</p>
        <p>OS: Fedora Linux 41 (simulated)</p>
        <p>Shell: zsh</p>
        <p>WM: GNOME</p>
        <p>CPU: 8-core virtual</p>
        <p>subby@seelen:~$ _</p>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="pane">
        <h3>Exact-match v2+</h3>
        <p>Resizable windows, Linux-like apps, and logo-rich launcher/dock.</p>
        <p>Open Files or Terminal for a more laptop-like desktop feel.</p>
      </div>
    )
  }

  return (
    <div className="web-app">
      <div className="pane-head">
        <span className="app-logo">{app.logo}</span>
        <h3>{app.label}</h3>
        <a href={app.url} target="_blank" rel="noreferrer" className="open-link">
          Open in new tab
        </a>
      </div>
      <iframe title={app.label} src={app.url} className="app-frame" />
    </div>
  )
}

export default function App() {
  const { date, time } = useClock()
  const [windows, setWindows] = useState(INITIAL_WINDOWS)
  const [drag, setDrag] = useState(null)
  const [resize, setResize] = useState(null)
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [desktopSize, setDesktopSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const onResize = () => {
      const size = { width: window.innerWidth, height: window.innerHeight }
      setDesktopSize(size)
      setWindows((prev) => prev.map((win) => (win.maximized ? maximizeWindow(win, size) : clampWindow(win, size))))
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const topZ = useMemo(() => Math.max(10, ...windows.map((w) => w.z || 10)) + 1, [windows])
  const visibleApps = APPS.filter((app) => app.label.toLowerCase().includes(query.toLowerCase()))

  const bringToFront = (id) => {
    setWindows((prev) => {
      const nextZ = Math.max(10, ...prev.map((w) => w.z || 10)) + 1
      return prev.map((w) => (w.id === id ? { ...w, minimized: false, z: nextZ } : w))
    })
  }

  const minimizeWindow = (id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
  }

  const closeWindow = (id) => setWindows((prev) => prev.filter((w) => w.id !== id))

  const maximizeWindow = (w, desktop = desktopSize) => ({
    ...w,
    x: DESKTOP_PADDING,
    y: TOP_BAR_HEIGHT,
    w: Math.max(MIN_WINDOW_WIDTH, desktop.width - DESKTOP_PADDING * 2),
    h: Math.max(MIN_WINDOW_HEIGHT, desktop.height - TOP_BAR_HEIGHT - DOCK_HEIGHT),
  })

  const toggleMaximize = (id) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        if (!w.maximized) {
          return {
            ...maximizeWindow(w),
            maximized: true,
            restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          }
        }

        const restore = w.restore || { x: 110, y: 90, w: 520, h: 360 }
        return {
          ...clampWindow({ ...w, ...restore, maximized: false, restore: null }, desktopSize),
        }
      }),
    )
  }

  const openApp = (app) => {
    const existing = windows.find((w) => w.id === app.id)
    if (existing) {
      bringToFront(app.id)
      return
    }

    const newWindow = clampWindow(
      {
        id: app.id,
        appId: app.id,
        title: app.label,
        x: 140 + Math.random() * 120,
        y: 96 + Math.random() * 90,
        w: 560,
        h: 380,
        minimized: false,
        maximized: false,
        z: topZ,
        contentClass: app.type === 'web' ? 'frame-content' : 'pane',
      },
      desktopSize,
    )

    setWindows((prev) => [...prev, newWindow])
    setLauncherOpen(false)
  }

  const onPointerMove = (e) => {
    if (drag) {
      const { id, offsetX, offsetY } = drag
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id && !w.maximized
            ? clampWindow({ ...w, x: e.clientX - offsetX, y: e.clientY - offsetY }, desktopSize)
            : w,
        ),
      )
      return
    }

    if (!resize) return

    const { id, startX, startY, startW, startH } = resize
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id || w.maximized) return w
        return clampWindow({ ...w, w: startW + deltaX, h: startH + deltaY }, desktopSize)
      }),
    )
  }

  return (
    <div
      className="desktop"
      onPointerMove={onPointerMove}
      onPointerUp={() => {
        setDrag(null)
        setResize(null)
      }}
      onPointerLeave={() => {
        setDrag(null)
        setResize(null)
      }}
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

      <aside className="desktop-shortcuts">
        {APPS.slice(0, 3).map((app) => (
          <button key={app.id} className="shortcut-btn" onClick={() => openApp(app)}>
            <span>{app.logo}</span>
            <small>{app.label}</small>
          </button>
        ))}
      </aside>

      <main className="windows-layer">
        {windows.map((w) => {
          if (w.minimized) return null
          const app = APPS.find((entry) => entry.id === w.appId)

          return (
            <section
              key={w.id}
              className="window win-enter"
              style={{ left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
              onPointerDown={() => bringToFront(w.id)}
            >
              <div
                className="titlebar"
                onPointerDown={(e) => {
                  bringToFront(w.id)
                  if (w.maximized) return
                  setDrag({ id: w.id, offsetX: e.clientX - w.x, offsetY: e.clientY - w.y })
                }}
              >
                <div className="title-left">
                  {app ? <span className="title-logo">{app.logo}</span> : <Monitor size={13} />}
                  <span>{w.title}</span>
                </div>
                <div className="actions">
                  <button onClick={() => minimizeWindow(w.id)} aria-label="Minimize">
                    <Minus size={13} />
                  </button>
                  <button onClick={() => toggleMaximize(w.id)} aria-label="Maximize">
                    {w.maximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>
                  <button onClick={() => closeWindow(w.id)} aria-label="Close">
                    <X size={13} />
                  </button>
                </div>
              </div>
              <div className={`content ${w.contentClass || ''}`.trim()}>
                <AppContent app={app} filter={query} />
              </div>
              {!w.maximized && (
                <button
                  className="resize-handle"
                  aria-label="Resize window"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    bringToFront(w.id)
                    setResize({
                      id: w.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      startW: w.w,
                      startH: w.h,
                    })
                  }}
                />
              )}
            </section>
          )
        })}
      </main>

      {launcherOpen && (
        <section className="launcher menu-enter">
          <div className="search-row">
            <Search size={14} />
            <input placeholder="Search apps" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="grid">
            {visibleApps.map((app) => {
              const Icon = app.icon
              return (
                <button key={app.id} className="grid-item" onClick={() => openApp(app)}>
                  <span className="grid-icon" style={{ background: app.color }}>
                    <Icon size={14} />
                  </span>
                  <span className="grid-label">
                    {app.logo} {app.label}
                  </span>
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

          {APPS.map((app) => (
            <button key={app.id} className="dock-btn" onClick={() => openApp(app)} title={app.label}>
              <span className="dock-logo">{app.logo}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  )
}
