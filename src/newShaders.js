// make a vertexShader that accept a texture
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

// make a fragmentShader that accept a texture
const fragmentShader = `
  uniform float u_time;
  uniform sampler2D texture;
  varying vec2 vUv;
  void main() {
    vec4 col = texture2D(texture, vUv);
    gl_FragColor = vec4(col.r, col.g, col.b, 1.0);
  }
`

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load("./texture.jpg")

const geometry = new THREE.PlaneGeometry(1, 1, 1)
const material = new THREE.ShaderMaterial({
  uniforms: {
    u_time: {
      type: "f",
      value: 0,
    },
    texture: {
      type: "sampler2D",
      value: texture,
    },
  },
  vertexShader,
  fragmentShader,
})
const mesh = new THREE.Mesh(geometry, material)
mesh.position.z = 0

const scene = new THREE.Scene()
scene.add(mesh)

const camera = new THREE.PerspectiveCamera()
camera.position.z = 1

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const clock = new THREE.Clock()

const render = () => {
  const time = clock.getElapsedTime()
  material.uniforms.u_time.value = time
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

render()

const onResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

window.addEventListener("resize", onResize)

const onDrag = () => {
  const initialTime = clock.getElapsedTime()
  const onMove = () => {
    const currentTime = clock.getElapsedTime()
    const dragTime = currentTime - initialTime
    material.uniforms.u_time.value = dragTime
  }
  const onUp = () => {
    window.removeEventListener("mousemove", onMove)
    window.removeEventListener("mouseup", onUp)
  }
  window.addEventListener("mousemove", onMove)
  window.addEventListener("mouseup", onUp)
}

window.addEventListener("mousedown", onDrag)

// I'm trying to make a web
