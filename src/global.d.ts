import Tween from "@tweenjs/tween.js"
import React from "react"
import { GlobeMethods as GlobeMethod, GlobeProps } from "react-globe.gl-fork"
import ThreeRenderObject, {
  ThreeRenderObjectsInstance as ThreeRenderObjectType,
} from "three-render-objects-fork"
import { OrbitControls as OrbitControl } from "three/examples/jsm/controls/OrbitControls"
import { TrackballControls as TrackballControl } from "three/examples/jsm/controls/TrackballControls"

type FCwithRef<P = {}, R = {}> = React.FunctionComponent<
  P & { ref?: React.MutableRefObject<R | undefined> }
>

declare global {
  const Globe: FCwithRef<GlobeProps, GlobeMethod>
  const OrbitControls: typeof OrbitControl
  const TrackballControls: typeof TrackballControl
  const TWEEN: typeof Tween
  const GlobeMethods: GlobeMethod
  const MouseEventHandler: React.MouseEventHandler
  const ThreeRenderObjects: typeof ThreeRenderObject
  const ThreeRenderObjectsInstance: ThreeRenderObjectType
}

declare module "*"

export type { Globe }
export type { TWEEN }
export type { OrbitControls }
export type { GlobeMethods }
export type { TrackballControls }
export type { MouseEventHandler }
