"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const three_1 = require("three");
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
class ThreeClass {
    renderer;
    camera;
    scene;
    controls;
    constructor() {
        this.renderer = new three_1.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        this.camera = new three_1.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 3;
        this.scene = new three_1.Scene();
        this.controls = new OrbitControls_1.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 1.2;
        this.controls.maxDistance = 5;
    }
}
const defaultValues = new ThreeClass();
const GlobeContext = (0, react_1.createContext)(defaultValues);
const useThree = () => (0, react_1.useContext)(GlobeContext);
const ThreeProvider = ({ width, height, children, }) => {
    const { renderer, camera, controls, scene } = useThree();
    const domRef = (ref) => {
        if (ref) {
            ref.appendChild(renderer.domElement);
        }
    };
    (0, react_1.useEffect)(() => {
        const onResize = () => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            // make the whole globe go to bottom of screen
            camera.position.z = 3;
            controls.update();
        };
        onResize();
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, [width, height, renderer, camera, scene, controls]);
    (0, react_1.useEffect)(() => {
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
    }, []);
    return (React.createElement("div", { ref: domRef, style: {
            backgroundColor: 'black',
            width,
            height,
        } }, children));
};
const Sphere = ({ debug = false, ratio = 1, ...rest }) => {
    const { scene } = useThree();
    (0, react_1.useEffect)(() => {
        // margin sphere from top base of height * ratio
        const geometry = new three_1.SphereGeometry(ratio, 64, 64);
        const material = new three_1.MeshBasicMaterial({
            color: 0x000000,
            wireframe: debug,
            ...rest,
        });
        const sphere = new three_1.Mesh(geometry, material);
        scene.add(sphere);
        return () => {
            scene.remove(sphere);
        };
    }, []);
    return null;
};
const MapTiles = ({ tiles, debug = false, ratio = 1, raidus = 1, ...rest }) => {
    const { scene } = useThree();
    (0, react_1.useEffect)(() => {
        if (tiles?.length === 0)
            return;
        const group = new three_1.Group();
        const width = ratio * 0.025;
        const height = ratio * 0.025;
        tiles.forEach(({ color, phi, theta }) => {
            const geometry = new three_1.PlaneGeometry(width, height);
            const material = new three_1.MeshBasicMaterial({
                color,
                side: three_1.DoubleSide,
                ...rest,
            });
            const tile = new three_1.Mesh(geometry, material);
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
    }, []);
    return null;
};
const Globe = ({ width, height }) => {
    const [tiles, setTiles] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const fetchTiles = async () => {
            const res = await fetch('./assets/tiles.json');
            const tiles = await res.json();
            setTiles(tiles);
        };
        fetchTiles();
    }, []);
    return (React.createElement(ThreeProvider, { width: width, height: height },
        React.createElement(Sphere, null),
        React.createElement(MapTiles, { tiles: tiles })));
};
exports.default = Globe;
