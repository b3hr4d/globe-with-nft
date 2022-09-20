// three.js with orbit controls
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 10;
const scene = new THREE.Scene();
renderer.setSize(window.innerWidth, window.innerHeight);
const div = document.getElementById("globeViz");
div.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
// set zoom level not go over the grid
controls.minDistance = 1;
controls.maxDistance = 10;
div.addEventListener("click", detectMesh);
div.addEventListener("mousemove", detectMesh);
let clickedTile = null;
let hoveredTile = null;
const makeSphere = function () {
    // make sphere and show it from side
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const sphere = new THREE.Mesh(geometry);
    scene.add(sphere);
    return sphere;
};
const makeTiles = () => {
    // make perfect rounded circle using 1000 small tile top and bottom tiles looksAt the center of the circle
    const meshTiles = [];
    const tileGeometry = new THREE.PlaneGeometry(0.02, 0.02);
    const tileMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
    });
    // change to array of objects and change the color of the tile
    const tiles = Array.from({ length: 1000 }, (_, i) => ({
        color: Math.random() * 0xffffff,
        mesh: new THREE.Mesh(tileGeometry, tileMaterial),
    }));
    const tileLength = 10000;
    tiles.forEach(({ mesh, color }, i) => {
        const phi = Math.acos(-1 + (2 * i) / tileLength);
        const theta = Math.sqrt(tileLength * Math.PI) * phi;
        // position from top to bottom
        mesh.position.setFromSphericalCoords(1, phi, theta);
        mesh.position.normalize();
        mesh.position.multiplyScalar(1.001);
        mesh.lookAt(0, 0, 0);
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        mesh.material.color.setHex(color);
        mesh.name = `tile-${i}`;
        mesh.mouseenter = () => {
            console.log("mouseenter", mesh.name);
            div.style.cursor = "pointer";
        };
        mesh.mouseleave = () => {
            console.log("mouseleave", mesh.name);
            div.style.cursor = "default";
        };
        mesh.click = () => {
            console.log("click", mesh.name);
            const tween = new TWEEN.Tween(camera.position)
                .to({
                x: mesh.position.x,
                y: mesh.position.y,
                z: mesh.position.z,
            }, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
            tween.onComplete(() => {
                console.log("tween complete");
                grid.lookAt(camera.position);
            });
        };
        meshTiles.push(mesh);
        scene.add(mesh);
    });
    return meshTiles;
};
// make a circle surface inside the sphere exacly screen size
const makeGrid = function () {
    const geometry = new THREE.CircleGeometry(1, 64);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
    });
    const grid = new THREE.Mesh(geometry, material);
    scene.add(grid);
    return grid;
};
const sphere = makeSphere();
const tiles = makeTiles();
const grid = makeGrid();
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    TWEEN.update();
    controls.update();
}
animate();
function detectMesh(event) {
    event.preventDefault();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects([
        ...tiles,
        grid,
        sphere,
    ]);
    if (!intersects?.[0]?.object?.name) {
        div.style.cursor = "default";
        return;
    }
    if (event.type === "mousemove") {
        const tile = intersects[0];
        if (tile) {
            tile.object.mouseenter();
            hoveredTile = tile.object;
        }
        else {
            hoveredTile?.mouseleave();
        }
    }
    if (event.type === "click") {
        if (intersects.length > 0) {
            intersects[0]?.object.click();
            clickedTile = intersects[0]?.object;
            // disabel zoom and rotate
            controls.enableZoom = false;
            controls.enableRotate = false;
        }
    }
}
