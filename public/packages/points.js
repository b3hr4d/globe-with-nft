import {
  BufferGeometry,
  CircleGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  PointsMaterial,
  Vector2,
  Vector3,
} from "./three.module.js"

export default class Point0 extends Group {
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
      geometry = new CircleGeometry(1.8 * ratio, 5),
      dotMat = new BufferGeometry(),
      rndId = [],
      vector = new Vector3()
    for (let i = dots; i >= 0; i -= 1) {
      const phi = Math.acos((2 * i) / dots - 1)
      const theta = Math.sqrt(dots * Math.PI) * phi

      vector.setFromSphericalCoords(radius, phi, theta)
      dotMat.copy(geometry)
      dotMat.lookAt(vector)
      dotMat.translate(vector.x, vector.y, vector.z)
      dotMat.computeBoundingSphere()

      for (let i = 0; i < 5; i += 1) {
        rndId.push(
          dotMat.attributes.position.array[0],
          dotMat.attributes.position.array[1],
          dotMat.attributes.position.array[2],
          dotMat.attributes.position.array[3 + 3 * i],
          dotMat.attributes.position.array[4 + 3 * i],
          dotMat.attributes.position.array[5 + 3 * i],
          dotMat.attributes.position.array[6 + 3 * i],
          dotMat.attributes.position.array[7 + 3 * i],
          dotMat.attributes.position.array[8 + 3 * i]
        )
      }
    }

    const points = new BufferGeometry()
    points.setAttribute("position", new Float32BufferAttribute(rndId, 3))

    const material = new PointsMaterial({
      transparent: !0,
    })

    const mesh = new Mesh(points, material)

    this.add(mesh)

    this.callback()
  }
}

function E(t, e) {
  const s = new Vector3()
  s.subVectors(e, t).normalize()
  const a = 1 - (0.5 + Math.atan2(s.z, s.x) / (2 * Math.PI)),
    n = 0.5 + Math.asin(s.y) / Math.PI
  return new Vector2(a, n)
}
function q(t, i) {
  const e = i.width,
    s = i.height,
    a = 4 * Math.floor(t.x * e) + Math.floor(t.y * s) * (4 * e)
  return i.data.slice(a, a + 4)
}
