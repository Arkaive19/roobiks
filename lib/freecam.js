import visualizer3d from "./classes/visualizer.js";
import { cubelets } from "./cube-data.js";

const renderer = new visualizer3d("canvas");

function frame() {
  renderer.updateCamera();
  renderer.clear();

  const vertices = [];
  const faces = [];
  const edges = [];

  for (const cubelet of cubelets) {
    const base = vertices.length;

    vertices.push(...cubelet.getVertices());

    edges.push(...cubelet.getEdges().map(([a, b]) => [a + base, b + base]));

    faces.push(
      ...cubelet.getFaces().map((f) => ({
        ...f,
        indices: f.indices.map((i) => i + base),
      })),
    );
  }

  renderer.drawMesh({
    vertices,
    edges,
    faces,
  });

  requestAnimationFrame(frame);
}

frame();
