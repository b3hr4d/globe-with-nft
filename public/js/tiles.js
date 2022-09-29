"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data = () => {
    const radius = 100, ratio = radius / 450, dots = 10000, geometry = new THREE.PlaneGeometry(12 * ratio, 12 * ratio), dotGeo = new THREE.BufferGeometry(), positions = [], colors = [], tilesIds = [], vector = new THREE.Vector3(), clrs = [
        [0.0, 1.0, 0.0],
        [1.0, 1.0, 1.0],
    ];
    for (let i = 1; i <= dots; i++) {
        const phi = Math.acos(-1 + (2 * i) / (dots + 1));
        const theta = Math.sqrt(dots * Math.PI) * phi;
        vector.setFromSphericalCoords(radius, phi, theta);
        dotGeo.copy(geometry);
        dotGeo.lookAt(vector);
        dotGeo.translate(vector.x, vector.y, vector.z);
        const rndClr = clrs[Math.floor(Math.random() * clrs.length)];
        for (let j = 0; j <= 3; j += 3) {
            for (let k = 0; k <= 6; k += 3) {
                colors.push(...rndClr);
                for (let l = 0; l < 3; l++) {
                    positions.push(dotGeo.attributes.position.array[j + k + l]);
                    tilesIds.push(i);
                }
            }
        }
    }
    return [{ positions, tilesIds, colors }];
};
const pointData = data();
const Tiles = () => {
    const globeEl = React.useRef();
    const [hoverD, setHoverD] = React.useState();
    return (
    // @ts-ignore
    React.createElement(Globe, { ref: globeEl, customLayerData: pointData, customThreeObject: ({ positions, tilesIds, colors }) => {
            const group = new THREE.Group();
            const points = new THREE.BufferGeometry();
            points.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            points.setAttribute("tileId", new THREE.Float32BufferAttribute(tilesIds, 3));
            points.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
            const material = new THREE.ShaderMaterial({
                transparent: true,
                side: THREE.DoubleSide,
                uniforms: {
                    u_hover: { value: 0 },
                    u_clicked: { value: 0 },
                },
                vertexShader: `
            uniform float u_hover;
            uniform float u_clicked;
            attribute vec3 color;
            attribute float tileId;
            varying vec3 vRndId;
            void main() {
              vRndId = color;

              if(u_hover == tileId) {
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
              gl_FragColor = vec4(vRndId, 0.1);
            }`,
            });
            const mesh = new THREE.Mesh(points, material);
            return group.add(mesh);
        }, animateIn: false }));
};
ReactDOM.render(React.createElement(Tiles, null), document.getElementById("globeViz"));
