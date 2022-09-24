import {
  aC as CircleGeometry,
  c as Mesh,
  G as Group,
  h as BufferGeometry,
  i as Uint32BufferAttribute,
  k as Vector3,
  m as DoubleSide,
  q as MeshBasicMaterial,
} from "./three.module.js"

// extend threesjs
export default class Points extends Group {
  callback: () => void
  isStatic: boolean
  radius: number
  isDotsOnly: boolean
  material: MeshBasicMaterial
  constructor(
    radius: number,
    callback: { (): void; (): void },
    isStatic: boolean,
    isDotsOnly: boolean
  ) {
    super()
    this.callback = callback
    this.isStatic = isStatic
    this.radius = radius
    this.isDotsOnly = isDotsOnly

    this.mapLoaded()
  }
  mapLoaded() {
    const ratio = this.radius / 450,
      dots = 10000,
      radius = this.radius,
      geometry = new CircleGeometry(1.8 * ratio, 5),
      dotMaterial = new CircleGeometry(),
      rndId: number[] = [],
      vector = new Vector3()
    for (let i = dots; i >= 0; i -= 1) {
      const phi = Math.acos((2 * i) / dots - 1)
      const theta = Math.sqrt(dots * Math.PI) * phi

      vector.setFromSphericalCoords(radius, phi, theta)
      dotMaterial.copy(geometry)
      dotMaterial.lookAt(vector)
      dotMaterial.translate(vector.x, vector.y, vector.z)
      dotMaterial.computeBoundingSphere()

      for (let i = 0; i < 5; i += 1) {
        rndId.push(
          dotMaterial.attributes.position.array[0],
          dotMaterial.attributes.position.array[1],
          dotMaterial.attributes.position.array[2],
          dotMaterial.attributes.position.array[3 + 3 * i],
          dotMaterial.attributes.position.array[4 + 3 * i],
          dotMaterial.attributes.position.array[5 + 3 * i],
          dotMaterial.attributes.position.array[6 + 3 * i],
          dotMaterial.attributes.position.array[7 + 3 * i],
          dotMaterial.attributes.position.array[8 + 3 * i]
        )
      }
    }

    const points = new BufferGeometry()
    points.setAttribute("position", new Uint32BufferAttribute(rndId, 3))

    this.material = new MeshBasicMaterial({
      transparent: !0,
      side: DoubleSide,
    })

    const w = new Mesh(points, this.material)
    this.add(w)

    this.callback()
  }
}
