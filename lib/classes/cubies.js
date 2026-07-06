class Cubie {
  constructor(pos, faces) {
    this.pos = pos;
    this.SIZE = 0.25;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.faces = faces;
    this.rotationType = "~";
  }

  getVertices() {
    const [i, j, k] = this.pos;
    const spacing = this.SIZE * 2.05;

    const cx = i * spacing;
    const cy = j * spacing;
    const cz = k * spacing;
    const s = this.SIZE;

    return [
      { x: cx - s, y: cy - s, z: cz - s }, // Bottom-Back-Left
      { x: cx + s, y: cy - s, z: cz - s }, // Bottom-Back-Right
      { x: cx + s, y: cy + s, z: cz - s }, // Top-Back-Right
      { x: cx - s, y: cy + s, z: cz - s }, // Top-Back-Left
      { x: cx - s, y: cy - s, z: cz + s }, // Bottom-Front-Left
      { x: cx + s, y: cy - s, z: cz + s }, // Bottom-Front-Right
      { x: cx + s, y: cy + s, z: cz + s }, // Top-Front-Right
      { x: cx - s, y: cy + s, z: cz + s }, // Top-Front-Left
    ];
  }
  getEdges() {
    return [
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
  }

  getFaces() {
    const faces = [];
    if (this.faces.back)
      faces.push({ indices: [3, 2, 1, 0], color: this.faces.back });
    if (this.faces.front)
      faces.push({ indices: [4, 5, 6, 7], color: this.faces.front });
    if (this.faces.bottom)
      faces.push({ indices: [0, 1, 5, 4], color: this.faces.bottom });
    if (this.faces.top)
      faces.push({ indices: [7, 6, 2, 3], color: this.faces.top });
    if (this.faces.left)
      faces.push({ indices: [4, 7, 3, 0], color: this.faces.left });
    if (this.faces.right)
      faces.push({ indices: [1, 2, 6, 5], color: this.faces.right });
    return faces;
  }
}

export default class Roobiks {
  constructor() {
    this.cubelets = [];
    this.currentMove = null;
    this.generate();
  }

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

  rotate(move) {
    if (this.currentMove) return;
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

  incrementLayer(type) {
    if (!this.currentMove) return;
    if (type == "'") {
      this.currentMove.angle -= 0.08;
      this.rotationType = "'";
    } else {
      this.currentMove.angle += 0.08;
      this.rotationType = "~";
    }

    if (Math.abs(this.currentMove.angle) >= Math.PI / 2) {
      this.currentMove.angle = Math.PI / 2;
      this.finishTurn();
      this.currentMove = null;
      return;
    }
  }

  finishTurn() {
    const { axis, dir, layer } = this.currentMove;
    for (const cubie of this.cubelets) {
      const [x, y, z] = cubie.pos;

      if (
        (axis === "x" && x !== layer) ||
        (axis === "y" && y !== layer) ||
        (axis === "z" && z !== layer)
      )
        continue;

      if (axis === "x") {
        cubie.pos = dir === 1 ? [x, -z, y] : [x, z, -y];
      }

      if (axis === "y") {
        cubie.pos = dir === 1 ? [-z, y, x] : [z, y, -x];
      }

      if (axis === "z") {
        if (axis === "z") {
          cubie.pos = dir === 1 ? [y, -x, z] : [-y, x, z];
        }
      }

      const f = { ...cubie.faces };

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

  getCubieTransform(cubie) {
    if (!this.currentMove) {
      return { rotation: { x: 0, y: 0, z: 0 }, pivot: { x: 0, y: 0, z: 0 } };
    }

    const { axis, angle, pivot } = this.currentMove;

    const rot = { x: 0, y: 0, z: 0 };

    if (axis === "x") rot.x = angle;
    if (axis === "y") rot.y = angle;
    if (axis === "z") rot.z = angle;

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
}
