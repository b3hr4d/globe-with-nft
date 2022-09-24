import Points from "./points.js"
import {
  AmbientLight,
  Group,
  Mesh,
  MeshLambertMaterial,
  OrthographicCamera,
  PointLight,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "./three.module.js"

function C(t, i, e, s) {
  const a = t / s - 1
  return -e * (a * a ** 3 - 1) + i
}

function define(e, r, n) {
  return (
    r in e
      ? Object.defineProperty(e, r, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[r] = n),
    e
  )
}

const G = 2 * Math.PI,
  W = 0.5 * Math.PI,
  U = 0.1111 * Math.PI,
  V = Math.PI,
  N = 0.1 * Math.PI,
  H = -0.5 * Math.PI,
  B = 0.5 * Math.PI

class Globe {
  constructor(e) {
    define(this, "origin", new Vector3(0, 0, 0))
    define(this, "dom", {})
    define(this, "mouse", new Vector2())
    define(this, "isDragging", !1)
    define(this, "isStatic", !1)
    define(this, "isDiscTextureLoaded", !1)
    define(this, "globeOff", !1)
    define(this, "scrollTop", 0)
    define(this, "globeOpacity", 0)
    define(this, "scene", new Scene())
    define(this, "globeRadius", 350)
    define(this, "globeSegments", 30)
    define(this, "isLoaded", !1)
    define(this, "loaded", [])
    define(this, "loading", [])
    define(this, "isScrolling", !1)
    define(this, "isRevealed", !1)
    define(this, "frame", 0)
    define(this, "oldRotationY", 0)
    define(this, "oldRotationX", 0)
    define(this, "newRotationY", 0)
    define(this, "newRotationX", 0)
    define(this, "globeRotationIncrement", 0.02)
    define(this, "targetScale", 1)
    define(this, "scale", 1)
    define(this, "oldMouseX", 0)
    define(this, "oldMouseY", 0)
    define(this, "moveX", 0)
    define(this, "moveY", 0)
    define(this, "tension", 1)
    define(this, "initialized", !1)
    define(this, "el", void 0)
    define(this, "isDotsOnly", void 0)
    define(this, "isLayers", void 0)
    define(this, "touchStartX", void 0)
    define(this, "touchStartY", void 0)
    define(this, "touchDistanceX", void 0)
    define(this, "touchDistanceY", void 0)
    define(this, "aspectRatio", void 0)
    define(this, "oldInnerWidth", void 0)
    define(this, "windowW", void 0)
    define(this, "windowH", void 0)
    define(this, "renderAnimationFrame", void 0)
    define(this, "throwAnimationFrame", void 0)
    define(this, "arcTextures", void 0)
    define(this, "circleTexture", void 0)
    define(this, "globeFillMaterial", void 0)
    define(this, "globeOuterLayer", void 0)
    define(this, "globeOuterLayerMaterial", void 0)
    define(this, "camera", void 0)
    define(this, "renderer", void 0)
    define(this, "globeDots", void 0)
    define(this, "globeFill", void 0)
    define(this, "globeContainer", void 0)
    define(this, "globeMap", void 0)
    define(this, "globeOuterLayerSphere", void 0)
    define(this, "globeFillSphere", void 0)
    define(this, "handleDragStart", () => {
      if ((this.isDragging = !0)) {
        this.oldRotationX = this.globeContainer.rotation.x
        this.oldRotationY = this.globeContainer.rotation.y

        document.documentElement.classList.add("is-globe-dragging")
      }
    })
    define(this, "handleTouchStart", (t) => {
      const i = t.touches[0] || t.changedTouches[0]
      this.oldMouseX = i.pageX
      this.oldMouseY = i.pageY
      this.mouse.x = i.pageX
      this.mouse.y = i.pageY
      this.touchStartX = i.pageX
      this.touchStartY = i.pageY
      this.handleDragStart()
    })
    define(this, "handleMouseMove", (t) => {
      this.mouse.x = t.clientX
      this.mouse.y = t.clientY
      this.handleDragging()
    })
    define(this, "handleTouchMove", (t) => {
      const i = t.touches[0] || t.changedTouches[0]
      this.touchDistanceX = Math.abs(this.touchStartX - i.pageX)
      this.touchDistanceY = Math.abs(this.touchStartY - i.pageY)
      this.touchDistanceY > this.touchDistanceX ||
        ((this.mouse.x = i.pageX),
        (this.mouse.y = i.pageY),
        this.handleDragging())
    })
    define(this, "handleMouseUp", () => {
      setTimeout(() => {
        document.documentElement.classList.remove("is-globe-dragging")
      }, 20)
      this.isDragging = !1
      if (0 !== this.moveX || Math.abs(this.moveY) > 0)
        this.throwGlobe(this.moveX, this.moveY)
      this.oldMouseX = 0
      this.oldMouseY = 0
      this.moveX = 0
      this.moveY = 0
      this.targetScale = 1
    })
    define(this, "handleMouseDown", (t) => {
      document.documentElement.classList.add("is-globe-dragging")
      this.oldMouseX = t.clientX
      this.oldMouseY = t.clientY
      this.handleDragStart()
    })
    define(this, "handleDragging", () => {
      if (this.isDragging) {
        this.tension = 1 + Math.abs(this.oldRotationX)
        this.tension **= this.tension
        this.moveX = -0.003 * (this.oldMouseX - this.mouse.x)
        this.moveY = (-0.003 * (this.oldMouseY - this.mouse.y)) / this.tension
        this.newRotationY = this.resetRevolutions(
          this.oldRotationY + this.moveX
        )
        this.newRotationX = Math.max(
          H,
          Math.min(B, this.oldRotationX + this.moveY)
        )
        this.globeContainer.rotation.y = this.newRotationY
        this.globeContainer.rotation.x = this.newRotationX
        this.oldRotationY = this.newRotationY
        this.oldRotationX = this.newRotationX
        this.oldMouseX = this.mouse.x
        this.oldMouseY = this.mouse.y
      }
    })
    define(this, "setWindowSize", () => {
      ;(this.windowW = this.el.clientWidth),
        (this.windowH = this.el.clientHeight),
        (this.aspectRatio = 1),
        this.renderer.setSize(this.windowW, this.windowH),
        (this.oldInnerWidth = this.windowW)
    })
    define(this, "handleResize", () => {
      const { clientWidth: t } = document.documentElement
      ;(this.oldInnerWidth !== t || t > 512) &&
        (this.setWindowSize(), this.addCamera())
    })
    this.el = e
    this.load()
  }
  load() {
    this.loading.push("scene")
    this.dom.container = this.el
    this.isDotsOnly =
      !!this.el.dataset.globeType && "dots" === this.el.dataset.globeType
    this.isLayers =
      !!this.el.dataset.globeType && "layers" === this.el.dataset.globeType
    this.globeRadius = Math.min(this.el.clientWidth / 2 - 30, 350)
    this.addRenderer()
    this.addLighting()
    this.addGlobe()
    this.addListeners()
    this.setWindowSize()
    this.addCamera()
    this.objectLoaded("scene")
    this.play()
  }
  play() {
    ;(this.initialized && this.isStatic) || this.render(this.frame),
      (this.initialized = !0)
  }
  pause() {}
  disconnect() {
    cancelAnimationFrame(this.renderAnimationFrame)
    cancelAnimationFrame(this.throwAnimationFrame)
    window.removeEventListener("resize", this.handleResize)
    if (this.isStatic) {
      window.removeEventListener("mouseup", this.handleMouseUp)
      window.removeEventListener("mousemove", this.handleMouseMove)
      this.el.removeEventListener("touchstart", this.handleTouchStart)
      window.removeEventListener("touchmove", this.handleTouchMove)
      window.removeEventListener("touchend", this.handleMouseUp)
      this.el.removeEventListener("mousedown", this.handleMouseDown)
    }
  }
  addCamera() {
    const t = 0.5 * this.windowH,
      i = -this.aspectRatio * this.windowH * 0.5,
      e = 4 * this.globeRadius
    this.camera || (this.camera = new OrthographicCamera(0, 0, 0, 0, 0, 0)),
      (this.camera.left = i),
      (this.camera.right = -i),
      (this.camera.top = t),
      (this.camera.bottom = -t),
      (this.camera.near = -e),
      (this.camera.far = e),
      this.camera.updateProjectionMatrix()
  }
  addRenderer() {
    this.renderer = new WebGLRenderer({ antialias: !1, alpha: !0 })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(14540253, 0)
    this.renderer.sortObjects = !1
    this.dom.container.appendChild(this.renderer.domElement)
  }
  addLighting() {
    const t = new AmbientLight(10086140, 1)
    this.scene.add(t)
    const i = new PointLight(12775677, 2, 0, 2)
    i.position.set(-1e3, -1100, -3300), this.scene.add(i)
    const e = new PointLight(10593711, 0.8, 0, 20)
    e.position.set(-3e3, 3e3, 3300), this.scene.add(e)
  }
  addGlobe() {
    this.globeContainer = new Group()
    this.scene.add(this.globeContainer)
    this.addGlobeMap()
    this.addGlobeDots()
    this.addGlobeFill()
    this.globeContainer.position.z = 2 * -this.globeRadius
    this.globeContainer.rotation.x = this.isDotsOnly ? W : U
    this.globeContainer.rotation.y = this.isStatic ? N : V
  }
  addGlobeDots() {
    const radius = this.isLayers
      ? this.globeRadius - 0.25 * this.globeRadius
      : this.globeRadius
    this.loading.push("globeDots")
    this.globeDots = new Points(
      radius,
      () => {
        this.objectLoaded("globeDots")
      },
      this.isStatic,
      this.isDotsOnly
    )

    this.globeMap.add(this.globeDots)
  }
  addGlobeFill() {
    this.globeFillMaterial = new MeshLambertMaterial({
      transparent: !0,
      opacity: 1,
      color: 1056824,
    })
    const radius = this.isLayers
      ? this.globeRadius - 0.5 * this.globeRadius
      : this.globeRadius - 0.1
    this.globeFillSphere = new SphereGeometry(
      radius,
      this.globeSegments,
      this.globeSegments
    )
    this.globeFill = new Mesh(this.globeFillSphere, this.globeFillMaterial)
    this.globeMap.add(this.globeFill)
  }
  addGlobeMap() {
    this.globeMap = new Group()
    this.globeContainer.add(this.globeMap)
  }
  throwGlobe(t, i) {
    const e = 0.94 * t,
      s = 0.94 * i,
      a = this.globeContainer.rotation.y + e,
      n = Math.max(H, Math.min(B, this.globeContainer.rotation.x + s))
    this.globeContainer.rotation.y = this.resetRevolutions(a)
    this.globeContainer.rotation.x = n
    Math.abs(e) > 0.001 ||
      (Math.abs(s) > 0.001 &&
        !1 === this.isDragging &&
        (this.throwAnimationFrame = requestAnimationFrame(() => {
          this.throwGlobe(e, s)
        })))
  }

  objectLoaded(t = "x") {
    this.loaded.push(t)
    this.isLoaded = this.loaded.length === this.loading.length
  }

  resetRevolutions(t) {
    if (0 === Math.abs(t / G)) return t
    return t - Math.floor(Math.abs(t / G)) * Math.sign(t) * G
  }
  addListeners() {
    window.addEventListener("resize", this.handleResize),
      this.isStatic ||
        (window.addEventListener("mouseup", this.handleMouseUp),
        window.addEventListener("mousemove", this.handleMouseMove),
        this.el.addEventListener("touchstart", this.handleTouchStart, {
          passive: !0,
        }),
        window.addEventListener("touchmove", this.handleTouchMove),
        window.addEventListener("touchend", this.handleMouseUp),
        this.el.addEventListener("mousedown", this.handleMouseDown))
  }
  revealAnimation() {
    const t = this.isStatic ? 1 : C(this.globeOpacity, 0, 1, 1)
    ;(this.globeOpacity += 0.005),
      (this.globeFillMaterial.opacity = 0.94 * t),
      (this.globeRotationIncrement = 0.02 * (1 - t) + 0.001 * t),
      t > 0.999 && (this.isRevealed = !0)
  }
  autoRotateGlobe() {
    if (this.isDragging || this.isScrolling || this.isStatic)
      this.globeContainer.rotation.y -= this.globeRotationIncrement
  }
  render(time = 0) {
    this.frame = time
    this.autoRotateGlobe()
    Math.abs(this.scale - this.targetScale) > 0.001 &&
      ((this.scale -= 0.1 * (this.scale - this.targetScale)),
      this.globeFill.scale.set(this.scale, this.scale, this.scale)),
      !this.globeOff &&
        this.isLoaded &&
        (this.isRevealed || this.revealAnimation(),
        this.renderer.render(this.scene, this.camera)),
      (this.renderAnimationFrame = requestAnimationFrame(() => {
        this.isRevealed &&
        this.isStatic &&
        this.arcTexturesLoaded === Q.length &&
        this.isDiscTextureLoaded
          ? this.renderer.render(this.scene, this.camera)
          : this.render(time + 1)
      }))
  }
}

// draw canvas on globe
const div = document.getElementById("globe")

new Globe(div)
