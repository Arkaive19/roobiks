const vs = [
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },
  { x: 0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
];

const fs = [
  [0, 2, 3, 1],
  [4, 5, 7, 6],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

const anim = () => {
  let dtheta = 0;
  let fps = 60;
  let last = performance.now();

  const frame = (FPS = 60) => {
    const dt = 1 / FPS;
    console.log(dt);
    dtheta += Math.PI * dt;
    clear();
    for (const f of fs) {
      for (let i = 0; i < f.length; ++i) {
        const a = vs[f[i]];
        const b = vs[f[(i + 1) % f.length]];
        line(
          cartesianGrapher(project(fixPerspective(rotate_xz(a, dtheta)))),
          cartesianGrapher(project(fixPerspective(rotate_xz(b, dtheta)))),
        );
      }
    }
    setTimeout(() => frame(FPS), 1000 / FPS);
  };
  setTimeout(() => frame(fps), 1000 / fps);
};

anim();
