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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var ratio = window.devicePixelRatio;
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(ratio);
var camera = new THREE.PerspectiveCamera(ratio * 10, window.innerWidth / window.innerHeight, 0.1, 1000);
var controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = ratio * 10;
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
var tweenAnimation = null;
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
var makeInside = function (ratio, color) {
    if (ratio === void 0) { ratio = 1; }
    if (color === void 0) { color = 0x000000; }
    var width = ratio * 1;
    var height = ratio * 1;
    var geometry = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial({
        color: color
    });
    var grid = new THREE.Mesh(geometry, material);
    scene.add(grid);
    return grid;
};
var makeTiles = function (ratio, length) {
    if (ratio === void 0) { ratio = 1; }
    if (length === void 0) { length = 10000; }
    var meshTiles = [];
    // make tiles that have depth
    var width = ratio * 0.025;
    var height = ratio * 0.025;
    var tilesColor = [
        0x00ff00, 0x00ff00, 0x00ff00, 0x00ff00, 0xffffff, 0xffffff, 0x00c3ff,
        0xffa240,
    ];
    // change to array of objects and change the color of the tile
    var tiles = Array.from({ length: length }, function () {
        var color = tilesColor[Math.floor(Math.random() * tilesColor.length)];
        var geometry = new THREE.PlaneGeometry(width, height);
        var material = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide
        });
        return { tile: new THREE.Mesh(geometry, material), color: color };
    });
    tiles.forEach(function (_a, i) {
        var tile = _a.tile, color = _a.color;
        var phi = Math.acos(-1 + (2 * i) / length);
        var theta = Math.sqrt(length * Math.PI) * phi;
        // position from top to bottom
        tile.position.setFromSphericalCoords(ratio, phi, theta);
        tile.position.normalize();
        tile.position.multiplyScalar(ratio);
        tile.lookAt(0, 0, 0);
        tile.name = "tile-".concat(i);
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
            tweenAnimation = new TWEEN.Tween(camera.position)
                .to({
                x: tile.position.x,
                y: tile.position.y,
                z: tile.position.z
            }, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
            tweenAnimation.onStart(function () {
                console.log("tween start");
                div.style.cursor = "default";
                grid.lookAt(tile.position);
            });
        };
        meshTiles.push(tile);
        scene.add(tile);
    });
    return meshTiles;
};
var sphere = makeSphere(ratio), grid = makeInside(ratio), tiles = makeTiles(ratio);
var objects = __spreadArray([sphere, grid], tiles, true);
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
    tweenAnimation = new TWEEN.Tween(camera.position)
        .to(lastPostion, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
    tweenAnimation.onComplete(function () {
        controls.enabled = true;
        controls.minDistance = ratio + 0.2;
        div.addEventListener("click", detectMesh);
        div.addEventListener("mousemove", detectMesh);
        div.removeEventListener("contextmenu", zoomBack);
    });
};
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
    renderer.render(scene, camera);
}
animate();
