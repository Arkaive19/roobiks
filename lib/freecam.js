import visualizer3d from "./visualizer.js";
import { V, E, F } from "./cube-data.js";
const renderer = new visualizer3d("canvas");

const SIZE = 0.25;
const GAP = SIZE * 2;
const OFFSETS = [-1, 0, 1];

const cubelets = [];

for (const x of OFFSETS)
  for (const y of OFFSETS) for (const z of OFFSETS) cubelets.push({ x, y, z });

function translate(v, c) {
  return {
    x: v.x + c.x * GAP,
    y: v.y + c.y * GAP,
    z: v.z + c.z * GAP,
  };
}

function frame() {
  renderer.updateCamera();

  renderer.clear();

  for (const cube of cubelets) {
    const transformed = V.map((v) => {
      let p = translate(v, cube);

      p = renderer.cameraTransform(p);

      if (p.z <= 0.01) return null;

      p = renderer.project(p);
      p = renderer.cartesianGrapher(p);

      return p;
    });

    for (const [a, b] of E) {
      if (!transformed[a] || !transformed[b]) continue;

      renderer.line(transformed[a], transformed[b]);
    }

    for (const face of F) {
      const pts = face.map((i) => transformed[i]);

      if (pts.some((p) => !p)) continue;

      renderer.face(pts[0], pts[1], pts[2], pts[3]);
    }
  }

  requestAnimationFrame(frame);
}

frame();
