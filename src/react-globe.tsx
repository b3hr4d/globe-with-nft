// make global context from renrerer, camera, scene, controls
type ThreeContext = typeof defaultValues

class ThreeClass {
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  controls: any

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
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

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.25
    this.controls.enableZoom = true
    this.controls.enablePan = false
    this.controls.minDistance = 1.2
    this.controls.maxDistance = 5
  }
}

const defaultValues = new ThreeClass()

const GlobeContext = React.createContext<ThreeContext>(defaultValues)

const useThree = () => React.useContext(GlobeContext)

const ThreeProvider = ({ children }: { children: React.ReactNode }) => {
  const { renderer, camera, scene } = useThree()

  const domRef = (ref: HTMLDivElement) => {
    if (ref) {
      ref.appendChild(renderer.domElement)
    }
  }

  React.useEffect(() => {
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <div
      ref={domRef}
      style={{
        backgroundColor: "black",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  )
}

interface SphereProps {
  ratio?: number
  debug?: boolean
  radius?: number
  color?: number
  segments?: number
  wireframe?: boolean
  position?: THREE.Vector3
  onClick?: () => void
}

const Sphere: React.FC<SphereProps> = ({
  debug = false,
  ratio = 1,
  ...rest
}) => {
  const { scene } = useThree()

  React.useEffect(() => {
    const geometry = new THREE.SphereGeometry(ratio, 64, 64)
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: debug,
      ...rest,
    })
    const sphere = new THREE.Mesh(geometry, material)

    scene.add(sphere)

    return () => {
      scene.remove(sphere)
    }
  }, [])

  return null
}

interface MTile {
  id: number
  color: number
  phi: number
  theta: number
  lat: number
  lng: number
}

interface MapTilesProps {
  tiles: MTile[]
  debug?: boolean
  radius?: number
  ratio?: number
  segments?: number
  wireframe?: boolean
  onClick?: () => void
  tilesColor?: number[]
  length?: number
  raidus?: number
  tileLength?: number
}

const MapTiles: React.FC<MapTilesProps> = ({
  tiles,
  debug = false,
  ratio = 1,
  raidus = 1,
  ...rest
}) => {
  const { scene } = useThree()

  React.useEffect(() => {
    if (tiles?.length === 0) return
    const group = new THREE.Group()
    const width = ratio * 0.025
    const height = ratio * 0.025

    tiles.forEach(({ color, phi, theta }) => {
      const geometry = new THREE.PlaneGeometry(width, height)
      const material = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
      })

      const tile = new THREE.Mesh(geometry, material)
      tile.position.setFromSphericalCoords(raidus * ratio, phi, theta)

      tile.position.setFromSphericalCoords(ratio, phi, theta)
      tile.position.normalize()
      tile.position.multiplyScalar(ratio)

      tile.lookAt(0, 0, 0)

      group.add(tile)
    })

    scene.add(group)

    return () => {
      scene.remove(group)
    }
  }, [tiles])

  return null
}

const App = () => {
  const [tiles, setTiles] = React.useState<MTile[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchTiles = async () => {
      const res = await fetch("./tiles.json")
      const tiles = await res.json()
      setTiles(tiles)
      setLoading(false)
    }

    fetchTiles()
  }, [])

  return (
    <ThreeProvider>
      {loading ? (
        "Loading..."
      ) : (
        <React.Fragment>
          <Sphere />
          <MapTiles tiles={tiles} />
        </React.Fragment>
      )}
    </ThreeProvider>
  )
}

ReactDOM.render(<App />, document.getElementById("globeViz"))
