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
            antialias: true,
            alpha: true
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
    return ThreeClass;
}());
var defaultValues = new ThreeClass();
var GlobeContext = React.createContext(defaultValues);
var useThree = function () { return React.useContext(GlobeContext); };
var ThreeProvider = function (_a) {
    var children = _a.children;
    var _b = useThree(), renderer = _b.renderer, camera = _b.camera, scene = _b.scene;
    var domRef = function (ref) {
        if (ref) {
            ref.appendChild(renderer.domElement);
        }
    };
    React.useEffect(function () {
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
    return (<div ref={domRef} style={{
            backgroundColor: "black",
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
    var _b = _a.debug, debug = _b === void 0 ? false : _b, _c = _a.ratio, ratio = _c === void 0 ? 1 : _c, rest = __rest(_a, ["debug", "ratio"]);
    var scene = useThree().scene;
    React.useEffect(function () {
        var geometry = new THREE.SphereGeometry(ratio, 64, 64);
        var material = new THREE.MeshBasicMaterial(__assign({ color: 0x000000, wireframe: debug }, rest));
        var sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        return function () {
            scene.remove(sphere);
        };
    }, []);
    return null;
};
var MapTiles = function (_a) {
    var tiles = _a.tiles, _b = _a.debug, debug = _b === void 0 ? false : _b, _c = _a.ratio, ratio = _c === void 0 ? 1 : _c, _d = _a.raidus, raidus = _d === void 0 ? 1 : _d, rest = __rest(_a, ["tiles", "debug", "ratio", "raidus"]);
    var scene = useThree().scene;
    React.useEffect(function () {
        if ((tiles === null || tiles === void 0 ? void 0 : tiles.length) === 0)
            return;
        var group = new THREE.Group();
        var width = ratio * 0.025;
        var height = ratio * 0.025;
        tiles.forEach(function (_a) {
            var color = _a.color, phi = _a.phi, theta = _a.theta;
            var geometry = new THREE.PlaneGeometry(width, height);
            var material = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });
            var tile = new THREE.Mesh(geometry, material);
            tile.position.setFromSphericalCoords(raidus * ratio, phi, theta);
            tile.position.setFromSphericalCoords(ratio, phi, theta);
            tile.position.normalize();
            tile.position.multiplyScalar(ratio);
            tile.lookAt(0, 0, 0);
            group.add(tile);
        });
        scene.add(group);
        return function () {
            scene.remove(group);
        };
    }, [tiles]);
    return null;
};
var App = function () {
    var _a = React.useState([]), tiles = _a[0], setTiles = _a[1];
    var _b = React.useState(true), loading = _b[0], setLoading = _b[1];
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
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchTiles();
    }, []);
    return (<ThreeProvider>
      {loading ? ("Loading...") : (<React.Fragment>
          <Sphere />
          <MapTiles tiles={tiles}/>
        </React.Fragment>)}
    </ThreeProvider>);
};
ReactDOM.render(<App />, document.getElementById("globeViz"));
