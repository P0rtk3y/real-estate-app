'use client'
import { useState, useEffect } from 'react'

interface Props {
  className?: string
  fallbackSize?: string
  animated?: boolean
  showChat?: boolean
}

const MESSAGES = [
  "Xin chào! 👋 Where shall we scout?",
  "Pick a city — I'll find the gems! 🏡",
  "I know all the best neighborhoods! 🥖",
  "Let's find your dream home! ✨",
  "I've scouted 500+ cities! 🛵",
]

export default function LanCharacter({ className = '', fallbackSize = 'text-8xl', animated = false, showChat = false }: Props) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [bubbleVisible, setBubbleVisible] = useState(false)

  useEffect(() => {
    if (!showChat) return
    const show = setTimeout(() => setBubbleVisible(true), 1200)
    const cycle = setInterval(() => {
      setBubbleVisible(false)
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length)
        setBubbleVisible(true)
      }, 300)
    }, 4500)
    return () => { clearTimeout(show); clearInterval(cycle) }
  }, [showChat])

  return (
    <div className="relative inline-flex items-end justify-center">
      <img
        src="/images/lan.png"
        alt="Lan the Scout"
        className={`${className}${animated ? ' lan-animated' : ''}`}
        onError={e => {
          const img = e.target as HTMLImageElement
          img.style.display = 'none'
          const fb = document.createElement('div')
          fb.textContent = '🥖'
          fb.className = `${fallbackSize} text-center`
          img.parentNode?.insertBefore(fb, img.nextSibling)
        }}
      />
      {showChat && bubbleVisible && (
        <div
          className="lan-bubble absolute -top-4 left-0 right-0 mx-auto w-max max-w-[200px] bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-xl border border-amber-100 text-xs font-bold text-gray-800 leading-snug pointer-events-none z-10"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(200,40,26,0.15))' }}
        >
          {MESSAGES[msgIndex]}
          {/* speech tail */}
          <div
            className="absolute -bottom-2 left-6 w-0 h-0"
            style={{
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '8px solid white',
            }}
          />
        </div>
      )}
    </div>
  )
}
