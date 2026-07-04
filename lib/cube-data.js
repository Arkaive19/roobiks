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
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 1, 5, 4],
  [2, 3, 7, 6],
  [0, 3, 7, 4],
  [1, 2, 6, 5],
];
