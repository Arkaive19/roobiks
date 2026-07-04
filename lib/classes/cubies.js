class cubies {
  constructor() {
    this.cubie.faces = {
      up: "white",
      down: "yellow",
      left: "orange",
      right: "red",
      front: "green",
      back: "blue",
    };

    this.cubecube = [];

    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          cube.push({
            pos: { x, y, z },
            rot: { x: 0, y: 0, z: 0 },
          });
        }
  }
  drawCubie = () => {};
}
