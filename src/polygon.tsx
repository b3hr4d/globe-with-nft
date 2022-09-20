interface TileDataProps {
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: [number, number][][]
  }
}

const World = () => {
  const [countries, setCountries] = React.useState([])
  const [hoverD, setHoverD] = React.useState()

  React.useEffect(() => {
    fetch("../choropleth/countries.geojson").then((r) =>
      r.json().then((data) => {
        setCountries(data)
      })
    )
  }, [])

  return (
    <Globe
      hexPolygonsData={countries}
      hexPolygonAltitude={(d) => (d === hoverD ? 0.02 : 0.01)}
      hexPolygonResolution={3}
      hexPolygonColor={(d) =>
        d === hoverD ? "rgba(0, 225, 0, 1)" : "rgba(0, 225, 0, 0.5"
      }
      onHexPolygonClick={setHoverD}
      // change the color of the polygon onClick
      // @ts-ignore
      // hexPolygonLabel={({ properties: d }) => {
      //   return `
      // <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
      // Population: <i>${d.POP_EST}</i>
      // `
      // }}
    />
  )
}

ReactDOM.render(<World />, document.getElementById("globeViz"))
