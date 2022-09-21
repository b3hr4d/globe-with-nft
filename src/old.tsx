const useSphere = (ratio: number, color: number) => {
    const { scene } = React.useContext(GlobeContext)
  
    const [sphere, setSphere] = React.useState<THREE.Mesh>()
  
    React.useEffect(() => {
      const geometry = new THREE.SphereGeometry(ratio, 32, 32)
      const material = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
      })
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)
  
      setSphere(sphere)
    }, [])
  
    return sphere
  }
  
  const useGrid = (ratio: number) => {
    const { scene } = useThree()
  
    const [grid, setGrid] = React.useState<THREE.GridHelper>()
  
    React.useEffect(() => {
      if (scene) {
        const grid = new THREE.GridHelper(ratio, 10)
        scene.add(grid)
        setGrid(grid)
      }
    }, [scene])
  
    return grid
  }
  interface MTile {
    id: number
    color: number
    phi: number
    theta: number
    lat: number
    lng: number
  }
  
  const useTiles = (ratio: number, tiles: MTile[]) => {
    const { scene } = useThree()
  
    const [objects, setObjects] = React.useState<THREE.Mesh[]>([])
  
    React.useEffect(() => {
      if (scene) {
        const objects = tiles.map(({ id, color, phi, theta }) => {
          const geometry = new THREE.PlaneGeometry(ratio, ratio)
          const material = new THREE.MeshBasicMaterial({ color })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.name = id.toString()
          mesh.position.setFromSphericalCoords(ratio, phi, theta)
          mesh.lookAt(0, 0, 0)
  
          scene.add(mesh)
          return mesh
        })
        setObjects(objects)
      }
    }, [scene])
  
    return objects
  }
  
  const useDetectMesh = (objects: THREE.Mesh[]) => {
    const { camera, renderer } = useThree()
  
    const [hoveredTile, setHoveredTile] = React.useState<Tile>()
  
    const detectMesh = React.useCallback(
      (event: MouseEvent | any) => {
        const mouse = new THREE.Vector2()
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, camera)
  
        const intersects = raycaster.intersectObjects(objects) as Intersects
  
        if (!intersects?.[0]?.object?.name) {
          return
        }
  
        if (event.type === "mousemove") {
          const tile = intersects[0]
          if (tile) {
            hoveredTile?.mouseleave()
            tile.object.mouseenter()
            setHoveredTile(tile.object)
          } else {
            hoveredTile?.mouseleave()
          }
        }
      },
      [objects, camera, renderer, hoveredTile]
    )
  
    return detectMesh
  }
  
  const useZoom = (ratio: number, objects: THREE.Mesh[]) => {
    const { camera, renderer, controls } = useThree()
  
    const [lastPostion, setLastPostion] = React.useState<THREE.Vector3>()
  
    const zoom = React.useCallback(
      (event: MouseEvent | any) => {
        const mouse = new THREE.Vector2()
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, camera)
  
        const intersects = raycaster.intersectObjects(objects) as Intersects
  
        if (!intersects?.[0]?.object?.name) {
          return
        }
  
        if (event.type === "click") {
          const tile = intersects[0]
          if (tile) {
            tile.object.click()
          }
        }
      },
      [renderer, camera, objects]
    )
  
    const zoomBack = () => {
      if (lastPostion) {
        camera.position.set(lastPostion.x, lastPostion.y, lastPostion.z)
        controls.enabled = true
        controls.minDistance = ratio + 0.2
      }
    }
  
    return { zoom, zoomBack, setLastPostion }
  }
  
  const useRender = (
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    controls: any
  ) => {
    const render = () => {
      requestAnimationFrame(render)
      renderer.render(scene, camera)
    }
  
    React.useEffect(() => {
      render()
      renderer.render(scene, camera)
      controls.update()
    }, [scene, camera, renderer, controls])
  }
  
  const config = {
    tilesColor: [
      0x00ff00, 0x00ff00, 0x00ff00, 0x00ff00, 0xffffff, 0xffffff, 0x00c3ff,
      0xffa240,
    ],
    length: 10000,
    raidus: 100,
    ratio: 1,
    tileLength: length + 1,
    sphereColor: 0xffffff,
  }
  
  
  const tilesData: MTile[] = Array.from({ length }, (_, i) => {
    const id = i + 1
    const color =
      config.tilesColor[Math.floor(Math.random() * config.tilesColor.length)]
    const phi = Math.acos(-1 + (2 * id) / config.tileLength)
    const theta = Math.sqrt(config.tileLength * Math.PI) * phi
    const lat = Math.round(90 - (180 * phi) / Math.PI)
    const lng = Math.round((180 * theta) / Math.PI)
  
    return { id, color, phi, theta, lat, lng }
  })
  
  const ReactGlobe = () => {
    const { scene, camera, renderer, controls } = useThree()
    const sphere = useSphere(config.ratio, config.sphereColor)
    const grid = useGrid(config.ratio)
    const objects = useTiles(config.ratio, tilesData)
  
    const detectMesh = useDetectMesh(objects)
    const { zoom, zoomBack, setLastPostion } = useZoom(config.ratio, objects)
  
    useRender(scene, camera, renderer, controls)
  
    React.useEffect(() => {
      window.addEventListener("mousemove", detectMesh)
      window.addEventListener("click", zoom)
  
      return () => {
        window.removeEventListener("mousemove", detectMesh)
        window.removeEventListener("click", zoom)
      }
    }
  
    return (
      <group>
        <mesh ref={sphere} />
        <mesh ref={grid} />
        {objects.map((object) => (
          <mesh ref={object} />
        ))}
      </group>
    )
    }
  
export { }

