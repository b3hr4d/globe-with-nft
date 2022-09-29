// make global context from renrerer, camera, group, controls
type ThreeContext = typeof defaultValues

class ThreeClass {
  group: THREE.Object3D<Event>[]

  constructor() {
    this.group = []
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
  const ObjRender = React.useRef<typeof ThreeRenderObjectsInstance>()
  const { group } = useThree()

  React.useEffect(() => {
    if (globeRef.current) {
      console.log(group)
      ObjRender.current = ThreeRenderObjects({ controlType: "orbit" })(
        globeRef.current
      ).objects(group)
    }
  }, [globeRef.current, group])

  React.useEffect(() => {
    if (ObjRender.current) {
      ObjRender.current.controls().enablePan = false
    }
    const animate = () => {
      if (ObjRender.current) {
        ObjRender.current.tick() // render it
        requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {}
  }, [ObjRender.current])

  return (
    <div
      ref={globeRef}
      onClick={() => {
        if (ObjRender.current) {
          ObjRender.current.onClick((_, inter) => {
            if (inter?.face?.a) {
              const tileId = Math.floor((inter.face.a / 60000) * 10000) + 1
              console.log(tileId, inter.face.a)
            }
          })
        }
      }}
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
  const { group } = useThree()

  React.useEffect(() => {
    const geometry = new THREE.SphereGeometry(radius, 64, 64)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: debug,
      ...rest,
    })
    const sphere = new THREE.Mesh(geometry, material)

    group.push(sphere)

    return () => {
      group.remove(sphere)
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
  const { group: ThreeG } = useThree()

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

    const mesh = new THREE.Mesh(points, material)

    ThreeG.push(group.add(mesh))

    return () => {
      group.remove(group)
    }
  }, [positions, tilesIds, colors])

  return null
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

  return (
    <ThreeProvider>
      <Tiles tiles={tiles} radius={radius} />
    </ThreeProvider>
  )
}

ReactDOM.render(<App />, document.getElementById("globeViz"))

export {}
