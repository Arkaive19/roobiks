import visualizer3d from "./classes/visualizer.js";
import { V, E, F } from "./cube-data.js";

const renderer = new visualizer3d("canvas");

function frame() {
  renderer.clear();
  renderer.updateCamera();

  // Store projected vertices
  const projected = [];

  // Transform and project vertices
  for (const vertex of V) {
    let p = renderer.cameraTransform(vertex);

    if (p.z <= 0.01) {
      projected.push(null);
      continue;
    }

    p = renderer.project(p);
    p = renderer.cartesianGrapher(p);

    projected.push(p);
    renderer.point(p);
  }

  // Draw edges
  for (const [a, b] of E) {
    if (!projected[a] || !projected[b]) continue;

    renderer.line(projected[a], projected[b]);
  }

  // Draw faces
  for (const face of F) {
    const pts = face.map((i) => projected[i]);

    if (pts.some((p) => p === null)) continue;

    renderer.face(pts[0], pts[1], pts[2], pts[3]);
  }

  requestAnimationFrame(frame);
}

frame();
