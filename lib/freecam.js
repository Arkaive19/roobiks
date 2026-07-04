import visualizer3d from "./classes/visualizer.js";
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
    renderer.drawMesh({
      vertices: V,
      edges: E,
      faces: F,
    });
  }

  requestAnimationFrame(frame);
}

frame();
