import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  PlaneGeometry,
  Raycaster,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
} from "../public/packages/three.module.js"

export default class Points extends Group {
  constructor(radius, callback, isStatic, isDotsOnly) {
    super()
    this.callback = callback
    this.isStatic = isStatic
    this.radius = radius
    this.isDotsOnly = isDotsOnly
    this.positions = []
    this.raycaster = new Raycaster()

    this.loadPoints()
  }

  loadPoints() {
    const ratio = this.radius / 450,
      dots = 10000,
      radius = this.radius,
      geometry = new PlaneGeometry(12 * ratio, 12 * ratio),
      dotGeo = new BufferGeometry(),
      positions = [],
      colors = [],
      tilesIds = [],
      vector = new Vector3(),
      clrs = [
        [0.0, 1.0, 0.0],
        [1.0, 1.0, 1.0],
      ]

    // make sphere inside all points to prevent clicking through
    const sphereMesh = new Mesh(new SphereGeometry(radius - 10))

    this.add(sphereMesh)

    for (let i = 1; i <= dots; i++) {
      const phi = Math.acos(-1 + (2 * i) / (dots + 1))
      const theta = Math.sqrt(dots * Math.PI) * phi

      vector.setFromSphericalCoords(radius, phi, theta)
      dotGeo.copy(geometry)
      dotGeo.lookAt(vector)
      dotGeo.translate(vector.x, vector.y, vector.z)

      const rndClr = clrs[Math.floor(Math.random() * clrs.length)]

      for (let j = 0; j <= 3; j += 3) {
        for (let k = 0; k <= 6; k += 3) {
          colors.push(...rndClr)
          for (let l = 0; l < 3; l++) {
            positions.push(dotGeo.attributes.position.array[j + k + l])
            tilesIds.push(i)
          }
        }
      }
    }

    const points = new BufferGeometry()
    points.setAttribute("position", new Float32BufferAttribute(positions, 3))
    points.setAttribute("tileId", new Float32BufferAttribute(tilesIds, 3))
    points.setAttribute("color", new Float32BufferAttribute(colors, 3))

    this.tilesIds = tilesIds.filter((_, i) => i % 3 === 0)

    this.material = new ShaderMaterial({
      transparent: true,
      side: DoubleSide,
      uniforms: {
        u_time: { value: 0 },
        u_hover: { value: 0 },
        u_clicked: { value: 0 },
        u_drag_time: { value: 0 },
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_drag_time;
        uniform float u_hover;
        uniform float u_clicked;
        attribute vec3 color;
        attribute float tileId;

        varying vec3 vRndId;
        varying float pct;
        void main() {
          float rnd = 0.1;
          vRndId = color;

          pct = min(1.0, u_time / (1000. / max(0.2, 0.2 * sin(fract(rnd)))));
          float vNormal = rnd + ((1.0 - rnd) * pct);
          vNormal = rnd + ((1.0 - rnd));
          vNormal = smoothstep(0., 1.0, vNormal);
          if (u_drag_time > 0.) {
            vNormal -= ((sin(u_time / 400.0 * rnd) + 1.0) * 0.04) * min(1., u_drag_time / 1200.0);
          }

          if(u_hover == tileId) {
            vRndId = vec3(1.0, 0.0, 0.0);
          }

          if(u_clicked == tileId) {
            vRndId = vec3(0.0, 0.0, 0.0);
          }

          vec4 modelViewPosition = modelViewMatrix * vec4(position, vNormal);
          gl_Position = projectionMatrix * modelViewPosition;
        }`,
      fragmentShader: `
        uniform float u_time;
        varying vec3 vRndId;
        varying float pct;
        void main() {
          float rnd = 0.1;
          float v = sin(u_time / 200.0 * rnd);
          float alpha = pct * 0.7 + v * 0.2;
          
          gl_FragColor = vec4(vRndId, alpha);
        }`,
    })

    const mesh = new Mesh(points, this.material)
    this.add(mesh)

    this.startTime = performance.now()
    this.dragStartTime = 0
    this.callback()
  }
  handleMouseMove = (e, camera) => {
    const mouse = new Vector2()
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(mouse, camera)

    const intersects = this.raycaster.intersectObjects(this.children)

    if (intersects.length > 0 && intersects[0].object !== this.children[0]) {
      const tileId = this.tilesIds[intersects[0].face.a]
      // console.log(tileId, intersects[0].point)
      this.material.uniforms.u_hover.value = tileId
      if (e.type === "click") {
        this.material.uniforms.u_clicked.value = tileId
      }
    } else {
      this.material.uniforms.u_hover.value = 0
    }
  }

  startDragging() {
    if (this.material && !this.isStatic) {
      this.isDragging = !0
      this.dragStartTime = performance.now()
      this.material.uniforms.u_time.value =
        performance.now() - this.dragStartTime
    }
  }
  stopDragging() {
    this.isDragging = !1
  }
  updateDragTimer() {
    if (this.isDragging) this.dragTime = performance.now() - this.dragStartTime
    else if (this.dragTime > 0.1)
      this.dragTime = Math.max(0, 0.9 * this.dragTime)
  }
  animate() {
    this.updateDragTimer()
    if (!this.material) return
    this.material.uniforms.u_drag_time.value = this.dragTime
    const t = this.isStatic ? 3e3 : performance.now() - this.startTime
    this.material.uniforms.u_time.value = t
  }
}
