// Gen random data
export {}
const config = {
  tilesColor: [
    0x00ff00, 0x00ff00, 0x00ff00, 0x00ff00, 0xffffff, 0xffffff, 0x00c3ff,
    0xffa240,
  ],
  length: 10000,
  raidus: 100,
  ratio: 1,
  tileLength: this.length + 1,
}

const makeTile = Array.from({ length }, (_, i) => {
  const id = i + 1
  const color =
    config.tilesColor[Math.floor(Math.random() * config.tilesColor.length)]
  const phi = Math.acos(-1 + (2 * id) / config.tileLength)
  const theta = Math.sqrt(config.tileLength * Math.PI) * phi
  const lat = Math.round(90 - (180 * phi) / Math.PI)
  const lng = Math.round((180 * theta) / Math.PI)

  return { id, color, phi, theta, lat, lng }
})

const Custom = () => {
  const globeEl = React.useRef<typeof GlobeMethods>()

  const width = 3
  const height = 3

  React.useEffect(() => {
    globeEl.current.pointOfView({ altitude: 1.5 })
  }, [])

  return (
    <Globe
      ref={globeEl}
      customLayerData={makeTile}
      customLayerLabel={({ id }: any) => id}
      customThreeObject={({ color, phi, theta }: any) => {
        const geometry = new THREE.PlaneGeometry(width, height)
        const material = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
        })

        const tile = new THREE.Mesh(geometry, material)
        // draw tile around the globe
        tile.position.setFromSphericalCoords(config.raidus, phi, theta)

        tile.position.multiplyScalar(1.01)

        tile.lookAt(0, 0, 0)

        return tile
      }}
      onCustomLayerClick={({ lat, lng }: any, event) => {
        // smothly zoom to tile on click and disable when pinch end
        globeEl.current.pointOfView({ lat, lng, altitude: 0.01 }, 1000)
      }}
    />
  )
}

ReactDOM.render(<Custom />, document.getElementById("globeViz"))
