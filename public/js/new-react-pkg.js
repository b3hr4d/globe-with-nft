// make context and provider to pass clickedTile and to button
const Context = React.createContext(null);
const useClickedTile = () => {
    const context = React.useContext(Context);
    if (!context) {
        throw new Error("useClickedTile must be used within a ClickedTileProvider");
    }
    return context;
};
const ClickedTileProvider = ({ children }) => {
    const [clickedTile, setClickedTile] = React.useState(null);
    return (React.createElement(Context.Provider, { value: { clickedTile, setClickedTile } }, children));
};
const Button = () => {
    const { clickedTile, setClickedTile } = useClickedTile();
    return (React.createElement("div", null,
        React.createElement("button", { onClick: () => {
                setClickedTile(null);
            } }, "Click"),
        clickedTile));
};
const GlobeWithTile = () => {
    const [tiles, setTiles] = React.useState([]);
    const globeEl = React.useRef();
    const { setClickedTile } = useClickedTile();
    React.useEffect(() => {
        const fetchTiles = async () => {
            const res = await fetch("./tiles.json");
            const tiles = await res.json();
            setTiles(tiles);
        };
        fetchTiles();
    }, []);
    const radius = 100.1;
    const { positions, tilesIds, colors } = React.useMemo(() => {
        const ratio = radius / 450, geometry = new THREE.PlaneGeometry(12 * ratio, 12 * ratio), dotGeo = new THREE.BufferGeometry(), positionsArray = [], colorsArray = [], tilesIdsArray = [], vector = new THREE.Vector3();
        console.log("readed");
        tiles.forEach(({ phi, theta, color, id }) => {
            vector.setFromSphericalCoords(radius, phi, theta);
            dotGeo.copy(geometry);
            dotGeo.lookAt(vector);
            dotGeo.translate(vector.x, vector.y, vector.z);
            // convert number color into rgb vector3
            const rgb = new THREE.Color(color).toArray();
            for (let j = 0; j <= 3; j += 3) {
                for (let k = 0; k <= 6; k += 3) {
                    colorsArray.push(...rgb);
                    for (let l = 0; l < 3; l++) {
                        positionsArray.push(dotGeo.attributes.position.array[j + k + l]);
                        tilesIdsArray.push(id);
                    }
                }
            }
        });
        const positions = new THREE.Float32BufferAttribute(positionsArray, 3);
        const tilesIds = new THREE.Float32BufferAttribute(tilesIdsArray, 3);
        const colors = new THREE.Float32BufferAttribute(colorsArray, 3);
        return { positions, tilesIds, colors };
    }, [tiles]);
    const material = React.useMemo(() => new THREE.ShaderMaterial({
        transparent: true,
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
            gl_FragColor = vec4(vRndId, 0.8);
          }`,
    }), []);
    const points = React.useMemo(() => {
        const points = new THREE.BufferGeometry();
        points.setAttribute("position", positions);
        points.setAttribute("tileId", tilesIds);
        points.setAttribute("color", colors);
        return points;
    }, [positions, tilesIds, colors]);
    React.useEffect(() => {
        globeEl.current.pointOfView({ altitude: 1.5 });
    }, []);
    return (React.createElement(Globe, { ref: globeEl, height: 700, onGlobeReady: () => {
            globeEl.current.controls().autoRotateSpeed = 0.5;
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().enableDamping = true;
            globeEl.current.controls().dampingFactor = 0.1;
            globeEl.current.controls().minDistance = 101;
            globeEl.current.controls().maxDistance = 300;
        }, customLayerData: [{}], customLayerLabel: React.useCallback(() => {
            const tileId = material.userData.tileId;
            return `
          <div style="border:1px solid; width: 70px; height: 25px; background: rgba(0, 0, 0, 0.5); color: white; display: flex; justify-content: center; align-items: center;">
            <b>${tileId}</b>
          </div>
        `;
        }, []), customThreeObject: React.useCallback(() => new THREE.Mesh(points, material), []), onCustomLayerClick: React.useCallback((_, { faceIndex }) => {
            const tileId = Math.floor(faceIndex / 2) + 1;
            // setClickedTile(tileId)
            material.uniforms.u_clicked.value = tileId;
            // move camera to tile smoothly
            console.log(globeEl.current.pointOfView);
            globeEl.current.pointOfView({
                lat: 10,
                lng: 20,
                altitude: 1.5,
            }, 1000);
            // globeEl.current.controls().autoRotate = false
        }, []), onCustomLayerHover: React.useCallback((_, { faceIndex }) => {
            const tileId = Math.floor(faceIndex / 2) + 1;
            material.userData = { tileId };
            material.uniforms.u_hovered.value = tileId;
        }, []) }));
};
ReactDOM.render(React.createElement(ClickedTileProvider, null,
    React.createElement(GlobeWithTile, null),
    React.createElement(Button, null)), document.getElementById("globeViz"));
