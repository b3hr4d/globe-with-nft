var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
const enableAnimation = true;
const ratio = window.devicePixelRatio;
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(ratio);
const camera = new THREE.PerspectiveCamera(ratio * 10, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = ratio * 10;
camera.position.y = 10;
controls.rotateSpeed = 0.5;
controls.minDistance = ratio + 1.2;
controls.maxDistance = ratio * 10;
const scene = new THREE.Scene();
renderer.setSize(window.innerWidth, window.innerHeight);
const div = document.getElementById("globeViz");
div.appendChild(renderer.domElement);
div.addEventListener("mouseup", detectMesh);
div.addEventListener("mousedown", detectMesh);
div.addEventListener("mousemove", detectMesh);
let hoveredTile = null;
let lastPostion = { x: 0, y: 0, z: 0 };
const makeSphere = (ratio = 1, color = 0x000000) => {
    // make sphere and show it from side
    const radius = ratio * 1;
    const widthSegments = ratio * 32;
    const heightSegments = ratio * 32;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshBasicMaterial({
        color,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    return sphere;
};
const makeInside = (ratio = 1, map = [0, 0, 18, 0, 9, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) => {
    const meshWidth = ratio * 0.525;
    const meshHeight = ratio * 0.525;
    const tileHeight = 64, tileWidth = 130, tileNumber = 4, texWidth = 130, texHeight = 230, rows = 9, width = tileWidth * tileNumber, height = tileWidth * tileNumber;
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.translate(width / 2, tileHeight * 2.5);
    const texture = new THREE.CanvasTexture(ctx.canvas);
    const drawFromMap = (img, tileMap) => {
        clear();
        tileMap.forEach((t, i) => {
            const x = Math.trunc(i / tileNumber);
            const y = Math.trunc(i % tileNumber);
            const row = Math.trunc(t / rows);
            const col = Math.trunc(t % rows);
            drawTile(img, x, y, row, col);
        });
    };
    const clear = () => {
        ctx.clearRect(-width, -height, width * 2, height * 2);
    };
    const drawTile = (img, x, y, row, col) => {
        ctx.save();
        ctx.translate(((y - x) * tileWidth) / 2, ((x + y) * tileHeight) / 2);
        ctx.drawImage(img, row * texWidth, col * texHeight, texWidth, texHeight, -tileHeight, -tileWidth, texWidth, texHeight);
        ctx.restore();
    };
    const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
    });
    const mesh = new THREE.Mesh(geometry, material);
    fetch("./Texture.png").then(async (image) => {
        const img = await createImageBitmap(await image.blob());
        drawFromMap(img, map);
        texture.needsUpdate = true;
    });
    scene.add(mesh);
    return mesh;
};
let mapInside = null;
const makeTiles = (ratio = 1, length = 10000) => {
    const meshTiles = [];
    // make tiles that have depth
    const width = ratio * 0.029;
    const height = ratio * 0.029;
    const tilesColor = [
        0x00ff00, 0x00ff00, 0x00ff00, 0x00ff00, 0xffffff, 0xffffff, 0x00c3ff,
        0xffa240,
    ];
    // change to array of objects and change the color of the tile
    const tiles = Array.from({ length }, (_, i) => {
        const color = tilesColor[Math.floor(Math.random() * tilesColor.length)];
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            color,
            side: THREE.DoubleSide,
        });
        return { tile: new THREE.Mesh(geometry, material), color, id: i + 1 };
    });
    const tileLength = length + 1;
    tiles.forEach(({ tile, color, id }) => {
        const phi = Math.acos(-1 + (2 * id) / tileLength);
        const theta = Math.sqrt(tileLength * Math.PI) * phi;
        tile.position.setFromSphericalCoords(ratio, phi, theta);
        tile.position.normalize();
        tile.position.multiplyScalar(ratio);
        tile.name = `${id}`;
        tile.lookAt(0, 0, 0);
        tile.mouseenter = () => {
            console.log("mouseenter", tile.name);
            div.style.cursor = "pointer";
            tile.material.color.setHex(0xff0000);
            tile.scale.set(1, 1, 1.1);
        };
        tile.mouseleave = () => {
            console.log("mouseleave", tile.name);
            div.style.cursor = "default";
            tile.material.color.setHex(color);
            tile.scale.set(1, 1, 1);
        };
        tile.click = () => {
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
                    z: tile.position.z,
                }, 1000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(() => {
                    camera.lookAt(0, 0, 0);
                })
                    .onComplete(() => {
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
const makeLoading = (ratio = 1, color = 0x000000) => {
    const width = ratio * 1;
    const height = ratio * 1;
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
        color,
    });
    const loading = new THREE.Mesh(geometry, material);
    scene.add(loading);
    return loading;
};
const sphere = makeSphere(ratio);
const gridLoading = makeLoading(ratio);
const tiles = makeTiles(ratio);
mapInside = makeInside();
// const objects = []
const objects = [sphere, gridLoading, ...tiles];
let draged = false;
let isMouseDown = false;
function detectMesh(event) {
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
        intersects?.length > 0) {
        const tile = intersects[0].object;
        if (tile.click) {
            lastPostion = { ...camera.position };
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
    if (!intersects?.[0]?.object?.name) {
        div.style.cursor = "default";
        hoveredTile?.mouseleave();
        return;
    }
    if (event.type === "mousemove") {
        const tile = intersects[0];
        if (tile) {
            hoveredTile?.mouseleave();
            tile.object.mouseenter();
            hoveredTile = tile.object;
        }
        else {
            hoveredTile?.mouseleave();
        }
    }
}
const zoomBack = (event) => {
    event.preventDefault();
    if (enableAnimation) {
        // animate zoom back the camera to x, y then to z on last position
        new TWEEN.Tween(camera.position)
            .to({
            x: lastPostion.x,
            y: lastPostion.y,
            z: lastPostion.z,
        }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
            camera.lookAt(0, 0, 0);
        })
            .onComplete(() => {
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
