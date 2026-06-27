import confetti from 'canvas-confetti'

/** A short, festive burst — fired when a user hits a chat milestone. */
export function celebrate() {
  const end = Date.now() + 800
  const colors = ['#7E5326', '#B5874F', '#E0CBB3', '#FBF7F0']

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
