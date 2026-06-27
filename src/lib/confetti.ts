import confetti from 'canvas-confetti'

/** A short, festive burst — fired when a user hits a chat milestone. */
export function celebrate() {
  const end = Date.now() + 800
  const colors = ['#0A2236', '#1E4F70', '#27A9C4', '#93D9E6']

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}
