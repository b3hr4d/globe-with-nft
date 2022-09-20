const { useState, useEffect } = React;
const polygonsMaterial = new THREE.MeshLambertMaterial({
    color: "darkslategrey",
    side: THREE.DoubleSide,
});
const Hollow = () => {
    const [landPolygons, setLandPolygons] = useState([]);
    useEffect(() => {
        // load data
        fetch("//unpkg.com/world-atlas/land-110m.json")
            .then((res) => res.json())
            .then((landTopo) => {
            setLandPolygons(topojson.feature(landTopo, landTopo.objects.land).features);
        });
    }, []);
    return (React.createElement(Globe, { backgroundColor: "rgba(0,0,0,0)", showGlobe: false, showAtmosphere: false, polygonsData: landPolygons, polygonCapMaterial: polygonsMaterial, polygonSideColor: () => "rgba(0, 0, 0, 0)" }));
};
ReactDOM.render(React.createElement(Hollow, null), document.getElementById("globeViz"));
