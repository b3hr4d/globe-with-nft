const World = () => {
    const [countries, setCountries] = React.useState([]);
    const [hoverD, setHoverD] = React.useState();
    React.useEffect(() => {
        fetch("../choropleth/countries.geojson").then((r) => r.json().then((data) => {
            setCountries(data);
        }));
    }, []);
    return (React.createElement(Globe, { hexPolygonsData: countries, hexPolygonAltitude: (d) => (d === hoverD ? 0.02 : 0.01), hexPolygonResolution: 3, hexPolygonColor: (d) => d === hoverD ? "rgba(0, 225, 0, 1)" : "rgba(0, 225, 0, 0.5", onHexPolygonClick: setHoverD }));
};
ReactDOM.render(React.createElement(World, null), document.getElementById("globeViz"));
