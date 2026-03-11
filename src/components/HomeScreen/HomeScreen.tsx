import { useGameStore } from '../../store/game-store'

const MINI_BOARD_COLORS = {
  light: '#E8F0E8',
  dark: '#B8D0B4',
}

const ARROW_COLORS = ['#3A70B0', '#B8860B', '#8D5AA5']

// Mini arrow geometry (matches UX design computeArrow with mini params)
const MINI_SZ = 100 // square size in viewBox
const MINI_STROKE = 22
const MINI_HEAD_HALF_W = 28
const MINI_HEAD_LEN = 38
const MINI_START_OFF = 30
const MINI_TIP_OFF = 5
const MINI_KNIGHT_R = 18
const MINI_RND = 0.22

interface MiniMove { sr: number; sc: number; dr: number; dc: number }

function buildMiniArrow(m: MiniMove) {
  const cx1 = m.sc * MINI_SZ + MINI_SZ / 2
  const cy1 = m.sr * MINI_SZ + MINI_SZ / 2
  const cx2 = m.dc * MINI_SZ + MINI_SZ / 2
  const cy2 = m.dr * MINI_SZ + MINI_SZ / 2

  const dRow = Math.abs(m.dr - m.sr)
  const dCol = Math.abs(m.dc - m.sc)
  const isKnight = (dRow === 2 && dCol === 1) || (dRow === 1 && dCol === 2)

  let shaft: string
  let hbx: number, hby: number, htx: number, hty: number, dx: number, dy: number

  if (!isKnight) {
    const ddx = cx2 - cx1, ddy = cy2 - cy1, len = Math.sqrt(ddx * ddx + ddy * ddy)
    const ux = ddx / len, uy = ddy / len
    shaft = `M${cx1 + ux * MINI_START_OFF},${cy1 + uy * MINI_START_OFF} L${cx2 - ux * MINI_HEAD_LEN},${cy2 - uy * MINI_HEAD_LEN}`
    hbx = cx2 - ux * MINI_HEAD_LEN; hby = cy2 - uy * MINI_HEAD_LEN
    htx = cx2 - ux * MINI_TIP_OFF; hty = cy2 - uy * MINI_TIP_OFF
    dx = ux; dy = uy
  } else if (dRow > dCol) {
    // Vertical first
    const dirV = cy2 > cy1 ? 1 : -1, dirH = cx2 > cx1 ? 1 : -1
    shaft = `M${cx1},${cy1 + MINI_START_OFF * dirV} L${cx1},${cy2 - MINI_KNIGHT_R * dirV} Q${cx1},${cy2} ${cx1 + MINI_KNIGHT_R * dirH},${cy2} L${cx2 - MINI_HEAD_LEN * dirH},${cy2}`
    hbx = cx2 - MINI_HEAD_LEN * dirH; hby = cy2
    htx = cx2 - MINI_TIP_OFF * dirH; hty = cy2
    dx = dirH; dy = 0
  } else {
    // Horizontal first
    const dirH = cx2 > cx1 ? 1 : -1, dirV = cy2 > cy1 ? 1 : -1
    shaft = `M${cx1 + MINI_START_OFF * dirH},${cy1} L${cx2 - MINI_KNIGHT_R * dirH},${cy1} Q${cx2},${cy1} ${cx2},${cy1 + MINI_KNIGHT_R * dirV} L${cx2},${cy2 - MINI_HEAD_LEN * dirV}`
    hbx = cx2; hby = cy2 - MINI_HEAD_LEN * dirV
    htx = cx2; hty = cy2 - MINI_TIP_OFF * dirV
    dx = 0; dy = dirV
  }

  // Rounded arrow head (matches UX design)
  const px = -dy, py = dx
  const lx = hbx + px * MINI_HEAD_HALF_W, ly = hby + py * MINI_HEAD_HALF_W
  const rx = hbx - px * MINI_HEAD_HALF_W, ry = hby - py * MINI_HEAD_HALF_W
  const r = MINI_RND
  const lmx = lx + (htx - lx) * r, lmy = ly + (hty - ly) * r
  const rmx = rx + (htx - rx) * r, rmy = ry + (hty - ry) * r
  const blx = lx + (rx - lx) * r, bly = ly + (ry - ly) * r
  const brx = rx + (lx - rx) * r, bry = ry + (ly - ry) * r
  const tlx = htx + (lx - htx) * r, tly = hty + (ly - hty) * r
  const trx = htx + (rx - htx) * r, tryPt = hty + (ry - hty) * r

  const headPath = `M${blx},${bly} Q${lx},${ly} ${lmx},${lmy} L${tlx},${tly} Q${htx},${hty} ${trx},${tryPt} L${rmx},${rmy} Q${rx},${ry} ${brx},${bry} Z`
  return { shaft, headPath }
}

// Same 3 mini moves as UX design: straight up, short up, knight
const MINI_MOVES: MiniMove[] = [
  { sr: 3, sc: 1, dr: 1, dc: 1 },
  { sr: 3, sc: 2, dr: 2, dc: 2 },
  { sr: 2, sc: 3, dr: 0, dc: 2 },
]

function MiniBoard() {
  return (
    <div
      className="grid grid-cols-4 grid-rows-4 rounded-[14px] overflow-hidden"
      style={{ width: 140, height: 140 }}
      aria-hidden="true"
    >
      {Array.from({ length: 16 }).map((_, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        const isLight = (row + col) % 2 === 0
        return (
          <div
            key={i}
            style={{ backgroundColor: isLight ? MINI_BOARD_COLORS.light : MINI_BOARD_COLORS.dark }}
          />
        )
      })}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" style={{ zIndex: 1 }}>
        {MINI_MOVES.map((m, i) => {
          const color = ARROW_COLORS[i]
          const { shaft, headPath } = buildMiniArrow(m)
          return (
            <g key={i}>
              <path d={shaft} stroke={color} strokeWidth={MINI_STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d={headPath} fill={color} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function HomeScreen() {
  const startNewGame = useGameStore((state) => state.startNewGame)
  const setShowSettings = useGameStore((state) => state.setShowSettings)
  const gameHistory = useGameStore((state) => state.gameHistory)

  const gameCount = gameHistory.length

  return (
    <div className="min-h-screen bg-(--color-bg) flex flex-col items-center justify-center relative">
      {/* Gear icon top-right */}
      <button
        className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-80 transition-opacity"
        onClick={() => setShowSettings(true)}
        aria-label="Réglages"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className="flex flex-col items-center gap-6" style={{ maxWidth: 320 }}>
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-[42px] font-extrabold tracking-tight leading-none">
            ch<span className="text-(--color-accent)">3</span>ss
          </h1>
          <p className="text-[13px] text-(--color-text-sec) mt-1">
            3 options, ton choix
          </p>
        </div>

        {/* Mini board */}
        <div className="relative">
          <MiniBoard />
        </div>

        {/* Play button */}
        <button
          onClick={startNewGame}
          className="px-14 py-3.5 rounded-[14px] text-[16px] font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Jouer
        </button>

        {/* Game counter */}
        <p className="text-[11px] text-(--color-text-sec)">
          {gameCount === 0 ? 'Première partie !' : `${gameCount} parties jouées`}
        </p>
      </div>
    </div>
  )
}
