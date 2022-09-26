// @ts-nocheck
class Points extends THREE.Group {
  constructor(radius, callback, isStatic, isDotsOnly) {
    super()
    this.callback = callback
    this.isStatic = isStatic
    this.radius = radius
    this.isDotsOnly = isDotsOnly
    this.loadPoints()
  }
  loadPoints() {
    const ratio = this.radius / 450,
      dots = 10000,
      radius = this.radius,
      geometry = new THREE.PlaneGeometry(10 * ratio, 10 * ratio),
      dotGeo = new THREE.BufferGeometry(),
      positions = [],
      rndIds = [],
      tilesIds = [],
      vector = new THREE.Vector3()
    for (let i = 1; i < dots; i++) {
      const phi = Math.acos(-1 + (2 * i) / dots)
      const theta = Math.sqrt(dots * Math.PI) * phi
      vector.setFromSphericalCoords(radius, phi, theta)
      dotGeo.copy(geometry)
      dotGeo.lookAt(vector)
      dotGeo.translate(vector.x, vector.y, vector.z)
      const t = Math.random()
      for (let j = 0; j < 6; j += 3) {
        for (let k = 0; k < 9; k++) {
          positions.push(dotGeo.attributes.position.array[j + k])
          rndIds.push(t)
        }
        tilesIds.push(i)
      }
    }
    const points = new THREE.BufferGeometry()
    points.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    )
    points.setAttribute("tileId", new THREE.Float32BufferAttribute(tilesIds, 1))
    points.setAttribute("rndId", new THREE.Float32BufferAttribute(rndIds, 1))

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHover: { value: 0 },
        uHoverD: { value: 0 },
      },
      vertexShader: `
            uniform float uTime;
            uniform float uHover;
            uniform float uHoverD;
            attribute float rndId;
            varying float vRndId;
            varying float vHover;
            varying float vHoverD;
            void main() {
                vRndId = rndId;
                vHover = uHover;
                vHoverD = uHoverD;
                vec3 pos = position;
                pos.z += sin(uTime + rndId * 100.) * 0.1;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,

      fragmentShader: `
            uniform float uTime;
            uniform float uHover;
            uniform float uHoverD;
            varying float vRndId;
            varying float vHover;
            varying float vHoverD;
            void main() {
                float hover = smoothstep(0.0, 0.1, vHoverD);
                float hover2 = smoothstep(0.0, 0.1, vHoverD);
                float rnd = smoothstep(0.0, 0.1, vRndId - vHover);
                float rnd2 = smoothstep(0.0, 0.1, vRndId - vHover);
                gl_FragColor = vec4(vec3(hover * rnd), 1.0);
            }
        `,
    })

    this.points = new THREE.Points(points, this.material)
    this.add(this.points)

    this.material.uniforms.u_resolution.value.x = window.innerWidth
    this.material.uniforms.u_resolution.value.y = window.innerHeight
    this.startTime = performance.now()
    this.dragStartTime = 0
    this.callback()
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
