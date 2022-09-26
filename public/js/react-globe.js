class ThreeClass {
    renderer;
    camera;
    scene;
    controls;
    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        // rotate camera to show bottom of globe
        this.camera.position.z = 1000;
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 600;
        this.controls.maxDistance = 1200;
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
            backgroundColor: "#1b1b1b",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
        } },
        children,
        React.createElement("button", { onClick: takeScreenshot, style: {
                position: "absolute",
                top: 0,
                left: 0,
            } }, "Take Screenshot")));
};
const Sphere = ({ debug = false, ratio = 1, radius = 1, ...rest }) => {
    const { scene } = useThree();
    React.useEffect(() => {
        const geometry = new THREE.SphereGeometry(radius, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: debug,
            ...rest,
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        return () => {
            scene.remove(sphere);
        };
    }, [radius]);
    return null;
};
const MapTiles = ({ tiles, debug = false, ratio = 1, raidus = 500, ...rest }) => {
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
            tile.position.setFromSphericalCoords(raidus, phi, theta);
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
const MapDots = ({ radius }) => {
    const { scene } = useThree();
    React.useEffect(() => {
        const group = new THREE.Group();
        // Create 60000 tiny dots and spiral them around the sphere.
        const DOT_COUNT = 60000;
        // A hexagon with a radius of 2 pixels looks like a circle
        const dotGeometry = new THREE.CircleGeometry(2, 5);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
        });
        // The XYZ coordinate of each dot
        const positions = [];
        // A random identifier for each dot
        const rndId = [];
        // The country border each dot falls within
        const countryIds = [];
        const vector = new THREE.Vector3();
        for (let i = DOT_COUNT; i >= 0; i--) {
            const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
            const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;
            // Pass the angle between this dot an the Y-axis (phi)
            // Pass this dot’s angle around the y axis (theta)
            // Scale each position by 600 (the radius of the globe)
            // Move the dot to the newly calculated position
            // Add the dot to the scene
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.setFromSphericalCoords(radius, phi, theta);
            dot.lookAt(0, 0, 0);
            group.add(dot);
        }
        scene.add(group);
        return () => {
            scene.remove(sphere);
        };
    }, [radius]);
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
    const radius = 600;
    return (React.createElement(ThreeProvider, null, loading ? ("Loading...") : (React.createElement(React.Fragment, null,
        React.createElement(Sphere, { radius: radius }),
        React.createElement(MapDots, { radius: radius })))));
};
ReactDOM.render(React.createElement(App, null), document.getElementById("globeViz"));
