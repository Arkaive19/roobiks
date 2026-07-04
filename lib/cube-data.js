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
  { indices: [3, 2, 1, 0], color: [255, 0, 0] }, // red
  { indices: [4, 5, 6, 7], color: [0, 255, 0] }, // green

  { indices: [0, 1, 5, 4], color: [0, 0, 255] }, // blue
  { indices: [7, 6, 2, 3], color: [255, 255, 0] }, // yellow

  { indices: [4, 7, 3, 0], color: [128, 0, 128] }, // purple
  { indices: [1, 2, 6, 5], color: [0, 255, 255] }, // cyan
];
