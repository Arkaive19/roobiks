import visualizer3d from "./classes/visualizer.js";
import { cubelets, roobiks, vs, fs } from "./cube-data.js";

const renderer = new visualizer3d("canvas"); //new instance of my flagship A 3D RENDERER!
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
document.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  // console.log(key);
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
  // for (const cubie of cubelets) {
  //   //run for all cublets
  //   const transform = roobiks.getCubieTransform(cubie);
  //   renderer.drawMesh({
  //     vertices: cubie.getVertices(),
  //     edges: cubie.getEdges(),
  //     faces: cubie.getFaces(),
  //     rotation: transform.rotation,
  //     pivot: transform.pivot,
  //   }); //flagship method 💔💔💔💔
  // }

  renderer.drawWireframe({
    vertices: vs,
    edges: edges,
    //translation: { x: 0, y: 0, z: 5 },
  });
  renderer.endFrame();
  requestAnimationFrame(frame); //renderer makes the animation run at local display refresh rate!!!
}

frame(); //start drawing twinium!
