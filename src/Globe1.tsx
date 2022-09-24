import { createContext, FC, useContext, useEffect, useState } from 'react'
import {
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// make global context from renrerer, camera, scene, controls
type ThreeContext = typeof defaultValues

class ThreeClass {
  renderer: WebGLRenderer
  camera: PerspectiveCamera
  scene: Scene
  controls: OrbitControls

  constructor() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.z = 3

    this.scene = new Scene()

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

const GlobeContext = createContext<ThreeContext>(defaultValues)

const useThree = () => useContext(GlobeContext)

const ThreeProvider = ({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children: React.ReactNode
}) => {
  const { renderer, camera, controls, scene } = useThree()

  const domRef = (ref: HTMLDivElement) => {
    if (ref) {
      ref.appendChild(renderer.domElement)
    }
  }

  useEffect(() => {
    const onResize = () => {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      // make the whole globe go to bottom of screen
      camera.position.z = 3

      controls.update()
    }

    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [width, height, renderer, camera, scene, controls])

  useEffect(() => {
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()
  }, [])

  return (
    <div
      ref={domRef}
      style={{
        backgroundColor: 'black',
        width,
        height,
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
  position?: Vector3
  onClick?: () => void
}

const Sphere: FC<SphereProps> = ({ debug = false, ratio = 1, ...rest }) => {
  const { scene } = useThree()

  useEffect(() => {
    // margin sphere from top base of height * ratio
    const geometry = new SphereGeometry(ratio, 64, 64)
    const material = new MeshBasicMaterial({
      color: 0x000000,
      wireframe: debug,
      ...rest,
    })
    const sphere = new Mesh(geometry, material)

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

const MapTiles: FC<MapTilesProps> = ({
  tiles,
  debug = false,
  ratio = 1,
  raidus = 1,
  ...rest
}) => {
  const { scene } = useThree()

  useEffect(() => {
    if (tiles?.length === 0) return
    const group = new Group()
    const width = ratio * 0.025
    const height = ratio * 0.025

    tiles.forEach(({ color, phi, theta }) => {
      const geometry = new PlaneGeometry(width, height)
      const material = new MeshBasicMaterial({
        color,
        side: DoubleSide,
        ...rest,
      })

      const tile = new Mesh(geometry, material)
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
  }, [])

  return null
}

const Globe = ({ width, height }) => {
  const [tiles, setTiles] = useState<MTile[]>([])

  useEffect(() => {
    const fetchTiles = async () => {
      const res = await fetch('./assets/tiles.json')
      const tiles = await res.json()
      setTiles(tiles)
    }

    fetchTiles()
  }, [])

  return (
    <ThreeProvider width={width} height={height}>
      <Sphere />
      <MapTiles tiles={tiles} />
    </ThreeProvider>
  )
}

export default Globe
