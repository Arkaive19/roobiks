import visualizer3d from "./classes/visualizer.js";
import { cubelets } from "./cube-data.js";

const renderer = new visualizer3d("canvas");

function frame() {
  renderer.updateCamera();
  renderer.clear();

  renderer.startFrame();

  for (const cublet of cubelets) {
    renderer.drawMesh({
      vertices: cublet.getVertices(),
      edges: cublet.getEdges(),
      faces: cublet.getFaces(),
    });
  }

  renderer.endFrame();
  requestAnimationFrame(frame);
}

frame();
