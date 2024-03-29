var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _this = this;
var ThreeClass = /** @class */ (function () {
    function ThreeClass() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false
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
    return ThreeClass;
}());
var defaultValues = new ThreeClass();
var GlobeContext = React.createContext(defaultValues);
var useThree = function () { return React.useContext(GlobeContext); };
var ThreeProvider = function (_a) {
    var children = _a.children, clickHandler = _a.clickHandler;
    var globeRef = React.useRef();
    var _b = useThree(), renderer = _b.renderer, camera = _b.camera, scene = _b.scene;
    React.useEffect(function () {
        if (globeRef) {
            globeRef.current.appendChild(renderer.domElement);
        }
        var animate = function () {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
        var onResize = function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);
        return function () {
            window.removeEventListener("resize", onResize);
        };
    }, []);
    // click event
    var onMouseDown = function (e) {
        var clientX = e.clientX, clientY = e.clientY;
        var _a = globeRef.current.getBoundingClientRect(), left = _a.left, top = _a.top;
        var x = clientX - left;
        var y = clientY - top;
        var vector = new THREE.Vector3((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
        vector.unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            clickHandler(intersects[0], e);
            globeRef.current.style.cursor = "pointer";
        }
        else {
            globeRef.current.style.cursor = "default";
        }
    };
    return (<div ref={globeRef} onClick={onMouseDown} style={{
            backgroundColor: "#1b1b1b",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
        }}>
      {children}
    </div>);
};
var Sphere = function (_a) {
    var _b = _a.debug, debug = _b === void 0 ? false : _b, _c = _a.ratio, ratio = _c === void 0 ? 1 : _c, _d = _a.radius, radius = _d === void 0 ? 1 : _d, rest = __rest(_a, ["debug", "ratio", "radius"]);
    var scene = useThree().scene;
    React.useEffect(function () {
        var geometry = new THREE.SphereGeometry(radius, 64, 64);
        var material = new THREE.MeshBasicMaterial(__assign({ color: 0xffffff, wireframe: debug }, rest));
        var sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        return function () {
            scene.remove(sphere);
        };
    }, [radius]);
    return null;
};
var Tiles = function (_a) {
    var radius = _a.radius, tiles = _a.tiles;
    var scene = useThree().scene;
    var _b = React.useMemo(function () {
        var ratio = radius / 450, geometry = new THREE.PlaneGeometry(12 * ratio, 12 * ratio), dotGeo = new THREE.BufferGeometry(), positions = [], colors = [], tilesIds = [], vector = new THREE.Vector3();
        tiles.forEach(function (_a) {
            var phi = _a.phi, theta = _a.theta, color = _a.color, id = _a.id;
            vector.setFromSphericalCoords(radius, phi, theta);
            dotGeo.copy(geometry);
            dotGeo.lookAt(vector);
            dotGeo.translate(vector.x, vector.y, vector.z);
            // convert number color into rgb vector3
            var rgb = new THREE.Color(color).toArray();
            for (var j = 0; j <= 3; j += 3) {
                for (var k = 0; k <= 6; k += 3) {
                    colors.push.apply(colors, rgb);
                    for (var l = 0; l < 3; l++) {
                        positions.push(dotGeo.attributes.position.array[j + k + l]);
                        tilesIds.push(id);
                    }
                }
            }
        });
        return { positions: positions, tilesIds: tilesIds, colors: colors };
    }, [tiles]), positions = _b.positions, tilesIds = _b.tilesIds, colors = _b.colors;
    React.useEffect(function () {
        var group = new THREE.Group();
        var points = new THREE.BufferGeometry();
        // make sphere inside all points to prevent clicking through
        var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius - 10));
        group.add(sphereMesh);
        points.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        points.setAttribute("tileId", new THREE.Float32BufferAttribute(tilesIds, 3));
        points.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        var material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                u_hover: { value: 0 },
                u_clicked: { value: 0 }
            },
            vertexShader: "\n            uniform float u_hover;\n            uniform float u_clicked;\n            attribute vec3 color;\n            attribute float tileId;\n            varying vec3 vRndId;\n            void main() {\n              vRndId = color;\n\n              if(u_hover == tileId) {\n                vRndId = vec3(1.0, 0.0, 0.0);\n              }\n              if(u_clicked == tileId) {\n                vRndId = vec3(0.0, 0.0, 0.0);\n              }\n              vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);\n              gl_Position = projectionMatrix * modelViewPosition;\n            }",
            fragmentShader: "\n            varying vec3 vRndId;\n            void main() {         \n              gl_FragColor = vec4(vRndId, 1.0);\n            }"
        });
        scene.add(new THREE.Mesh(points, material));
        return function () {
            scene.remove(group);
        };
    }, [positions, tilesIds, colors]);
    return React.useMemo(function () { return tilesIds.filter(function (_, i) { return i % 3 === 0; }); }, [tilesIds]);
};
var App = function () {
    var _a = React.useState([]), tiles = _a[0], setTiles = _a[1];
    React.useEffect(function () {
        var fetchTiles = function () { return __awaiter(_this, void 0, void 0, function () {
            var res, tiles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("./tiles.json")];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        tiles = _a.sent();
                        setTiles(tiles);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchTiles();
    }, []);
    var radius = 600;
    var tilesData = React.useMemo(function () {
        return Tiles({
            tiles: tiles,
            radius: radius
        });
    }, [tiles]);
    var clickCallback = function (intersects, e) {
        var tileId = tilesData[intersects.face.a];
        console.log(tileId, intersects.point);
    };
    return (<ThreeProvider clickHandler={clickCallback}>
      <Sphere radius={radius - 10} color={0x000000}/>
    </ThreeProvider>);
};
ReactDOM.render(<App />, document.getElementById("globeViz"));
