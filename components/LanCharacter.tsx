'use client'

interface Props {
  className?: string
  fallbackSize?: string
}

export default function LanCharacter({ className = '', fallbackSize = 'text-8xl' }: Props) {
  return (
    <img
      src="/images/lan.png"
      alt="Lan the Scout"
      className={className}
      onError={e => {
        const img = e.target as HTMLImageElement
        img.style.display = 'none'
        const fb = document.createElement('div')
        fb.textContent = '🥖'
        fb.className = `${fallbackSize} text-center`
        img.parentNode?.insertBefore(fb, img.nextSibling)
      }}
    />
  )
}
