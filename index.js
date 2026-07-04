import visualizer3d from "./lib/visualizer.js";

const renderer = new visualizer3d("canvas");

// cube size
const SIZE = 0.25;
const GAP = 2 * SIZE;

// Rubik grid positions
const OFFSETS = [-1, 0, 1];

// cube vertices (unit cube centered at origin)
const V = [
  { x: -SIZE, y: -SIZE, z: -SIZE },
  { x: SIZE, y: -SIZE, z: -SIZE },
  { x: SIZE, y: SIZE, z: -SIZE },
  { x: -SIZE, y: SIZE, z: -SIZE },
  { x: -SIZE, y: -SIZE, z: SIZE },
  { x: SIZE, y: -SIZE, z: SIZE },
  { x: SIZE, y: SIZE, z: SIZE },
  { x: -SIZE, y: SIZE, z: SIZE },
];

// wireframe edges
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

// rotation (XZ plane)
function rotate_xz({ x, y, z }, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: x * c - z * s,
    y,
    z: x * s + z * c,
  };
}

// translate cubelet in 3D grid
function translate(v, p) {
  return {
    x: v.x + p.x * GAP,
    y: v.y + p.y * GAP,
    z: v.z + p.z * GAP,
  };
}

// build 27 cubelets
const cubelets = [];

for (const x of OFFSETS) {
  for (const y of OFFSETS) {
    for (const z of OFFSETS) {
      cubelets.push({ x, y, z });
    }
  }
}

let angle = 0;

function frame() {
  angle = (angle + 0.02) % (Math.PI * 2);

  renderer.clear();

  for (const c of cubelets) {
    // transform all vertices once per cubelet
    const transformed = V.map((v) => {
      let p = translate(v, c);
      //   p = rotate_xz(p, angle);
      p = renderer.fixPerspective(p, 5);
      return renderer.cartesianGrapher(renderer.project(p));
    });

    for (const [a, b] of EDGES) {
      renderer.line(transformed[a], transformed[b]);
    }
  }

  requestAnimationFrame(frame);
}

frame();
