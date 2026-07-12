/*This file is purely made for the rubiks cube example. Even though the name of my project is Roobiks;
Its a 3d renderer. this is a proof of concept to show it can render meshes, and perform actions */

/*Each cube of the rubix cube is gonna be a cube */
class Cubie {
  constructor(pos, faces) {
    /*Defining Position, Size, rotation and faces of each cubie */
    this.pos = pos;
    this.SIZE = 0.25;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.faces = faces;
    // Precompute static mesh (model-space) to avoid reallocating every frame
    const [i, j, k] = this.pos;
    const spacing = this.SIZE * 2.05;
    const cx = i * spacing;
    const cy = j * spacing;
    const cz = k * spacing;
    const s = this.SIZE;
    this._vertices = [
      { x: cx - s, y: cy - s, z: cz - s }, // Bottom-Back-Left
      { x: cx + s, y: cy - s, z: cz - s }, // Bottom-Back-Right
      { x: cx + s, y: cy + s, z: cz - s }, // Top-Back-Right
      { x: cx - s, y: cy + s, z: cz - s }, // Top-Back-Left
      { x: cx - s, y: cy - s, z: cz + s }, // Bottom-Front-Left
      { x: cx + s, y: cy - s, z: cz + s }, // Bottom-Front-Right
      { x: cx + s, y: cy + s, z: cz + s }, // Top-Front-Right
      { x: cx - s, y: cy + s, z: cz + s }, // Top-Front-Left
    ];
    this._edges = [
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
    // Precompute faces list for this cubie
    const facesArr = [];
    if (this.faces.back) facesArr.push({ indices: [3, 2, 1], color: this.faces.back });
    if (this.faces.front) facesArr.push({ indices: [4, 5, 6], color: this.faces.front });
    if (this.faces.bottom) facesArr.push({ indices: [0, 1, 5], color: this.faces.bottom });
    if (this.faces.top) facesArr.push({ indices: [7, 6, 2], color: this.faces.top });
    if (this.faces.left) facesArr.push({ indices: [4, 7, 3], color: this.faces.left });
    if (this.faces.right) facesArr.push({ indices: [1, 2, 6], color: this.faces.right });
    this._faces = facesArr;
  }
  /*Generates standard Vertices for a cube; but spaces them out and makes them unique
so a rubiks cube can be formed later */
  getVertices() {


    return this._vertices;
  }
  /*All cubes connect the same way. This is constant */
  getEdges() {
    return this._edges;
  }

  /*The if case stacks is because we dont wanna render more than we need. 
  -Vertice:3faces
  -Edge:2faces
  -Center:1face
   */
  getFaces() {
    return this._faces;
  }
}

/*The ACTUAL rubiks cube! */
export default class Roobiks {
  constructor() {
    /*The generate function creates the cubelets, and stores it in a global class array
    But the more interesting variable is currentMove. This is ESSENTIAL for the rotation animation */
    this.cubelets = [];
    this.retrace = [];
    this.currentMove = null;
    this.stationary = true;
    this.generate();
  }

