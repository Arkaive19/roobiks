class visualizer3d {
  constructor(selector) {
    this.canvasEl =
      document.querySelector(selector) ??
      (() => {
        throw new Error("Canvas not found");
      })();
    this.canvas = this.canvasEl.getContext("2d");
    this.light = {
      x: -1,
      y: -1,
      z: -1,
      ambient: 0.25,
    };
    this.faceQueue = [];
    const len = Math.hypot(this.light.x, this.light.y, this.light.z);
    this.light.x /= len;
    this.light.y /= len;
    this.light.z /= len;
    this.camera = {
      x: 0,
      y: 0,
      z: -5,

      yaw: 0,
      pitch: 0,
    };
    this.drawOrder = [];
    this.keys = {};
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    window.addEventListener("resize", this.canvasResize);
    this.cameraSetup();
    this.canvasResize();
  }

  updateCamera() {
    const speed = 0.05;

    const sin = Math.sin(this.camera.yaw);
    const cos = Math.cos(this.camera.yaw);

    if (this.keys["w"]) {
      this.camera.x += sin * speed;
      this.camera.z += cos * speed;
    }
    if (this.keys["s"]) {
      this.camera.x -= sin * speed;
      this.camera.z -= cos * speed;
    }

    if (this.keys["a"]) {
      this.camera.x -= cos * speed;
      this.camera.z += sin * speed;
    }

    if (this.keys["d"]) {
      this.camera.x += cos * speed;
      this.camera.z -= sin * speed;
    }
    if (this.keys["r"]) {
      this.camera.x = 0;
      this.camera.y = 0;
      this.camera.z = -5;
      this.camera.yaw = 0;
      this.camera.pitch = 0;
    }

    if (this.keys[" "]) this.camera.y += speed;
    if (this.keys["shift"]) this.camera.y -= speed;
  }

  cameraSetup = () => {
    this.canvasEl.addEventListener("contextmenu", (e) => e.preventDefault());
    this.canvasEl.addEventListener(
      "mousedown",
      (e) => e.button == 0 && this.canvasEl.requestPointerLock(),
    );
    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== this.canvasEl) return;

      this.camera.yaw += e.movementX * 0.004;
      this.camera.pitch += e.movementY * 0.004;

      const limit = Math.PI / 2 - 0.01;

      this.camera.pitch = Math.max(-limit, Math.min(limit, this.camera.pitch));
    });
  };

  clear = () => {
    this.canvas.fillStyle = "#101010";
    this.canvas.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
  };

  canvasResize = () => {
    const bigger = Math.max(window.innerHeight, window.innerWidth);
    this.canvasEl.width = bigger;
    this.canvasEl.height = bigger;
    this.clear();
  };

  point = ({ x, y }) => {
    /* Standard way to draw a point on this.canvas
  the size/2 thingy is to make points center be where we want it :D
  */
    const size = 10;
    this.canvas.fillStyle = "#18d583";
    this.canvas.fillRect(x - size / 2, y - size / 2, size, size);
  };

  line = (p1, p2) => {
    /* wireframes are cool twan */
    this.canvas.lineWidth = 3;
    this.canvas.strokeStyle = "#18d583";
    this.canvas.beginPath();
    this.canvas.moveTo(p1.x, p1.y);
    this.canvas.lineTo(p2.x, p2.y);
    this.canvas.stroke();
  };

  face(p1, p2, p3, p4, color = "red") {
    this.canvas.fillStyle = color;
    this.canvas.beginPath();
    this.canvas.moveTo(p1.x, p1.y);
    this.canvas.lineTo(p2.x, p2.y);
    this.canvas.lineTo(p3.x, p3.y);
    this.canvas.lineTo(p4.x, p4.y);
    this.canvas.closePath();
    this.canvas.fill();
  }

  cartesianGrapher = (p) => {
    /* expects points in a cartesian coordinate system from [-1,1]
       to normalize it and display it in this.canvas, we must convert it.
       this.canvas has its (0,0) in the top left corner,
       so basically,
       cartesian (0,0) --> this.canvas(1/2 units, 1/2 units)
       cartesian (-1,1) --> this.canvas(0 units, 0 units) 
       cartesian (x,y) --> this.canvas((x+1)/2 units, (1-y)/2 units)
       also, the units in this case is the total size of the this.canvas.
       hence;
       cartesian (x,y) --> this.canvas ((x+1)/2 * this.canvas.width, (1-y)/2 * this.canvas.height)
       (i personally like this method cuz i can export models and shi and js look at things 💔🥀🥀)  

       also u may notice that ive actually multiplied the x by canvasEL.height too,
       this is intentional to keep scaling uniform

    */

    return {
      x: ((p.x + 1) * this.canvasEl.width) / 2,
      y: ((1 - p.y) * this.canvasEl.width) / 2,
    };
  };

  project = ({ x, y, z }, f = 1) => {
    /*
    This very simple function is what makes 3D graphics possible. :D
    the way it works is that it takes a 3D point and projects it onto a 2D plane.
    When you look around you, you are looking at a 2D projection of a 3D world.
    you mightve noticed how putting objects further away from you makes them smaller,
    from my own research they approximate to what we call a vanishing point, around (0,0)
    from any plane, that incldes our eyes.

    let us consider the distance from our eyes to the screen as f or focal length.
    our eyes are at )(0,0,0) and the screen is at S(0,0,f)
    let us assume a point P(x,y,z) and our eyes are looking at it.
    the vector joining our eyes to the point to the point is simply P-O. but,
    before reaching our eyes when the rays intersect the screen, they will intersect at a point 
    P'(x',y',f).
    The vector P-O represents a distance of D units; D=P-O
    now let us assume a line that slowly goes from P to O.
    the starting point would be Line=Point O, and the ending point would be initial point + the distance vector D
    .making us reach the point P.
    but assuming the line to a function we deduce that the line;
    L(t)=O+t*D where t is a small incremental value that goes from 0 to 1, and D is the distance vector.

    Now, finally: 
      When the point increments and reaches z=f;
      L(t)=O+t*D
      L(t)=(0,0,0)+t*(x,y,z) [hence; (x,y,z)-(0,0,0)=(x,y,z)]
      L(t)=(t*x,t*y,t*z)

      Since the line reaches (t*x,t*y,t*z) at z=f, we can say;
      L(t)=P'
      P'(x',y',f)=(t*x,t*y,t*z)
      
      Equating Corresponding components, we get;
      t*z=f
      t=f/z

      substituting t in the other components, we get;
      x'=t*x=(f/z)*x
      y'=t*y=(f/z)*y

      which is the final formula, but since we can assume f=1 units which can be whatever distance
      from user to screen, we can simplify it to;
        x'=x/z
        y'=y/z

        for further clarification, we can think of it like this. If our head is constantly in place then,
        the projection of the 3d object is accurate to scale of the this.canvas/screen/this and our eyes,
        the shape retains but we perceive it differently. human error is not inducive for perspective.

        a good analogy is;
          if we make a eye and want it to stare the user we make it look at (0,0)
          if the player moves to the right, the eye will still look at (0,0)
          but the player will perceive it as if the eye is looking at the left, that is the users fault
          not ours and doesnt need fixing!

        (im hoping someone reads this i spent wayy too much time writing this 🥀🥀🥀🥀)
    */

    return {
      x: (f * x) / z,
      y: (f * y) / z,
    };
  };
  cameraTransform = ({ x, y, z }) => {
    /*In my time making this, this is byfar the coolest maths i have had to do.
    Basically, the camera is ALWAYS the center of the world at all times. Even though the
    relative projection of the world is the same, when we move; EVERYTHING moves.

    basically;
      move mouse left right --> rotation in XZ plane
      move mouse up down --> rotation in YZ plane

      although from my research most people js use 1 mega rotation matrix everything, ive decided on this approach
      as going from a->b-> is same as a-> (im js lazy)

    
  */

    x -= this.camera.x;
    y -= this.camera.y;
    z -= this.camera.z;

    const cy = Math.cos(this.camera.yaw);
    const sy = Math.sin(this.camera.yaw);

    let nx = x * cy - z * sy;
    let nz = x * sy + z * cy;

    x = nx;
    z = nz;

    const cp = Math.cos(-this.camera.pitch);
    const sp = Math.sin(-this.camera.pitch);

    const ny = y * cp - z * sp;
    const nz2 = y * sp + z * cp;

    return {
      x,
      y: ny,
      z: nz2,
    };
  };

  rotateAxes = (point, rotation, pivot = { x: 0, y: 0, z: 0 }) => {
    let x = point.x - pivot.x;
    let y = point.y - pivot.y;
    let z = point.z - pivot.z;

    const c = {
      x: Math.cos(rotation.x),
      y: Math.cos(rotation.y),
      z: Math.cos(rotation.z),
    };

    const s = {
      x: Math.sin(rotation.x),
      y: Math.sin(rotation.y),
      z: Math.sin(rotation.z),
    };
    //standarad stuff rotation matrices
    // X
    [y, z] = [y * c.x - z * s.x, y * s.x + z * c.x];
    // Y
    [x, z] = [x * c.y + z * s.y, -x * s.y + z * c.y];
    // Z
    [x, y] = [x * c.z - y * s.z, x * s.z + y * c.z];

    return {
      x: x + pivot.x,
      y: y + pivot.y,
      z: z + pivot.z,
    };
  };
  rotateAngle = (point, c, s, pivot = { x: 0, y: 0, z: 0 }) => {
    let x = point.x - pivot.x;
    let y = point.y - pivot.y;
    let z = point.z - pivot.z;

    // X
    [y, z] = [y * c.x - z * s.x, y * s.x + z * c.x];
    // Y
    [x, z] = [x * c.y + z * s.y, -x * s.y + z * c.y];
    // Z
    [x, y] = [x * c.z - y * s.z, x * s.z + y * c.z];

    return {
      x: x + pivot.x,
      y: y + pivot.y,
      z: z + pivot.z,
    };
  };
  translatePoint({ x, y, z }, position) {
    x += position.x;
    y += position.y;
    z += position.z;
    return { x, y, z };
  }
  /*
  THIS is byfar the most complex part of this whole thing. since drawMesh is used in animations etc,
  and computing the vertices, edges and faces is a bit of a pain, i had to research on optimal ways to 
  do so. i found out that the best way to do it js not use the already defined functions (what happened
  to modularity bruh) and manually do all the arithmetic with each call.

  but to better understand drawMesh i should explain the workflow with the predefined functions.

   let POINT be a 3d point (x,y,z)
    perform transformation on it. rotation translation are mainly included
    cameraTransform() just subtracts everything rendering from our current camera position for relativity
    project() turns the 3d point into a drawable shape via (x*f/z,f*y/z)
    cartesianGrapher(POINT) turns it from a [-1,1] grapth to a [0,w] graph
   which is then, and ONLY then drawn into the canvas with point, or if 2 points line or 4 points face
   u get the idea

   drawMesh just does all of this stuff inline. if for any reason u wanna build from my shitty class
   the workflow is above.


  */

  drawMesh({
    vertices = [],
    edges = [],
    faces = [],
    translation = { x: 0, y: 0, z: 0 },
    rotation = {
      x: 0,
      y: 0,
      z: 0,
    },
    pivot = { x: 0, y: 0, z: 0 },
  }) {
    /*Caching data like this is very helpful, since it's a lot faster than 
      computing the same data every time
      and also saves memory. */
    const w = this.canvasEl.width;
    const cam = this.camera;

    const cYaw = Math.cos(cam.yaw);
    const sYaw = Math.sin(cam.yaw);
    const cPitch = Math.cos(-cam.pitch);
    const sPitch = Math.sin(-cam.pitch);

    const cx = Math.cos(rotation.x);
    const sx = Math.sin(rotation.x);
    const cy = Math.cos(rotation.y);
    const sy = Math.sin(rotation.y);
    const cz = Math.cos(rotation.z);
    const sz = Math.sin(rotation.z);

    const px = pivot?.x ?? 0;
    const py = pivot?.y ?? 0;
    const pz = pivot?.z ?? 0;

    const tx = translation.x;
    const ty = translation.y;
    const tz = translation.z;

    const n = vertices.length;
    const projX = new Float32Array(n);
    const projY = new Float32Array(n);
    const depth = new Float32Array(n);
    const viewX = new Float32Array(n);
    const viewY = new Float32Array(n);
    const viewZ = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      /*Although this may look like ooga booga magic,
      its just doing;
      + rotation:
      -pivot offsetting;
      -rotating
      -reversing offsetting

      +camera fixing and translating in the same line
      +skipping nodes too close to us
      +storing depth for depth based sorting later on
      +cartesianGraphing the whole result.

      Voila! isnt magic after all now
      */
      let { x, y, z } = vertices[i];
      let t;

      x -= px;
      y -= py;
      z -= pz;

      t = y;
      y = t * cx - z * sx;
      z = t * sx + z * cx;

      t = x;
      x = t * cy + z * sy;
      z = -t * sy + z * cy;

      t = x;
      x = t * cz - y * sz;
      y = t * sz + y * cz;

      x += px + tx - cam.x;
      y += py + ty - cam.y;
      z += pz + tz - cam.z;

      t = x;
      x = t * cYaw - z * sYaw;
      z = t * sYaw + z * cYaw;

      t = y;
      y = t * cPitch - z * sPitch;
      z = t * sPitch + z * cPitch;

      viewX[i] = x;
      viewY[i] = y;
      viewZ[i] = z;

      depth[i] = z;

      if (z <= 0.01) {
        projX[i] = projY[i] = NaN;
        continue;
      }

      const invZ = 1 / z;

      projX[i] = (x * invZ + 1) * w * 0.5;
      projY[i] = (1 - y * invZ) * w * 0.5;
    }

    const faceQueue = this.faceQueue;

    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const f = face.indices;

      if (
        Number.isNaN(projX[f[0]]) ||
        Number.isNaN(projX[f[1]]) ||
        Number.isNaN(projX[f[2]]) ||
        Number.isNaN(projX[f[3]])
      )
        continue;

      const x1 = projX[f[0]];
      const y1 = projY[f[0]];
      const x2 = projX[f[1]];
      const y2 = projY[f[1]];
      const x3 = projX[f[2]];
      const y3 = projY[f[2]];

      const cross = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);

      if (cross < 0) continue;
      /*This is backface culling!, if i cant see the face dont draw the face! */

      const brightness = this.shading(face, viewX, viewY, viewZ);

      faceQueue.push({
        x1: projX[f[0]],
        y1: projY[f[0]],
        x2: projX[f[1]],
        y2: projY[f[1]],
        x3: projX[f[2]],
        y3: projY[f[2]],
        x4: projX[f[3]],
        y4: projY[f[3]],

        depth: (depth[f[0]] + depth[f[1]] + depth[f[2]] + depth[f[3]]) * 0.25,

        color: this.shadeColor(face.color, brightness),
      });
    }
  }

  shading(face, viewX, viewY, viewZ) {
    const [i0, i1, i2] = face.indices;

    const ax = viewX[i0];
    const ay = viewY[i0];
    const az = viewZ[i0];

    const bx = viewX[i1];
    const by = viewY[i1];
    const bz = viewZ[i1];

    const cx = viewX[i2];
    const cy = viewY[i2];
    const cz = viewZ[i2];

    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;

    const vx = cx - ax;
    const vy = cy - ay;
    const vz = cz - az;

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;

    const len = Math.hypot(nx, ny, nz);

    nx /= len;
    ny /= len;
    nz /= len;

    const dot = nx * this.light.x + ny * this.light.y + nz * this.light.z;

    return Math.max(this.light.ambient, dot);
  }

  shadeColor(color, brightness) {
    return `rgb(
    ${color[0] * brightness},
    ${color[1] * brightness},
    ${color[2] * brightness}
  )`;
  }
  startFrame() {
    this.faceQueue.length = 0;
  }
  /*This is a very clever thing ive learned. In 2d space drawing wireframes is easy but,
     with colored faces i must consider the order theyre drawn in. what this is doing is just
     taking the cartesian graphed points in projX and projY, it runs a guard clause to skip any unneeded faces
     then the real magic happens. it takes the average depth of each face then sorts them and only then draws them
     so faces closer to u are draw later hence appear to be closer.
      (this is NOT fun and games)
     */
  endFrame() {
    this.faceQueue.sort((a, b) => b.depth - a.depth);

    for (const f of this.faceQueue) {
      console.log("redraw");
      this.face(
        { x: f.x1, y: f.y1 },
        { x: f.x2, y: f.y2 },
        { x: f.x3, y: f.y3 },
        { x: f.x4, y: f.y4 },
        f.color,
      );
    }
  }
}

export default visualizer3d;
