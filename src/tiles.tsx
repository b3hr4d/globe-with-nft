const mtr = new THREE.MeshLambertMaterial({
  color: "rgb(0, 225, 0, 1)",
})

const Tiles = () => {
  const [tilesData, setTilesData] = React.useState([])
  const [hoverD, setHoverD] = React.useState()

  React.useEffect(() => {
    const data = []
    const margin = 0.1
    // Generate 100 perfect grid around the globe
    for (let i = -10; i < 10; i++) {
      for (let j = -10; j < 10; j++) {
        data.push({
          lat: i * 10 + 5,
          lng: j * 10 + 5,
          width: 10 - margin,
          height: 10 - margin,
        })
      }
    }

    console.log(data.length)
    setTilesData(data)
  }, [])

  return (
    // @ts-ignore
    <Globe
      tilesData={tilesData}
      tileHeight="height"
      tileWidth="width"
      tileAltitude={(d) => (d === hoverD ? 0.02 : 0.01)}
      onTileClick={setHoverD}
      tileMaterial={mtr}
      animateIn={false}
    />
  )
}

ReactDOM.render(<Tiles />, document.getElementById("globeViz"))
