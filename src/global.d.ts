import Tween from "@tweenjs/tween.js"
import React from "react"
import { GlobeMethods, GlobeProps } from "react-globe.gl"
import { OrbitControls as OrbitControl } from "three/examples/jsm/controls/OrbitControls"
import { TrackballControls as TrackballControl } from "three/examples/jsm/controls/TrackballControls"

type FCwithRef<P = {}, R = {}> = React.FunctionComponent<
  P & { ref?: React.MutableRefObject<R | undefined> }
>

declare global {
  const Globe: FCwithRef<GlobeProps, GlobeMethods>
  const OrbitControls: typeof OrbitControl
  const TrackballControls: typeof TrackballControl
  const TWEEN: typeof Tween
}

declare module "*"

export { Globe }
export { TWEEN }
export { OrbitControls }
export { TrackballControls }