  /* pretty much a permutation of [-1,0,1] in x,y,z 3x3x3=27 */
  generate() {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const faces = {};

          if (y === 1) faces.top = [255, 255, 0];
          if (y === -1) faces.bottom = [255, 255, 255];

          if (x === -1) faces.left = [0, 0, 255];
          if (x === 1) faces.right = [0, 255, 0];

          if (z === 1) faces.front = [255, 0, 0];
          if (z === -1) faces.back = [255, 165, 0];

          this.cubelets.push(new Cubie([x, y, z], faces));
        }
      }
    }
  }

  /*This is where we start getting into the juice; rotating the cube. How do we rotate the cube?
  Simple just transfer stickers and change the position of cublet.
  Its the same cublet but changed variables! */
  rotate(move) {
    /*The currentMove guard clause is important so that we dont get interrupted in animation */
    if (this.currentMove) return;
    /*A list of standard moves used in cubing. as u may have notices some things dont make sense
    what is dir? what is layer?
    - dir is js direction 1 is towards u, -1 is away from u
    - layer is saying which layer do i target in my axis?
       for example; R moves in x direction but the 1st layer.
       layers are defined as [-1,0,1];
       to understand this better look at the art below

       +-----+-----+-----+  the first coordinate is the x and second is z.
       |-1,-1|+0,-1|+1,-1|   for all layers, x and z are stacked like this.
       +-----+-----+-----+   y layers follow -1,0,1 down to top respectively!
       |-1,+0|+0,+0|+1,+0|
       +-----+-----+-----+
       |-1,+1|+0,+1|+1,+1|
       +-----+-----+-----+

       if this was hard to understand plz contact me id love to elaborate more!
        */
    const moves = {
      R: { axis: "x", dir: 1, layer: 1 },
      "R'": { axis: "x", dir: -1, layer: 1 },

      L: { axis: "x", dir: -1, layer: -1 },
      "L'": { axis: "x", dir: 1, layer: -1 },

      U: { axis: "y", dir: 1, layer: 1 },
      "U'": { axis: "y", dir: -1, layer: 1 },

      D: { axis: "y", dir: -1, layer: -1 },
      "D'": { axis: "y", dir: 1, layer: -1 },

      F: { axis: "z", dir: 1, layer: 1 },
      "F'": { axis: "z", dir: -1, layer: 1 },

      B: { axis: "z", dir: -1, layer: -1 },
      "B'": { axis: "z", dir: 1, layer: -1 },
    };

    const m = moves[move];
    if (!m) return;
    this.retrace.push(move);
    /*We setup the currently done move globally */
    this.currentMove = {
      axis: m.axis,
      dir: m.dir,
      layer: m.layer,
      angle: 0,

      pivot: {
        x: m.axis === "x" ? m.layer : 0,
        y: m.axis === "y" ? m.layer : 0,
        z: m.axis === "z" ? m.layer : 0,
      },
    };
  }

  /*You may have noticed, we didnt start animation from rotate.
   The reason is the way were animating our render. if we called increment
   and transformed the layers from the rotate method in this class.
   Instead we try to increment layer each frame, but check if a move is done */
  incrementLayer() {
    if (!this.currentMove) return;

    /*Increment Angle*/
    this.currentMove.angle += 0.08;
    /*Cubes move 90deg duh!*/
    if (this.currentMove.angle >= Math.PI / 2) {
      this.currentMove.angle = Math.PI / 2;
      /*If you only look at this file, youd think we dont have animations ANYWHERE
      as incrementing then finalizing seems stupid but but but but, when we draw frames were
      already putting getCubieTransform into the mesh. its optimized as if no move is done 
      it returns default values.and when this increment runs after EACH increment before loop
      returns to increment again the rotation works ONCE hence each frame the increment actually satisfies
      the rotation. at the last stage lets say;
       89.8deg->rotate to this angle->90deg we suddenly stop, now u may be thinking;
       so we dont animate it fully?
       --> YES after the 2nd last rotation we FINISH the turn by snapping position and changing stickers.
       hence its a clever illusion! */
      this.finishTurn();
      // this.currentMove = null;
      return;
    }
  }
  /*What this does is already explained above, ill elaborae HOW it works */
  finishTurn() {
    /*Since were not calling ts each frame no guard clause */
    const { axis, dir, layer } = this.currentMove; //destructuring the object
    for (const cubie of this.cubelets) {
      //ofc if were turning a layer we check all cublets
      const [x, y, z] = cubie.pos; //getting the position of each cubie

      /*if were not on a desired layer we dont need to do anything here.*/
      if (
        (axis === "x" && x !== layer) ||
        (axis === "y" && y !== layer) ||
        (axis === "z" && z !== layer)
      )
        continue;

      /*The 3 cases below perform a simple direction rotation based on direction */
      if (axis === "x") {
        cubie.pos = dir === 1 ? [x, -z, y] : [x, z, -y];
      }

      if (axis === "y") {
        cubie.pos = dir === 1 ? [z, y, -x] : [-z, y, x];
      }

      if (axis === "z") {
        cubie.pos = dir === 1 ? [-y, x, z] : [y, -x, z];
      }

      /*The above case switches the position of the cubies, but we need to switch their faces too */
      const f = { ...cubie.faces };
      /*All of this is standard stuff, just grab a rubix cube and test it out for yourself brah,
      like if u do the sexy move (yes its officially called that) R U R' U' see the stickers and how
      they rotate. on x rotation;
      R-> top becomes back front becomes top etc so on
      basically for all standard moves."
      THis is also the reason i didnt include M E S (slice moves) or wide moves or double moves for that
      matter. if RDUBFL can be done all of them can be done (i am NOT spending another hour on my cube) */
      if (axis === "x") {
        if (dir === 1) {
          cubie.faces.top = f.back;
          cubie.faces.front = f.top;
          cubie.faces.bottom = f.front;
          cubie.faces.back = f.bottom;
        } else {
          cubie.faces.top = f.front;
          cubie.faces.front = f.bottom;
          cubie.faces.bottom = f.back;
          cubie.faces.back = f.top;
        }

        cubie.faces.left = f.left;
        cubie.faces.right = f.right;
      }

      if (axis === "y") {
        if (dir === 1) {
          cubie.faces.front = f.left;
          cubie.faces.right = f.front;
          cubie.faces.back = f.right;
          cubie.faces.left = f.back;
        } else {
          cubie.faces.front = f.right;
          cubie.faces.left = f.front;
          cubie.faces.back = f.left;
          cubie.faces.right = f.back;
        }

        cubie.faces.top = f.top;
        cubie.faces.bottom = f.bottom;
      }

      if (axis === "z") {
        if (dir === 1) {
          cubie.faces.top = f.right;
          cubie.faces.left = f.top;
          cubie.faces.bottom = f.left;
          cubie.faces.right = f.bottom;
        } else {
          cubie.faces.top = f.left;
          cubie.faces.right = f.top;
          cubie.faces.bottom = f.right;
          cubie.faces.left = f.bottom;
        }

        cubie.faces.front = f.front;
        cubie.faces.back = f.back;
      }
    }

    this.currentMove = null;
  }

  /*Probably the easiest to understand, if cubie moving, give pack pivot and rotation,
if not moving give stationary */
  getCubieTransform(cubie) {
    if (!this.currentMove) {
      return { rotation: { x: 0, y: 0, z: 0 }, pivot: { x: 0, y: 0, z: 0 } };
    }

    const { axis, angle, dir, pivot } = this.currentMove;

    const rot = { x: 0, y: 0, z: 0 };
    /*pretty smart but the incremented angle is 90deg and dir is relative to user, hence
    makes rotations work! */
    if (axis === "x") rot.x = angle * dir;
    if (axis === "y") rot.y = angle * dir;
    if (axis === "z") rot.z = angle * dir;

    // only affect cubies in layer
    const [x, y, z] = cubie.pos;
    const inLayer =
      (axis === "x" && x === pivot.x) ||
      (axis === "y" && y === pivot.y) ||
      (axis === "z" && z === pivot.z);

    if (!inLayer) {
      return { rotation: { x: 0, y: 0, z: 0 }, pivot: null };
    }

    return { rotation: rot, pivot };
  }
  reset() {
    this.cubelets.length = 0;
    this.retrace = [];
    this.currentMove = null;
    this.stationary = true;
    this.generate();
  }

  steps() {
    const inverseMoves = {
      R: "R'",
      "R'": "R",
      L: "L'",
      "L'": "L",
      U: "U'",
      "U'": "U",
      D: "D'",
      "D'": "D",
      F: "F'",
      "F'": "F",
      B: "B'",
      "B'": "B",
    };
    const solution = this.retrace.map((e) => inverseMoves[e]).reverse();
    return solution;
  }
  async solve() {
    this.stationary = false;
    const solution = this.steps();
    for (const move of solution) {
      if (this.stationary) return;
      this.rotate(move);
      while (this.currentMove) await new Promise((r) => setTimeout(r, 10));

      await new Promise((r) => setTimeout(r, 100));
    }
    this.retrace = [];
    this.stationary = true;
  }

  async scramble() {
    const scrambleOrder = [];
    const moves = ["R", "L", "U", "D", "F", "B"];
    for (let i = 0; i < 20; i++) {
      let order = moves[Math.floor(Math.random() * 6)];
      order += Math.random() < 0.5 ? "'" : "";
      scrambleOrder.push(order);
    }
    this.stationary = false;
    for (const move of scrambleOrder) {
      if (this.stationary) return;
      this.rotate(move);
      while (this.currentMove) await new Promise((r) => setTimeout(r, 10));

      await new Promise((r) => setTimeout(r, 100));
    }
    this.stationary = true;
  }
}
