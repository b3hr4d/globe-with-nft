const Chorop = () => {
  const [countries, setCountries] = React.useState([])
  const [hoverD, setHoverD] = React.useState()

  React.useEffect(() => {
    // load data
    fetch("./countries.geojson")
      .then((res) => res.json())
      .then(setCountries)
  }, [])

  return (
    <Globe
      lineHoverPrecision={0}
      polygonsData={countries}
      polygonAltitude={(d) => (d === hoverD ? 0.12 : 0.06)}
      polygonSideColor={() => "rgba(0, 100, 0, 0.15)"}
      polygonStrokeColor={() => "#111"}
      // polygonLabel={({ properties: d }) => `
      //     <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
      //     GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
      //     Population: <i>${d.POP_EST}</i>
      //   `}
      onPolygonHover={setHoverD}
      polygonsTransitionDuration={300}
    />
  )
}

ReactDOM.render(<Chorop />, document.getElementById("globeViz"))
