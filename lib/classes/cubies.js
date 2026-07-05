class Cubie {
  constructor(pos, faces) {
    this.pos = pos;
    this.SIZE = 0.25;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.faces = faces;
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
    this.generate();
  }

  generate() {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          let currentFaceColors = {};

          if (j === 1) currentFaceColors.top = [255, 255, 0];
          if (j === -1) currentFaceColors.bottom = [255, 255, 255];

          if (i === -1) currentFaceColors.left = [0, 0, 255];
          if (i === 1) currentFaceColors.right = [0, 255, 0];

          if (k === 1) currentFaceColors.front = [255, 0, 0];
          if (k === -1) currentFaceColors.back = [255, 165, 0];

          this.cubelets.push(new Cubie([i, j, k], currentFaceColors));
        }
      }
    }
  }
}
