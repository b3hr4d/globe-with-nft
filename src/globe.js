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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var enableAnimation = true;
var ratio = window.devicePixelRatio;
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(ratio);
var camera = new THREE.PerspectiveCamera(ratio * 10, window.innerWidth / window.innerHeight, 0.1, 1000);
var controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = ratio * 10;
camera.position.y = 10;
controls.rotateSpeed = 0.5;
controls.minDistance = ratio + 1.2;
controls.maxDistance = ratio * 10;
var scene = new THREE.Scene();
renderer.setSize(window.innerWidth, window.innerHeight);
var div = document.getElementById("globeViz");
div.appendChild(renderer.domElement);
div.addEventListener("mouseup", detectMesh);
div.addEventListener("mousedown", detectMesh);
div.addEventListener("mousemove", detectMesh);
var hoveredTile = null;
var lastPostion = { x: 0, y: 0, z: 0 };
var makeSphere = function (ratio, color) {
    if (ratio === void 0) { ratio = 1; }
    if (color === void 0) { color = 0x000000; }
    // make sphere and show it from side
    var radius = ratio * 1;
    var widthSegments = ratio * 32;
    var heightSegments = ratio * 32;
    var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    var material = new THREE.MeshBasicMaterial({
        color: color
    });
    var sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    return sphere;
};
var makeInside = function (ratio, map) {
    if (ratio === void 0) { ratio = 1; }
    if (map === void 0) { map = [0, 0, 18, 0, 9, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; }
    var meshWidth = ratio * 0.525;
    var meshHeight = ratio * 0.525;
    var tileHeight = 64, tileWidth = 130, tileNumber = 4, texWidth = 130, texHeight = 230, rows = 9, width = tileWidth * tileNumber, height = tileWidth * tileNumber;
    var ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.translate(width / 2, tileHeight * 2.5);
    var texture = new THREE.CanvasTexture(ctx.canvas);
    var drawFromMap = function (img, tileMap) {
        clear();
        tileMap.forEach(function (t, i) {
            var x = Math.trunc(i / tileNumber);
            var y = Math.trunc(i % tileNumber);
            var row = Math.trunc(t / rows);
            var col = Math.trunc(t % rows);
            drawTile(img, x, y, row, col);
        });
    };
    var clear = function () {
        ctx.clearRect(-width, -height, width * 2, height * 2);
    };
    var drawTile = function (img, x, y, row, col) {
        ctx.save();
        ctx.translate(((y - x) * tileWidth) / 2, ((x + y) * tileHeight) / 2);
        ctx.drawImage(img, row * texWidth, col * texHeight, texWidth, texHeight, -tileHeight, -tileWidth, texWidth, texHeight);
        ctx.restore();
    };
    var geometry = new THREE.PlaneGeometry(meshWidth, meshHeight);
    var material = new THREE.MeshBasicMaterial({
        map: texture
    });
    var mesh = new THREE.Mesh(geometry, material);
    fetch("./Texture.png").then(function (image) { return __awaiter(_this, void 0, void 0, function () {
        var img, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = createImageBitmap;
                    return [4 /*yield*/, image.blob()];
                case 1: return [4 /*yield*/, _a.apply(void 0, [_b.sent()])];
                case 2:
                    img = _b.sent();
                    drawFromMap(img, map);
                    texture.needsUpdate = true;
                    return [2 /*return*/];
            }
        });
    }); });
    scene.add(mesh);
    return mesh;
};
var mapInside = null;
var makeTiles = function (ratio, length) {
    if (ratio === void 0) { ratio = 1; }
    if (length === void 0) { length = 10000; }
    var meshTiles = [];
    // make tiles that have depth
    var width = ratio * 0.029;
    var height = ratio * 0.029;
    var tilesColor = [
        0x00ff00, 0x00ff00, 0x00ff00, 0x00ff00, 0xffffff, 0xffffff, 0x00c3ff,
        0xffa240,
    ];
    // change to array of objects and change the color of the tile
    var tiles = Array.from({ length: length }, function (_, i) {
        var color = tilesColor[Math.floor(Math.random() * tilesColor.length)];
        var geometry = new THREE.PlaneGeometry(width, height);
        var material = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide
        });
        return { tile: new THREE.Mesh(geometry, material), color: color, id: i + 1 };
    });
    var tileLength = length + 1;
    tiles.forEach(function (_a) {
        var tile = _a.tile, color = _a.color, id = _a.id;
        var phi = Math.acos(-1 + (2 * id) / tileLength);
        var theta = Math.sqrt(tileLength * Math.PI) * phi;
        tile.position.setFromSphericalCoords(ratio, phi, theta);
        tile.position.normalize();
        tile.position.multiplyScalar(ratio);
        tile.name = "".concat(id);
        tile.lookAt(0, 0, 0);
        tile.mouseenter = function () {
            console.log("mouseenter", tile.name);
            div.style.cursor = "pointer";
            tile.material.color.setHex(0xff0000);
            tile.scale.set(1, 1, 1.1);
        };
        tile.mouseleave = function () {
            console.log("mouseleave", tile.name);
            div.style.cursor = "default";
            tile.material.color.setHex(color);
            tile.scale.set(1, 1, 1);
        };
        tile.click = function () {
            console.log("click", tile.name);
            div.style.cursor = "default";
            gridLoading.lookAt(tile.position);
            mapInside.lookAt(tile.position);
            if (enableAnimation) {
                // animate the camera to x, y then to z
                new TWEEN.Tween(camera.position)
                    .to({
                    x: tile.position.x,
                    y: tile.position.y,
                    z: tile.position.z
                }, 1000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(function () {
                    camera.lookAt(0, 0, 0);
                })
                    .onComplete(function () {
                    // mapInside = makeInside(
                    //   1,
                    //   [0, 0, 18, 0, 9, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    // )
                    // mapInside.lookAt(camera.position)
                })
                    .start();
            }
            else {
                camera.position.set(tile.position.x, tile.position.y, tile.position.z);
            }
        };
        meshTiles.push(tile);
        scene.add(tile);
    });
    return meshTiles;
};
var makeLoading = function (ratio, color) {
    if (ratio === void 0) { ratio = 1; }
    if (color === void 0) { color = 0x000000; }
    var width = ratio * 1;
    var height = ratio * 1;
    var geometry = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial({
        color: color
    });
    var loading = new THREE.Mesh(geometry, material);
    scene.add(loading);
    return loading;
};
var sphere = makeSphere(ratio);
var gridLoading = makeLoading(ratio);
var tiles = makeTiles(ratio);
mapInside = makeInside();
// const objects = []
var objects = __spreadArray([sphere, gridLoading], tiles, true);
var draged = false;
var isMouseDown = false;
function detectMesh(event) {
    var _a, _b;
    event.preventDefault();
    console.log(event.type);
    if (event.type === "mousedown") {
        isMouseDown = true;
    }
    if (event.type === "mousemove") {
        if (isMouseDown) {
            draged = true;
            return;
        }
    }
    if (event.type === "mouseup") {
        isMouseDown = false;
        if (draged) {
            draged = false;
            return;
        }
    }
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (event.type === "mouseup" &&
        !draged &&
        event.button === 0 &&
        (intersects === null || intersects === void 0 ? void 0 : intersects.length) > 0) {
        var tile = intersects[0].object;
        if (tile.click) {
            lastPostion = __assign({}, camera.position);
            tile.click();
            // disable controls
            controls.enabled = false;
            controls.minDistance = 0;
            div.removeEventListener("click", detectMesh);
            div.removeEventListener("mousemove", detectMesh);
            // enable right click to zoom back
            div.addEventListener("contextmenu", zoomBack);
        }
    }
    if (!((_b = (_a = intersects === null || intersects === void 0 ? void 0 : intersects[0]) === null || _a === void 0 ? void 0 : _a.object) === null || _b === void 0 ? void 0 : _b.name)) {
        div.style.cursor = "default";
        hoveredTile === null || hoveredTile === void 0 ? void 0 : hoveredTile.mouseleave();
        return;
    }
    if (event.type === "mousemove") {
        var tile = intersects[0];
        if (tile) {
            hoveredTile === null || hoveredTile === void 0 ? void 0 : hoveredTile.mouseleave();
            tile.object.mouseenter();
            hoveredTile = tile.object;
        }
        else {
            hoveredTile === null || hoveredTile === void 0 ? void 0 : hoveredTile.mouseleave();
        }
    }
}
var zoomBack = function (event) {
    event.preventDefault();
    if (enableAnimation) {
        // animate zoom back the camera to x, y then to z on last position
        new TWEEN.Tween(camera.position)
            .to({
            x: lastPostion.x,
            y: lastPostion.y,
            z: lastPostion.z
        }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(function () {
            camera.lookAt(0, 0, 0);
        })
            .onComplete(function () {
            controls.enabled = true;
            controls.minDistance = ratio + 1.2;
            div.addEventListener("click", detectMesh);
            div.addEventListener("mousemove", detectMesh);
            div.removeEventListener("contextmenu", zoomBack);
        })
            .start();
    }
    else {
        camera.position.set(lastPostion.x, lastPostion.y, lastPostion.z);
        controls.enabled = true;
        controls.minDistance = ratio + 0.2;
        div.addEventListener("click", detectMesh);
        div.addEventListener("mousemove", detectMesh);
        div.removeEventListener("contextmenu", zoomBack);
    }
};
function animate() {
    TWEEN.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
controls.update();
animate();
// convert each function to react component and hook
var useThree = function () {
    var dom = React.useRef(null);
    var _a = React.useState(), scene = _a[0], setScene = _a[1];
    var _b = React.useState(), camera = _b[0], setCamera = _b[1];
    var _c = React.useState(), renderer = _c[0], setRenderer = _c[1];
    var _d = React.useState(), controls = _d[0], setControls = _d[1];
    React.useEffect(function () {
        if (dom.current) {
            var scene_1 = new THREE.Scene();
            var camera_1 = new THREE.PerspectiveCamera(75, dom.current.clientWidth / dom.current.clientHeight, 0.1, 1000);
            var renderer_1 = new THREE.WebGLRenderer();
            renderer_1.setSize(dom.current.clientWidth, dom.current.clientHeight);
            dom.current.appendChild(renderer_1.domElement);
            var controls_1 = new OrbitControls(camera_1, renderer_1.domElement);
            controls_1.enableDamping = true;
            controls_1.dampingFactor = 0.25;
            controls_1.enableZoom = true;
            controls_1.minDistance = 1.2;
            controls_1.maxDistance = 5;
            setScene(scene_1);
            setCamera(camera_1);
            setRenderer(renderer_1);
            setControls(controls_1);
        }
    }, []);
    return { dom: dom, scene: scene, camera: camera, renderer: renderer, controls: controls };
};
