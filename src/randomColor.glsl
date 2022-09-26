uniform float u_time;
uniform float u_drag_time;
uniform vec2 u_resolution;
attribute float rndId;
attribute float tileId;
varying float vRndId;
varying float vTileId;
varying float pct;
void main() {
    vTileId = tileId;
    vRndId = rndId;
    // write id inside the tile
    vec2 pos = vec2(mod(rndId, 16.0), floor(rndId / 16.0));
    pos = pos / 16.0;
    pos = pos + vec2(0.5 / 16.0);
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
}




