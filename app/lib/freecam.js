/*If youre reading this file dont lok at most of this stuff, its js standard stuff what i do want you to look at is the frame() function */

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
// --- FPS meter ---
const _fpsEl = document.createElement("div");
_fpsEl.style.position = "fixed";
_fpsEl.style.right = "8px";
_fpsEl.style.top = "8px";
_fpsEl.style.padding = "6px 8px";
_fpsEl.style.color = "#0f0";
_fpsEl.style.fontFamily = "monospace";
_fpsEl.style.fontSize = "12px";
_fpsEl.style.zIndex = 9999;
_fpsEl.style.borderRadius = "6px";
document.body.appendChild(_fpsEl);
let _fpsLast = performance.now();
let _fpsFrames = 0;
let _fpsLastDisplay = performance.now();

/*Ive explained why getCubie transformed and incrementLayer are here check out cubies.js */
/*requestNextAnimationFrame(frame) is what runs this animation at your refresh rate
were generating based on cubies here so each cubie can be drawn
also, theres a if statement to draw either the cube or the penguin mesh, but more importantly
 */
function frame() {
  renderer.updateCamera(); //updates camera
  renderer.startFrame(); //check visualizer.js for more info **basically just clears the canvas
  // const t0 = performance.now();
  if (modalCubie == "cube") {
    roobiks.incrementLayer(); //increments layers if a rotation is done
    for (const cubie of cubelets) {
      //run for all cublets
      const transform = roobiks.getCubieTransform(cubie);

      if (!renderer.wireframe) {
        // console.log(transform.pivot);
        //draws faces
        renderer.drawMesh({
          vertices: cubie.getVertices(),
          edges: cubie.getEdges(),
          faces: cubie.getFaces(),
          rotation: transform.rotation,
          pivot: transform.pivot,
        }); //flagship method 💔💔💔💔
      } else {
        //draws wireframe
        renderer.drawWireframe({
          vertices: cubie.getVertices(),
          edges: cubie.getEdges(),
          rotation: transform.rotation,
          pivot: transform.pivot,
        });
      }
    }
  }
  //penguin mesh
  else {
    if (!renderer.wireframe) {
      // console.log(transform.pivot);
      renderer.drawMesh({
        vertices: vs,
        edges: edges,
        faces: faces,
      }); //flagship method 💔💔💔💔
    } else {
      renderer.drawWireframe({
        vertices: vs,
        edges: edges,
      });
    }
  }
  // console.log(performance.now() - t0);
  renderer.endFrame(); //draws the mesh based on frame Buffer and z indexing buahahahahah
  // FPS measurement and display (update display every 250ms)
  _fpsFrames++;
  const now = performance.now();
  const elapsed = now - _fpsLastDisplay;
  if (elapsed >= 250) {
    const fps = Math.round((_fpsFrames * 1000) / (now - _fpsLast));
    _fpsEl.textContent = fps + " FPS";
    _fpsEl.style.color = fps < 30 ? "#f66" : fps < 55 ? "#ffb86b" : "#7cff7c";
    _fpsLast = now;
    _fpsFrames = 0;
    _fpsLastDisplay = now;
  }

  //fps thing i didnt know how to do shit with requestAnimationFrame() so this is heavily ai genned, js translated into my language

  requestAnimationFrame(frame); //renderer makes the animation run at local display refresh rate!!!
}

frame(); //start drawing twinium!
