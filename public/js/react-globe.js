class ThreeClass {
    renderer;
    camera;
    scene;
    controls;
    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 2;
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 1.2;
        this.controls.maxDistance = 5;
    }
}
const defaultValues = new ThreeClass();
const GlobeContext = React.createContext(defaultValues);
const useThree = () => React.useContext(GlobeContext);
const ThreeProvider = ({ children }) => {
    const globeRef = React.useRef();
    const { renderer, camera, scene } = useThree();
    React.useEffect(() => {
        if (globeRef) {
            globeRef.current.appendChild(renderer.domElement);
        }
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);
    const takeScreenshot = () => {
        // open in new window like this
        //
        var w = window.open("", "");
        w.document.title = "Screenshot";
        //w.document.body.style.backgroundColor = "red";
        var img = new Image();
        // Without 'preserveDrawingBuffer' set to true, we must render now
        img.src = renderer.domElement.toDataURL();
        w.document.body.appendChild(img);
    };
    return (React.createElement("div", { ref: globeRef, style: {
            backgroundColor: "black",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
        } },
        children,
        React.createElement("button", { onClick: takeScreenshot }, "Take Screenshot")));
};
const Sphere = ({ debug = false, ratio = 1, ...rest }) => {
    const { scene } = useThree();
    React.useEffect(() => {
        const geometry = new THREE.SphereGeometry(ratio, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: debug,
            ...rest,
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        return () => {
            scene.remove(sphere);
        };
    }, []);
    return null;
};
const MapTiles = ({ tiles, debug = false, ratio = 1, raidus = 1, ...rest }) => {
    const { scene } = useThree();
    React.useEffect(() => {
        if (tiles?.length === 0)
            return;
        const group = new THREE.Group();
        const width = ratio * 0.025;
        const height = ratio * 0.025;
        tiles.forEach(({ color, phi, theta }) => {
            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({
                color,
                side: THREE.DoubleSide,
            });
            const tile = new THREE.Mesh(geometry, material);
            tile.position.setFromSphericalCoords(raidus * ratio, phi, theta);
            tile.position.setFromSphericalCoords(ratio, phi, theta);
            tile.position.normalize();
            tile.position.multiplyScalar(ratio);
            tile.lookAt(0, 0, 0);
            group.add(tile);
        });
        scene.add(group);
        return () => {
            scene.remove(group);
        };
    }, [tiles]);
    return null;
};
const MapTilesFlat = ({ tiles, debug = false, ratio = 1, raidus = 1, ...rest }) => {
    const { scene } = useThree();
    React.useEffect(() => {
        if (tiles?.length === 0)
            return;
        // make 2d CanvasTexture from tiles
        const canvas = document.createElement("canvas");
        canvas.width = 8192;
        canvas.height = 4096;
        const ctx = canvas.getContext("2d");
        const width = 64;
        const height = 64;
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //convert SphericalCoords to 2d coords
        tiles.forEach(({ color, phi, theta }) => {
            const x = (phi / (2 * Math.PI)) * canvas.width;
            const y = (theta / Math.PI) * canvas.height;
            ctx.fillStyle = `#${color.toString(16)}`;
            ctx.fillRect(x, y, width, height);
        });
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(4, 2);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const tile = new THREE.Mesh(geometry, material);
        tile.position.set(0, 0, 0);
        tile.lookAt(0, 0, 0);
        scene.add(tile);
        return () => {
            scene.remove(tile);
        };
    }, [tiles]);
    return null;
};
const App = () => {
    const [tiles, setTiles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        const fetchTiles = async () => {
            const res = await fetch("./tiles.json");
            const tiles = await res.json();
            setTiles(tiles);
            setLoading(false);
        };
        fetchTiles();
    }, []);
    return (React.createElement(ThreeProvider, null, loading ? ("Loading...") : (React.createElement(React.Fragment, null,
        React.createElement(MapTilesFlat, { tiles: tiles })))));
};
ReactDOM.render(React.createElement(App, null), document.getElementById("globeViz"));
