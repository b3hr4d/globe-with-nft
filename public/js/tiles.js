const data = () => {
    const radius = 1000;
    const ratio = radius / 450, dots = 10000, geometry = new THREE.PlaneGeometry(10 * ratio, 10 * ratio), dotGeo = new THREE.BufferGeometry(), positions = [], rndIds = [], tilesIds = [], vector = new THREE.Vector3();
    for (let i = 1; i < dots; i++) {
        const phi = Math.acos(-1 + (2 * i) / dots);
        const theta = Math.sqrt(dots * Math.PI) * phi;
        vector.setFromSphericalCoords(radius, phi, theta);
        dotGeo.copy(geometry);
        dotGeo.lookAt(vector);
        dotGeo.translate(vector.x, vector.y, vector.z);
        const t = Math.random();
        for (let j = 0; j < 6; j += 3) {
            for (let k = 0; k < 9; k++) {
                positions.push(dotGeo.attributes.position.array[j + k]);
                rndIds.push(t);
            }
            tilesIds.push(i);
        }
    }
    return [{ positions, rndIds }];
};
const pointData = data();
const Tiles = () => {
    const [hoverD, setHoverD] = React.useState();
    return (
    // @ts-ignore
    React.createElement(Globe, { customLayerData: pointData, customLayerLabel: "Tiles", customThreeObject: (layers) => {
            const { positions, rndIds } = layers;
            console.log(positions, rndIds);
            const points = new THREE.BufferGeometry();
            points.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            points.setAttribute("rndId", new THREE.Float32BufferAttribute(rndIds, 1));
            // const material = new THREE.ShaderMaterial({
            //   uniforms: {
            //     uTime: { value: 0 },
            //     uHover: { value: 0 },
            //     uHoverD: { value: 0 },
            //   },
            //   vertexShader: `
            //     uniform float uTime;
            //     uniform float uHover;
            //     uniform float uHoverD;
            //     attribute float rndId;
            //     varying float vRndId;
            //     varying float vHover;
            //     varying float vHoverD;
            //     void main() {
            //       vRndId = rndId;
            //       vHover = uHover;
            //       vHoverD = uHoverD;
            //       vec3 pos = position;
            //       pos.z += sin(uTime + rndId * 100.) * 0.1;
            //       gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            //     }
            //   `,
            //   fragmentShader: `
            //     uniform float uTime;
            //     uniform float uHover;
            //     uniform float uHoverD;
            //     varying float vRndId;
            //     varying float vHover;
            //     varying float vHoverD;
            //     void main() {
            //       float hover = smoothstep(0.0, 0.1, vHoverD);
            //       float hover2 = smoothstep(0.0, 0.1, vHoverD);
            //       float rnd = smoothstep(0.0, 0.1, vRndId - vHover);
            //       float rnd2 = smoothstep(0.0, 0.1, vRndId - vHover);
            //       gl_FragColor = vec4(vec3(hover * rnd), 1.0);
            //     }
            //   `,
            // })
            const material = new THREE.ShaderMaterial({
                transparent: true,
                side: THREE.DoubleSide,
                uniforms: {
                    u_time: { value: 0 },
                    u_drag_time: { value: 0 },
                    u_resolution: { value: new THREE.Vector2() },
                },
                vertexShader: `
        uniform float u_time;
        uniform float u_drag_time;
        uniform vec2 u_resolution;
        attribute float rndId;
        attribute float tileId;
        varying float vRndId;
        varying float pct;
        void main() {
          vRndId = rndId;
          vec2 st = position.xy/u_resolution;
          pct = min(1.0, u_time / (1000. / max(0.2, 0.2 * sin(fract(rndId)))));
          float vNormal = rndId + ((1.0 - rndId) * pct);
          vNormal = rndId + ((1.0 - rndId));
          vNormal = smoothstep(0., 1.0, vNormal);
          if (u_drag_time > 0.) {
            vNormal -= ((sin(u_time / 400.0 * vRndId) + 1.0) * 0.04) * min(1., u_drag_time / 1200.0);
          }
          vec4 modelViewPosition = modelViewMatrix * vec4(position, vNormal);
          gl_Position = projectionMatrix * modelViewPosition;
        }`,
                fragmentShader: `
        uniform bool u_dragging;
        uniform float u_time;
        uniform float u_drag_time;
        varying float vRndId;
        varying float pct;
        void main() {
          float v = sin(u_time / 200.0 * vRndId);
          float alpha = pct * 0.7 + v * 0.2;
          float r = 0.19;
          float g = 0.42;
          float b = 0.65;
          float dragDur = 1200.0;
          vec3 color = vec3(r, g, b);
          float rInc = min(1.0, u_drag_time / dragDur) * (sin(u_drag_time / (dragDur * 0.5) + 1.0) * 0.1);
          float gInc = min(1.0, u_drag_time / dragDur) * (sin(u_drag_time / (dragDur * 0.75) - 1.0) * 0.1);
          float bInc = min(1.0, u_drag_time / dragDur) * (sin(u_drag_time / dragDur) * 0.1);
          if (u_dragging) {
            color.r = r + rInc;
            color.g = g + gInc;
            color.b = b + bInc;
          }
          gl_FragColor = vec4(color, alpha);
        }`,
            });
            material.uniforms.u_resolution.value.x = window.innerWidth;
            material.uniforms.u_resolution.value.y = window.innerHeight;
            return new THREE.Mesh(points, material);
        }, animateIn: false }));
};
ReactDOM.render(React.createElement(Tiles, null), document.getElementById("globeViz"));
