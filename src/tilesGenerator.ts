import { writeFile } from "fs"
import JSDOM from "jsdom"
import * as THREE from "three"

const { window } = new JSDOM.JSDOM()

global.window = window
global.document = window.document

class ThreeClass {
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  scene: THREE.Scene

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.z = 2

    this.scene = new THREE.Scene()
  }
}

const selectRandom = (chance = 100) => Math.random() * 100 < chance

const length = 10000

const config = {
  tilesColor: [0x499b4a, 0xfffafa, 0x87ceeb, 0xfbd6a6],
  raidus: 100,
  ratio: 1,
  tileLength: 10000 + 1,
}

const tilesData = Array.from({ length }, (_, i) => {
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

// save tilesData to json file
writeFile("tilesData.json", JSON.stringify(tilesData), (err) => {
  if (err) throw err
  console.log("The file has been saved!")
})
