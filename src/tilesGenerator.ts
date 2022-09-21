const selectRandom = (chance = 100) => Math.random() * 100 < chance

const config = {
  tilesColor: [0x499b4a, 0xfffafa, 0x87ceeb, 0xfbd6a6],
  length: 10000,
  raidus: 100,
  ratio: 1,
  tileLength: 10000 + 1,
  sphereColor: 0xffffff,
}

const tilesData = Array.from({ length: config.length }, (_, i) => {
  const randomType = [60, 20, 15, 5].reduce(
    (acc, cur, index) => (selectRandom(cur) ? index : acc),
    0
  )
  const id = i + 1
  const color = config.tilesColor[randomType]

  const phi = Math.acos(-1 + (2 * id) / config.tileLength)
  const theta = Math.sqrt(config.tileLength * Math.PI) * phi
  const lat = Math.round(90 - (180 * phi) / Math.PI)
  const lng = Math.round((180 * theta) / Math.PI)

  return { id, color, phi, theta, lat, lng }
})

console.log(tilesData)
