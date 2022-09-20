var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()

const ratio = window.devicePixelRatio

const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(ratio)

const camera = new THREE.PerspectiveCamera(
  ratio * 10,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const controls = new OrbitControls(camera, renderer.domElement)
camera.position.z = ratio * 10

controls.rotateSpeed = 0.5
controls.minDistance = ratio + 1.2
controls.maxDistance = ratio * 10

const scene = new THREE.Scene()

renderer.setSize(window.innerWidth, window.innerHeight)

const div = document.getElementById("globeViz")
div.appendChild(renderer.domElement)

div.addEventListener("mouseup", detectMesh)
div.addEventListener("mousedown", detectMesh)
div.addEventListener("mousemove", detectMesh)

let hoveredTile = null
let lastPostion = { x: 0, y: 0, z: 0 }
let tweenAnimation = null

const makeSphere = (ratio = 1, color = 0x000000) => {
  // make sphere and show it from side
  const radius = ratio * 1
  const widthSegments = ratio * 32
  const heightSegments = ratio * 32

  const geometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  )
  const material = new THREE.MeshBasicMaterial({
    color,
  })
  const sphere = new THREE.Mesh(geometry, material)

  scene.add(sphere)

  return sphere
}

const makeInside = (ratio = 1, color = 0x000000) => {
  const width = ratio * 1
  const height = ratio * 1

  const geometry = new THREE.PlaneGeometry(width, height)
  const material = new THREE.MeshBasicMaterial({
    color,
  })
  const grid = new THREE.Mesh(geometry, material)

  scene.add(grid)
  return grid
}

const makeTiles = (ratio = 1, length = 10000) => {
  const meshTiles: Tile[] = []
  // make tiles that have depth
  const width = ratio * 0.025
  const height = ratio * 0.025
  const tilesColor = [
    0x00ff00, 0x00ff00, 0x00ff00, 0x00ff00, 0xffffff, 0xffffff, 0x00c3ff,
    0xffa240,
  ]
  // change to array of objects and change the color of the tile
  const tiles: Tiles = Array.from({ length }, () => {
    const color = tilesColor[Math.floor(Math.random() * tilesColor.length)]
    const geometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
    })

    return { tile: new THREE.Mesh(geometry, material), color }
  })

  tiles.forEach(({ tile, color }, i) => {
    const phi = Math.acos(-1 + (2 * i) / length)
    const theta = Math.sqrt(length * Math.PI) * phi
    // position from top to bottom
    tile.position.setFromSphericalCoords(ratio, phi, theta)
    tile.position.normalize()
    tile.position.multiplyScalar(ratio)

    tile.lookAt(0, 0, 0)

    tile.name = `tile-${i}`
    tile.mouseenter = () => {
      console.log("mouseenter", tile.name)
      div.style.cursor = "pointer"
      tile.material.color.setHex(0xff0000)
      tile.scale.set(1, 1, 1.1)
    }

    tile.mouseleave = () => {
      console.log("mouseleave", tile.name)
      div.style.cursor = "default"
      tile.material.color.setHex(color)
      tile.scale.set(1, 1, 1)
    }

    tile.click = () => {
      console.log("click", tile.name)

      tweenAnimation = new TWEEN.Tween(camera.position)
        .to(
          {
            x: tile.position.x,
            y: tile.position.y,
            z: tile.position.z,
          },
          1000
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()

      tweenAnimation.onStart(() => {
        console.log("tween start")
        div.style.cursor = "default"

        grid.lookAt(tile.position)
      })
    }

    meshTiles.push(tile)
    scene.add(tile)
  })

  return meshTiles
}

const sphere = makeSphere(ratio),
  grid = makeInside(ratio),
  tiles = makeTiles(ratio)

const objects = [sphere, grid, ...tiles]

let draged = false
let isMouseDown = false

function detectMesh(event: MouseEvent) {
  event.preventDefault()

  console.log(event.type)
  if (event.type === "mousedown") {
    isMouseDown = true
  }

  if (event.type === "mousemove") {
    if (isMouseDown) {
      draged = true
      return
    }
  }

  if (event.type === "mouseup") {
    isMouseDown = false
    if (draged) {
      draged = false
      return
    }
  }

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  var intersects: Intersects = raycaster.intersectObjects(objects)

  if (
    event.type === "mouseup" &&
    !draged &&
    event.button === 0 &&
    intersects?.length > 0
  ) {
    const tile = intersects[0].object as Tile
    if (tile.click) {
      lastPostion = { ...camera.position }
      tile.click()
      // disable controls
      controls.enabled = false
      controls.minDistance = 0

      div.removeEventListener("click", detectMesh)
      div.removeEventListener("mousemove", detectMesh)
      // enable right click to zoom back
      div.addEventListener("contextmenu", zoomBack)
    }
  }

  if (!intersects?.[0]?.object?.name) {
    div.style.cursor = "default"
    hoveredTile?.mouseleave()
    return
  }

  if (event.type === "mousemove") {
    const tile = intersects[0]
    if (tile) {
      hoveredTile?.mouseleave()
      tile.object.mouseenter()
      hoveredTile = tile.object
    } else {
      hoveredTile?.mouseleave()
    }
  }
}

const zoomBack = (event: MouseEvent) => {
  event.preventDefault()

  tweenAnimation = new TWEEN.Tween(camera.position)
    .to(lastPostion, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start()

  tweenAnimation.onComplete(() => {
    controls.enabled = true
    controls.minDistance = ratio + 0.2

    div.addEventListener("click", detectMesh)
    div.addEventListener("mousemove", detectMesh)
    div.removeEventListener("contextmenu", zoomBack)
  })
}

function animate() {
  requestAnimationFrame(animate)

  TWEEN.update()

  controls.update()
  renderer.render(scene, camera)
}

animate()

//types
interface Tile
  extends THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  click?: () => void
  mousemove?: () => void
  mouseenter?: () => void
  mouseleave?: () => void
  cursor?: string
}

type Intersects = { object: Tile }[] | undefined

type Tiles = { tile: Tile; color: number }[]
