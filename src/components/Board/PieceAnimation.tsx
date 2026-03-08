import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/game-store'

const STAUNTY_BASE = 'https://cdn.jsdelivr.net/gh/lichess-org/lila@6e3b5257/public/piece/staunty'

function pieceImageUrl(color: string, type: string): string {
  return `${STAUNTY_BASE}/${color}${type.toUpperCase()}.svg`
}

function squareToPercent(square: string, isFlipped: boolean): { x: number; y: number } {
  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  if (isFlipped) {
    return { x: (7 - file) * 12.5, y: rank * 12.5 }
  }
  return { x: file * 12.5, y: (7 - rank) * 12.5 }
}

function calcKnightMid(from: string, to: string, isFlipped: boolean): { x: number; y: number } {
  const fromPos = squareToPercent(from, isFlipped)
  const toPos = squareToPercent(to, isFlipped)
  const dx = Math.abs(toPos.x - fromPos.x)
  const dy = Math.abs(toPos.y - fromPos.y)
  // Vertical first if vertical distance > horizontal distance
  if (dy > dx) {
    return { x: fromPos.x, y: toPos.y }
  }
  return { x: toPos.x, y: fromPos.y }
}

export function PieceAnimation() {
  const animatingMove = useGameStore((s) => s.animatingMove)
  const playerColor = useGameStore((s) => s.playerColor)
  const setAnimatingMove = useGameStore((s) => s.setAnimatingMove)
  const flyRef = useRef<HTMLDivElement>(null)
  const capturedRef = useRef<HTMLDivElement>(null)
  const isFlipped = playerColor === 'b'

  useEffect(() => {
    if (!animatingMove || !flyRef.current) return

    const { from, to, isKnight } = animatingMove
    const fromPos = squareToPercent(from, isFlipped)
    const toPos = squareToPercent(to, isFlipped)
    const el = flyRef.current

    // Capture animation: fade out + scale down
    if (capturedRef.current && animatingMove.capturedType) {
      capturedRef.current.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.7)' },
        ],
        { duration: 150, easing: 'ease-out', fill: 'forwards' },
      )
    }

    let duration: number

    if (isKnight) {
      // Two-leg L-shaped animation
      const midPos = calcKnightMid(from, to, isFlipped)
      duration = 240
      el.animate(
        [
          { left: `${fromPos.x}%`, top: `${fromPos.y}%` },
          { left: `${midPos.x}%`, top: `${midPos.y}%`, offset: 0.5, easing: 'ease-in' },
          { left: `${toPos.x}%`, top: `${toPos.y}%` },
        ],
        { duration, easing: 'ease-out', fill: 'forwards' },
      )
    } else {
      // Straight animation
      duration = 200
      el.animate(
        [
          { left: `${fromPos.x}%`, top: `${fromPos.y}%` },
          { left: `${toPos.x}%`, top: `${toPos.y}%` },
        ],
        { duration, easing: 'ease-out', fill: 'forwards' },
      )
    }

    const timer = setTimeout(() => {
      setAnimatingMove(null)
    }, duration)

    return () => clearTimeout(timer)
  }, [animatingMove, isFlipped, setAnimatingMove])

  if (!animatingMove) return null

  const { from, pieceColor, pieceType, capturedColor, capturedType, capturedSquare } = animatingMove
  const fromPos = squareToPercent(from, isFlipped)
  const toPos = squareToPercent(animatingMove.to, isFlipped)
  // For en passant, the captured piece is on a different square than the destination
  const capturedPos = capturedSquare
    ? squareToPercent(capturedSquare, isFlipped)
    : toPos
  const pieceUrl = pieceImageUrl(pieceColor, pieceType)
  const capturedUrl = capturedType && capturedColor ? pieceImageUrl(capturedColor, capturedType) : null

  return (
    <>
      {/* Captured piece fading out at destination */}
      {capturedUrl && (
        <div
          ref={capturedRef}
          className="absolute pointer-events-none"
          style={{
            left: `${capturedPos.x}%`,
            top: `${capturedPos.y}%`,
            width: '12.5%',
            height: '12.5%',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={capturedUrl}
            alt=""
            className="w-[88%] h-[88%]"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.18)) brightness(1.1)' }}
            draggable={false}
          />
        </div>
      )}

      {/* Flying piece */}
      <div
        ref={flyRef}
        className="absolute pointer-events-none"
        style={{
          left: `${fromPos.x}%`,
          top: `${fromPos.y}%`,
          width: '12.5%',
          height: '12.5%',
          zIndex: 11,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={pieceUrl}
          alt=""
          className="w-[88%] h-[88%]"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.18)) brightness(1.1)' }}
          draggable={false}
        />
      </div>
    </>
  )
}
