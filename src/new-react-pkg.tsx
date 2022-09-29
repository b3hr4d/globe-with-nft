// make context and provider to pass clickedTile and to button

type GeoPov = {
  lat: number
  lng: number
  altitude?: number
  id?: number
}
const Context = React.createContext<{
  clickedTile: number
  setClickedTile: (arg: number) => void
}>(null)

const useClickedTile = () => {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error("useClickedTile must be used within a ClickedTileProvider")
  }
  return context
}

const ClickedTileProvider = ({ children }) => {
  const [clickedTile, setClickedTile] = React.useState(null)
  return (
    <Context.Provider value={{ clickedTile, setClickedTile }}>
      {children}
    </Context.Provider>
  )
}

const Button = () => {
  const { clickedTile, setClickedTile } = useClickedTile()
  const [input, setInput] = React.useState<number>(clickedTile || 1)

  React.useEffect(() => {
    setInput(clickedTile || input)
  }, [clickedTile])

  return (
    // make form for gettting tileId and set it to clickedTile
    <div>
      <input
        type="number"
        value={input}
        onChange={(e) => {
          setInput(e.target.valueAsNumber)
        }}
      />
      <button
        onClick={() => {
          setClickedTile(input)
        }}
      >
        GoTo
      </button>
      <button
        onClick={() => {
          setClickedTile(0)
        }}
      >
        Back
      </button>
    </div>
  )
}

const makeInsideTile = async (
  tile,
  ratio = 100,
  map = [0, 0, 18, 0, 9, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
) => {
  const meshWidth = ratio * 1
  const meshHeight = ratio * 1
  console.log(tile)

  const tileHeight = 64,
    tileWidth = 130,
    tileNumber = 4,
    texWidth = 130,
    texHeight = 230,
    rows = 9,
    width = tileWidth * tileNumber,
    height = tileWidth * tileNumber

  const ctx = document.createElement("canvas").getContext("2d")
  ctx.canvas.width = width
  ctx.canvas.height = height

  ctx.translate(width / 2, tileHeight * 2.5)

  const texture = new THREE.CanvasTexture(ctx.canvas)

  const drawFromMap = (img: any, tileMap: number[]) => {
    clear()

    tileMap.forEach((t: number, i: number) => {
      const x = Math.trunc(i / tileNumber)
      const y = Math.trunc(i % tileNumber)
      const row = Math.trunc(t / rows)
      const col = Math.trunc(t % rows)
      drawTile(img, x, y, row, col)
    })
  }

  const clear = () => {
    ctx.clearRect(-width, -height, width * 2, height * 2)
  }

  const drawTile = (
    img: any,
    x: number,
    y: number,
    row: number,
    col: number
  ) => {
    ctx.save()
    ctx.translate(((y - x) * tileWidth) / 2, ((x + y) * tileHeight) / 2)
    ctx.drawImage(
      img,
      row * texWidth,
      col * texHeight,
      texWidth,
      texHeight,
      -tileHeight,
      -tileWidth,
      texWidth,
      texHeight
    )
    ctx.restore()
  }

  const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight)
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    map: texture,
  })
  const mesh = new THREE.Mesh(geometry, material)

  await fetch("./Texture.png").then(async (image) => {
    const img = await createImageBitmap(await image.blob())
    drawFromMap(img, map)

    texture.needsUpdate = true
  })

  return mesh
}

