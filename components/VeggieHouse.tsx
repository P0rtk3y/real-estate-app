'use client'

export default function VeggieHouse() {
  return (
    <img
      src="/images/veggie-house.png"
      alt="Bao's veggie house"
      className="h-52 sm:h-64 object-contain drop-shadow-2xl"
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}
