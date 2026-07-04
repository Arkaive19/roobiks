export const SIZE = 0.25;
export const GAP = SIZE * 2;
export const OFFSETS = [-1, 0, 1];

export const V = [
  { x: -SIZE, y: -SIZE, z: -SIZE },
  { x: SIZE, y: -SIZE, z: -SIZE },
  { x: SIZE, y: SIZE, z: -SIZE },
  { x: -SIZE, y: SIZE, z: -SIZE },
  { x: -SIZE, y: -SIZE, z: SIZE },
  { x: SIZE, y: -SIZE, z: SIZE },
  { x: SIZE, y: SIZE, z: SIZE },
  { x: -SIZE, y: SIZE, z: SIZE },
];

export const E = [
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

export const F = [
  { indices: [0, 1, 2, 3], color: "red" },
  { indices: [4, 5, 6, 7], color: "green" },
  { indices: [0, 1, 5, 4], color: "blue" },
  { indices: [2, 3, 7, 6], color: "yellow" },
  { indices: [0, 3, 7, 4], color: "purple" },
  { indices: [1, 2, 6, 5], color: "cyan" },
];