const GlobeWithTile = ({ globeEl, tiles }) => {
  const { clickedTile, setClickedTile } = useClickedTile()

  const radius = 100.1

  const { positions, tilesIds, colors } = React.useMemo(() => {
    const ratio = radius / 450,
      geometry = new THREE.PlaneGeometry(12 * ratio, 12 * ratio),
      dotGeo = new THREE.BufferGeometry(),
      positionsArray = [],
      colorsArray = [],
      tilesIdsArray = [],
      vector = new THREE.Vector3()

    console.log("readed")

    tiles.forEach(({ phi, theta, color, id }) => {
      vector.setFromSphericalCoords(radius, phi, theta)
      dotGeo.copy(geometry)
      dotGeo.lookAt(vector)
      dotGeo.translate(vector.x, vector.y, vector.z)

      // convert number color into rgb vector3
      const rgb = new THREE.Color(color).toArray()

      for (let j = 0; j <= 3; j += 3) {
        for (let k = 0; k <= 6; k += 3) {
          colorsArray.push(...rgb)
          for (let l = 0; l < 3; l++) {
            positionsArray.push(dotGeo.attributes.position.array[j + k + l])
            tilesIdsArray.push(id)
          }
        }
      }
    })

    const positions = new THREE.Float32BufferAttribute(positionsArray, 3)
    const tilesIds = new THREE.Float32BufferAttribute(tilesIdsArray, 3)
    const colors = new THREE.Float32BufferAttribute(colorsArray, 3)

    return { positions, tilesIds, colors }
  }, [tiles])

  const material = React.useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 1.0 },
        u_hovered: { value: 0 },
        u_clicked: { value: 0 },
      },
      vertexShader: `
        uniform float u_hovered;
        uniform float u_clicked;
        uniform float time;
        attribute vec3 color;
        attribute float tileId;
        varying vec3 vRndId;
        void main() {
          vRndId = color;
          if(time > 0.0) {
            if(tileId == u_hovered) {
              vRndId = vec3(1.0, 0.0, 2.0);
            }
            if(tileId == u_clicked) {
              vRndId = vec3(0.0, 1.0, 2.0);
            }
          }

          if(u_hovered == tileId) {
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
          gl_FragColor = vec4(vRndId, 1);
      }`,
    })
  }, [])

  const points = React.useMemo(() => {
    const points = new THREE.BufferGeometry()

    points.setAttribute("position", positions)
    points.setAttribute("tileId", tilesIds)
    points.setAttribute("color", colors)

    return points
  }, [positions, tilesIds, colors])

  const rightClickHandler = React.useCallback(() => {
    setClickedTile(null)
  }, [])

  const clickHandler = React.useCallback((tileId: number) => {
    setClickedTile(tileId)
  }, [])

  const hoverHandler = React.useCallback((tileId: number) => {
    material.uniforms.u_hovered.value = tileId
  }, [])

  return (
    <Globe
      ref={globeEl}
      rendererConfig={{ antialias: false }}
      height={700}
      onGlobeReady={() => {
        globeEl.current.controls().autoRotateSpeed = 0.1
        globeEl.current.controls().autoRotate = true
        globeEl.current.controls().enableDamping = true
        globeEl.current.controls().dampingFactor = 0.1
        globeEl.current.controls().minDistance = 99
        globeEl.current.controls().maxDistance = 300
      }}
      customLayerData={[{}]}
      customThreeObject={React.useCallback(
        () => new THREE.Mesh(points, material),
        [points, material]
      )}
      customLayerLabel={React.useCallback(() => {
        const tileId = material.userData.tileId
        return tileId
          ? `
          <div style="border:1px solid; width: 70px; height: 25px; background: rgba(0, 0, 0, 0.5); color: white; display: flex; justify-content: center; align-items: center;">
            <b>${tileId}</b>
          </div>
        `
          : null
      }, [])}
      onCustomLayerHover={React.useCallback(
        (_, { faceIndex }) =>
          clickedTile ? undefined : hoverHandler(Math.floor(faceIndex / 2) + 1),
        [clickedTile]
      )}
      onCustomLayerClick={React.useCallback(
        (_, { faceIndex }) => {
          if (clickedTile) return
          const tileId = Math.floor(faceIndex / 2) + 1
          clickHandler(tileId)
        },
        [clickedTile]
      )}
      onCustomLayerRightClick={rightClickHandler}
      onGlobeRightClick={rightClickHandler}
    />
  )
}

const App = () => {
  const [tiles, setTiles] = React.useState([])

  const texture = React.useRef(null)
  const globeEl = React.useRef<typeof GlobeMethods>()
  const cameraPov = React.useRef<GeoPov>({ lat: 0, lng: 0, altitude: 2 })
  const { clickedTile } = useClickedTile()

  React.useEffect(() => {
    const fetchTiles = async () => {
      const res = await fetch("./tiles.json")
      const tiles = await res.json()

      setTiles(tiles)
    }

    fetchTiles()
  }, [])

  React.useEffect(() => {
    console.log("clickedTile", clickedTile)
    let timer
    if (clickedTile) {
      const tile = tiles[clickedTile - 1]
      if (tile) {
        clearTimeout(timer)

        cameraPov.current = globeEl.current.pointOfView()

        globeEl.current.controls().autoRotate = false
        globeEl.current.controls().enableZoom = false
        globeEl.current.controls().enableRotate = false
        globeEl.current.pointOfView(
          {
            lat: tile.lat,
            lng: tile.lng,
            altitude: -0.1,
          },
          1000
        )

        const async = async () => {
          globeEl.current.scene().remove(texture.current)

          texture.current = await makeInsideTile(tile)
          timer = setTimeout(() => {
            texture.current.lookAt(globeEl.current.camera().position)
            globeEl.current.scene().add(texture.current)
          }, 1000)
        }
        async()
      }
    } else {
      clearTimeout(timer)
      globeEl.current.controls().enableZoom = true
      globeEl.current.controls().enableRotate = true

      const { lat, lng, altitude } = cameraPov.current
      globeEl.current.pointOfView(
        { lat, lng, altitude: altitude > 0.5 ? altitude : 0.5 },
        1000
      )
      timer = setTimeout(() => {
        globeEl.current.controls().autoRotate = true
      }, 2000)
    }
    return () => {
      globeEl.current.pointOfView(cameraPov.current, 1000)
      clearTimeout(timer)
    }
  }, [clickedTile])

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GlobeWithTile globeEl={globeEl} tiles={tiles} />
      <Button />
    </div>
  )
}

ReactDOM.render(
  <ClickedTileProvider>
    <App />
  </ClickedTileProvider>,
  document.getElementById("globeViz")
)
