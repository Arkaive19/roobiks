import visualizer3d from "./classes/visualizer.js";
import { cubelets, roobiks } from "./cube-data.js";

const renderer = new visualizer3d("canvas");
let _ROTATION_TYPE = "";
document.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  console.log(key);
  const moves = {
    1: "R",
    2: "L",
    3: "U",
    4: "D",
    5: "F",
    6: "B",
    "!": "R'",
    "@": "L'",
    "#": "U'",
    $: "D'",
    "%": "F'",
    "^": "B'",
    "'": "`",
  };
  if (key in moves) {
    roobiks.rotate(moves[key]);
    if (
      key == "!" ||
      key == "@" ||
      key == "#" ||
      key == "$" ||
      key == "%" ||
      key == "^" ||
      key == "'"
    ) {
      _ROTATION_TYPE = "'";
    }
  }
});

function frame() {
  roobiks.incrementLayer(_ROTATION_TYPE);
  renderer.updateCamera();
  renderer.clear();

  renderer.startFrame();

  for (const cubie of cubelets) {
    const transform = roobiks.getCubieTransform(cubie);

    renderer.drawMesh({
      vertices: cubie.getVertices(),
      edges: cubie.getEdges(),
      faces: cubie.getFaces(),

      rotation: transform.rotation,
      pivot: transform.pivot,
    });
  }

  renderer.endFrame();
  requestAnimationFrame(frame);
}

frame();
