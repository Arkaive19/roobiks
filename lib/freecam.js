import visualizer3d from "./classes/visualizer.js";
import {
  renderer,
  cubelets,
  roobiks,
  vs,
  fs,
  keybinds,
  modalCubie,
  cubieKeybinds,
} from "./cube-data.js"; //new instance of my flagship A 3D RENDERER!
// import { vs, edges } from "./data.js";

//just inverting the cubie u heard?
const keyToMove = () =>
  Object.fromEntries(
    Object.entries(cubieKeybinds).map(([move, key]) => [
      key.toUpperCase(),
      move,
    ]),
  );

/*renderer part is just to move the cube */
const edges = [
  ...new Set(
    fs.flatMap(([a, b, c]) =>
      [
        [a, b],
        [b, c],
        [c, a],
      ].map(([x, y]) => (x < y ? `${x},${y}` : `${y},${x}`)),
    ),
  ),
].map((e) => e.split(",").map(Number));
const faces = fs.map((indices) => ({
  indices,
  color: [213, 131, 155],
}));

renderer.keybinds = keybinds;
document.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  const moves = keyToMove();
  if (key in moves) {
    roobiks.rotate(moves[key]);
  }
  if (key == "`") roobiks.solve();
  if (key == "R") roobiks.reset();
  if (key === "V") renderer.wireframe = !renderer.wireframe;
});
/*Ive explained why getCubie transformed and incrementLayer are here check out cubies.js */
function frame() {
  roobiks.incrementLayer(); //increments layer
  renderer.updateCamera(); //updates camera
  renderer.startFrame(); //check visualizer.js for more info
  for (const cubie of cubelets) {
    //run for all cublets
    const transform = roobiks.getCubieTransform(cubie);
    if (modalCubie == "cube") {
      if (!renderer.wireframe) {
        // console.log(transform.pivot);
        renderer.drawMesh({
          vertices: cubie.getVertices(),
          edges: cubie.getEdges(),
          faces: cubie.getFaces(),
          rotation: transform.rotation,
          pivot: transform.pivot,
        }); //flagship method 💔💔💔💔
      } else {
        renderer.drawWireframe({
          vertices: cubie.getVertices(),
          edges: cubie.getEdges(),
          rotation: transform.rotation,
          pivot: transform.pivot,
        });
      }
    } else {
      if (!renderer.wireframe) {
        // console.log(transform.pivot);
        renderer.drawMesh({
          vertices: vs,
          edges: edges,
          faces: faces,
          rotation: transform.rotation,
          pivot: transform.pivot,
        }); //flagship method 💔💔💔💔
      } else {
        renderer.drawWireframe({
          vertices: vs,
          edges: edges,
          rotation: transform.rotation,
          pivot: transform.pivot,
        });
      }
    }
  }

  renderer.endFrame();
  requestAnimationFrame(frame); //renderer makes the animation run at local display refresh rate!!!
}

frame(); //start drawing twinium!
