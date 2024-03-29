// make global context from renrerer, camera, scene, controls
type ThreeContext = typeof defaultValues

class ThreeClass {
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  controls: any

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    // rotate camera to show bottom of globe
    this.camera.position.z = 1000

    this.scene = new THREE.Scene()

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.25
    this.controls.enableZoom = true
    this.controls.enablePan = false
    this.controls.minDistance = 600
    this.controls.maxDistance = 1200
  }
}

const defaultValues = new ThreeClass()

const GlobeContext = React.createContext<ThreeContext>(defaultValues)

const useThree = () => React.useContext(GlobeContext)

const ThreeProvider = ({
  children,
  clickHandler,
}: {
  children: React.ReactNode
  clickHandler?: (
    arg: THREE.Intersection<THREE.Object3D<THREE.Event>>,
    e: React.MouseEvent<Element, MouseEvent>
  ) => void
}) => {
  const globeRef = React.useRef<HTMLDivElement>()
  const { renderer, camera, scene } = useThree()

  React.useEffect(() => {
    if (globeRef) {
      globeRef.current.appendChild(renderer.domElement)
    }
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

  // click event
  const onMouseDown = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { left, top } = globeRef.current.getBoundingClientRect()
    const x = clientX - left
    const y = clientY - top
    const vector = new THREE.Vector3(
      (x / window.innerWidth) * 2 - 1,
      -(y / window.innerHeight) * 2 + 1,
      0.5
    )
    vector.unproject(camera)
    const raycaster = new THREE.Raycaster(
      camera.position,
      vector.sub(camera.position).normalize()
    )

    const intersects = raycaster.intersectObjects(scene.children)
    if (intersects.length > 0) {
      clickHandler(intersects[0], e)
      globeRef.current.style.cursor = "pointer"
    } else {
      globeRef.current.style.cursor = "default"
    }
  }

  return (
    <div
      ref={globeRef}
      onClick={onMouseDown}
      style={{
        backgroundColor: "#1b1b1b",
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
  radius = 1,
  ...rest
}) => {
  const { scene } = useThree()

  React.useEffect(() => {
    const geometry = new THREE.SphereGeometry(radius, 64, 64)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: debug,
      ...rest,
    })
    const sphere = new THREE.Mesh(geometry, material)

    scene.add(sphere)

    return () => {
      scene.remove(sphere)
    }
  }, [radius])

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

const Tiles: React.FC<MapTilesProps> = ({ radius, tiles }) => {
  const { scene } = useThree()

  const { positions, tilesIds, colors } = React.useMemo(() => {
    const ratio = radius / 450,
      geometry = new THREE.PlaneGeometry(12 * ratio, 12 * ratio),
      dotGeo = new THREE.BufferGeometry(),
      positions = [],
      colors = [],
      tilesIds = [],
      vector = new THREE.Vector3()

    tiles.forEach(({ phi, theta, color, id }) => {
      vector.setFromSphericalCoords(radius, phi, theta)
      dotGeo.copy(geometry)
      dotGeo.lookAt(vector)
      dotGeo.translate(vector.x, vector.y, vector.z)

      // convert number color into rgb vector3
      const rgb = new THREE.Color(color).toArray()

      for (let j = 0; j <= 3; j += 3) {
        for (let k = 0; k <= 6; k += 3) {
          colors.push(...rgb)
          for (let l = 0; l < 3; l++) {
            positions.push(dotGeo.attributes.position.array[j + k + l])
            tilesIds.push(id)
          }
        }
      }
    })

    return { positions, tilesIds, colors }
  }, [tiles])

  React.useEffect(() => {
    const group = new THREE.Group()
    const points = new THREE.BufferGeometry()
    // make sphere inside all points to prevent clicking through
    const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius - 10))

    group.add(sphereMesh)

    points.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    )
    points.setAttribute("tileId", new THREE.Float32BufferAttribute(tilesIds, 3))
    points.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        u_hover: { value: 0 },
        u_clicked: { value: 0 },
      },
      vertexShader: `
            uniform float u_hover;
            uniform float u_clicked;
            attribute vec3 color;
            attribute float tileId;
            varying vec3 vRndId;
            void main() {
              vRndId = color;

              if(u_hover == tileId) {
                vRndId = vec3(1.0, 0.0, 0.0);
              }
              if(u_clicked == tileId) {
                vRndId = vec3(0.0, 0.0, 0.0);
              }
              vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * modelViewPosition;
            }`,
      fragmentShader: `
            varying vec3 vRndId;
            void main() {         
              gl_FragColor = vec4(vRndId, 1.0);
            }`,
    })

    scene.add(new THREE.Mesh(points, material))

    return () => {
      scene.remove(group)
    }
  }, [positions, tilesIds, colors])

  return React.useMemo(() => tilesIds.filter((_, i) => i % 3 === 0), [tilesIds])
}

const App = () => {
  const [tiles, setTiles] = React.useState<MTile[]>([])

  React.useEffect(() => {
    const fetchTiles = async () => {
      const res = await fetch("./tiles.json")
      const tiles = await res.json()
      setTiles(tiles)
    }

    fetchTiles()
  }, [])

  const radius = 600

  const tilesData = React.useMemo(
    () =>
      Tiles({
        tiles: tiles,
        radius: radius,
      }),
    [tiles]
  )

  const clickCallback = (intersects, e) => {
    const tileId = tilesData[intersects.face.a]
    console.log(tileId, intersects.point)
  }

  return (
    <ThreeProvider clickHandler={clickCallback}>
      <Sphere radius={radius - 10} color={0x000000} />
    </ThreeProvider>
  )
}

ReactDOM.render(<App />, document.getElementById("globeViz"))

export {}
