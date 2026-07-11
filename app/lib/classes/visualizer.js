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
    this.wireframe = false;
    this.depthBuffer;
    this.frameBuffer;
    this.imageData;

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
    const speed = 0.1;

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
      this.cameraReset();
    }

    if (this.keys[" "]) this.camera.y += speed;
    if (this.keys["shift"]) this.camera.y -= speed;
  }

  cameraReset = () => {
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.z = -5;
    this.camera.yaw = 0;
    this.camera.pitch = 0;
  };
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

  cameraTransform = ({ x, y, z }) => {
    /*In my time making this, this is byfar the coolest maths i have had to do.
    Basically, the camera is ALWAYS the center of the world at all times. Even though the
    relative projection of the world is the same, when we move; EVERYTHING moves.
z
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

  clear = () => {
    this.zBufferClear();
    this.canvas.fillStyle = "#101010";
    this.canvas.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    for (let i = 0; i < this.frameBuffer.length; i += 4) {
      this.frameBuffer[i] = 16;
      this.frameBuffer[i + 1] = 16;
      this.frameBuffer[i + 2] = 16;
      this.frameBuffer[i + 3] = 255;
    }
  };

  canvasResize = () => {
    const dpr = window.devicePixelRatio || 1;
    const bigger = Math.max(window.innerHeight * dpr, window.innerWidth * dpr);
    this.canvasEl.width = bigger;
    this.canvasEl.height = bigger;
    this.depthBuffer = new Float32Array(bigger * bigger).fill(Infinity);
    this.imageData = this.canvas.createImageData(bigger, bigger);
    this.frameBuffer = this.imageData.data;
    this.clear();
  };

  zBufferClear() {
    this.depthBuffer.fill(Infinity);
  }

  point = ({ x, y, z }) => {
    /*yeah its js a pixel twan */
    const size = 10;

    const ix = Math.floor(x);
    const iy = Math.floor(y);

    const index = iy * this.canvasEl.width + ix;

    if (z < this.depthBuffer[index]) {
      this.depthBuffer[index] = z;

      const pixel = index * 4;

      this.frameBuffer[pixel] = 24;
      this.frameBuffer[pixel + 1] = 213;
      this.frameBuffer[pixel + 2] = 131;
      this.frameBuffer[pixel + 3] = 255;
    }
  };

  line(p1, p2) {
    /*Im not gonna explain whats happening here cause most of the necessary things
    are already explained in face, the bigger badder version. this is just a simpler
    case, i will say tho the     const z = 1 / ((1 - t) / p1.z + t / p2.z); 
    line may confuse some but thats just line interpolation with perspective projection**
    perspective projection is js a fancy way of saying ohh my 3d went 2d ooh */
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;

      const x = p1.x + dx * t;
      const y = p1.y + dy * t;

      const z = 1 / ((1 - t) / p1.z + t / p2.z);

      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (
        ix < 0 ||
        ix >= this.canvasEl.width ||
        iy < 0 ||
        iy >= this.canvasEl.height
      ) {
        continue;
      }
      const index = iy * this.canvasEl.width + ix;

      if (z < this.depthBuffer[index]) {
        this.depthBuffer[index] = z;

        const pixel = index * 4;

        this.frameBuffer[pixel] = 24;
        this.frameBuffer[pixel + 1] = 213;
        this.frameBuffer[pixel + 2] = 131;
        this.frameBuffer[pixel + 3] = 255;
      }
    }
  }

  face(p1, p2, p3, red, green, blue) {
    /*Implementing z-buffering, the entire drawing process has to change.
    -> binding-box
    -> area of triangle
    -> iterate over each pixel inside the binding box;
        -> 
    
    
    
    */
    const pixel_spacing = 0.2;
    const width = this.canvasEl.width;
    const height = this.canvasEl.height;

    /*First, we define a border box around the points*/
    const minX = Math.max(0, Math.floor(Math.min(p1.x, p2.x, p3.x)));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(p1.x, p2.x, p3.x)));

    const minY = Math.max(0, Math.floor(Math.min(p1.y, p2.y, p3.y)));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(p1.y, p2.y, p3.y)));

    /*This function is a helper, it allows us to compute the signed area
    of the any two points and a testing point or any 3 points!
    
    --> What is signed area?
    = signed area is a referenced area which just says if a point is ordered clockwise
       or anticlockwise or in the line.
    --> Why are we using this?
    = we can use the signed area to test if a pixel is inside the triangle or not by;
      simply checking its signed area for all 3 sides (done below)*/
    const edge = (m, n, t) =>
      (t.x - m.x) * (n.y - m.y) - (t.y - m.y) * (n.x - m.x);

    /*Signed area of the 3 points of the triangle for reference*/
    const area = edge(p1, p2, p3);

    /*we dont need to draw the pixels in the line*/
    if (area === 0) return;
    /*Loop through all pixels inside the bounding box */
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        /*pixel_spacing makes it so that, the pixels we do test dont lie on the vertic,
        or edge of the triangle 0.5 makes it so that were testing the center of the pixel */
        const px = x + 0.5;
        const py = y + 0.5;

        /*3 validations for the pixel to be inside the triangle */

        const w0 = (px - p2.x) * (p3.y - p2.y) - (py - p2.y) * (p3.x - p2.x);

        const w1 = (px - p3.x) * (p1.y - p3.y) - (py - p3.y) * (p1.x - p3.x);

        const w2 = (px - p1.x) * (p2.y - p1.y) - (py - p1.y) * (p2.x - p1.x);

        /*This basically says, if all 3 testing points are of same magnitude, draw them */
        if (
          (w0 >= 0 && w1 >= 0 && w2 >= 0) ||
          (w0 <= 0 && w1 <= 0 && w2 <= 0)
        ) {
          /*remember signed area? wn is just sort of an area for the pixels
          so we divide it by the general triangle area, giving us a relative coordinate
          system; barycentric coordinates*/
          const a = w0 / area;
          const b = w1 / area;
          const c = w2 / area;
          /*This is very interesting yet difficult to understand 
          Barycentric coordinates in a triangle basically say,
          alpha-> how far from 1st vertice
          beta-> how far from 2nd vertice
          delta-> how far from 3rd vertice

          now.
             any point P inside triangle ABC with alpha beta delta in 3d plane;
             P=alpha*A+beta*B+delta*C
             or,
             {xp,yp,zp}=alpha*{xa,ya,za}+beta*{xb,yb,zb}+delta*{xc,yc,zc}
             we only need Z so;
             Zp=alpha*Za+beta*Zb+delta*Zc ...(#)
             but but but, theres a catch

             were projecting the real world coords into a 2d screen so the bayecentric coords
             are distorted too, (well actually distorted not really correct because perspective prijection
             just makes it non linear like the ideal case uk 😅😅😅)
              to solve this
              (x,y,z)->(x/z,y/z)

              then projection
                 P'=alpha'*A'+beta'*B'+delta'*'C ...(i)
              or,P'=alpha'*A/Za+beta'*B/Zb+delta'*C/Z
              from projection we already know
              P/Z-->P'
              or.
              P'=P/Zp
              P'=alpha*A/Zp+beta*B/Zp+delta*C/Zp---(ii)
         
              but but but, since A,B,C vertices of triangle are also projected;
              A'=A/Za, B'=B/Za or in normal form Point'=Point/Zpoint
            


              in (i)
              coeffecient of A= alpha'/Za
              in (ii)
              coeffecient of A= alpha/Zp

              since both are components of A in P' they must be equal

              alpha'/Za=alpha/Zp
              alpha'=alpha*Za/Zp
              from (#);
              alpha=alpha'*Zp/Za ...(2)
           which is also true for beta and delta too.

           As we know for bayecentric coords;

           α+β+γ=1

           substituite the values from (2)

           Zp(α'/Za+β'/Zb+γ'/Zc=1)=1
          
           HENCE;
           Zp=1/(α'/Za+β'/Zb+γ'/Zc=1)

           FINALLY we have the true and accurate real depth for our pixel!


          */
          const z = 1 / (a / p1.z + b / p2.z + c / p3.z);

          /*Since depthBuffer is just a normal flatmapped array;
          we store the values (0,0),(1,0),(2,0),...,(width,0),(0,1)...
          row by row. so there will be sections;
          (0,0),(1,0),(2,0),...,(width,0) followed by
          (0,1),(1,1),(2,1),...,(width,1), and so on
          index of each pixel will be section+offset
          offset is simply x as if x=0 section first element x=n section nth element
          find the section is also simple as its just y*width. go figure 😬😬😬
           */
          const idx = y * width + x;
          /*THIS is z-index rendering */
          if (z < this.depthBuffer[idx]) {
            this.depthBuffer[idx] = z;
            /*This is similar,
             depthBuffer stored 1 value per pixel, we store 4 values RGBA per pixel
             so pixel P0 occupies 0,1,2,3 position of frameBuffer, then
             what must be the R channel of pixel Pn? 
             its simple this is also stored in sections but 4x as long as depth buffer
             so same analogy, but multiply with 4 times! */
            const pixel = idx * 4;

            this.frameBuffer[pixel] = red;
            this.frameBuffer[pixel + 1] = green;
            this.frameBuffer[pixel + 2] = blue;
            this.frameBuffer[pixel + 3] = 255;
          }
        }
      }
    }
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

  project = (x, y, z, f = 1) => {
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
      and also saves memory. (Atleast, in my experience 😝) */
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
    const NEAR = 0.01;
    const proj = this.project.bind(this);
    const faceDraw = this.face.bind(this);
    const fitScreen = this.cartesianGrapher.bind(this);
    const viewdepth = new Float32Array(n);
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

      viewdepth[i] = z;
    }

    const depthBuffer = this.depthBuffer;
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const f = face.indices;
      if (
        f[0] >= vertices.length ||
        f[1] >= vertices.length ||
        f[2] >= vertices.length
      ) {
        console.warn("Invalid face index", face);
        continue;
      }
      const intersectionNearFace = (vIn, vOut) => {
        /*lets make the intersection!
        as we know the near plane is NEAR=0.01
        lets say our inside point is (1,2,3) and outside point is (1,2,-3)
        then what must be the near plane intersection of the line joining these two points?

        as we know from my other examples above, that equation of a line in 3d plane can be given
        using a function
        L(t)=P+t*D where P is any point on the line and D is the direction vector of the line.
        in out condition, the line we want is from vIn----vOut hence,
        L1(t)=vIn+t(vIn-vOut)

        our near plane under the normal plane equation
        Ax+By+Cz+D=0 justw becomes ------> z=0.01
      or, 0x+0y+1z-0.01=0
         putting our line L1(t) in this equation based on components;
         (components just mean x y and z,
         
         L(t)=P+D*t
         can also be Lx(t)=Px+Dx*t etc  )

      or,1(vInz+t(Dz))=0.01
      or,0.01-vInz/Dz=t
      hence, the step is just 0.01-vInz/Dz

      putting it back on our equation we get;

      L(t)=vIn+( 0.01-vInz/Dz)(vIn-vOut) which is when the intersection with near plane happens!
        */
        const t = (NEAR - vIn.z) / (vOut.z - vIn.z);
        return {
          x: vIn.x + t * (vOut.x - vIn.x),
          y: vIn.y + t * (vOut.y - vIn.y),
          z: NEAR,
        };
      };

      const toScreen = (v) => {
        const p = fitScreen(proj(v.x, v.y, v.z));
        p.z = v.z;
        return p;
      };
      const x1 = viewX[f[0]];
      const y1 = viewY[f[0]];
      const z1 = viewZ[f[0]];
      const x2 = viewX[f[1]];
      const y2 = viewY[f[1]];
      const z2 = viewZ[f[1]];
      const x3 = viewX[f[2]];
      const y3 = viewY[f[2]];
      const z3 = viewZ[f[2]];

      const ax = x2 - x1;
      const ay = y2 - y1;
      const az = z2 - z1;

      const bx = x3 - x1;
      const by = y3 - y1;
      const bz = z3 - z1;

      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;

      /*back face culling */
      if (nx * x1 + ny * y1 + nz * z1 >= 0) {
        continue;
      }

      const brightness = this.shading(face, viewX, viewY, viewZ);
      const [r, g, b] = this.shadeColor(face.color, brightness);
      /*This is backface culling!, if i cant see the face dont draw the face! */

      /*We are gonna implement near face culling,
       we have 3d points of a triange, and see if any vertices are
       inside or outside the near plane. from here we can either
       - not draw if it is outside
       - recompute a new triangle to be inside */
      const insideNearPlane = [];
      const outsideNearPlane = [];

      /*This step is asking if the z index (the distance from you to the object)
      is lying inside or outside the near plane, the >= is intentional cause lying on the
      near plane is considered inside because near plane is a little further from our eye  */
      z1 >= NEAR
        ? insideNearPlane.push({ x: x1, y: y1, z: z1 })
        : outsideNearPlane.push({ x: x1, y: y1, z: z1 });
      z2 >= NEAR
        ? insideNearPlane.push({ x: x2, y: y2, z: z2 })
        : outsideNearPlane.push({ x: x2, y: y2, z: z2 });
      z3 >= NEAR
        ? insideNearPlane.push({ x: x3, y: y3, z: z3 })
        : outsideNearPlane.push({ x: x3, y: y3, z: z3 });

      const totalInside = insideNearPlane.length;
      //if all points are outside skip
      if (totalInside == 0) continue;
      /*if only one point inside the near plane, then draw the point but then find the
       near plane intersection of the edges made by the other 2 points */

      if (totalInside == 1) {
        const inV = insideNearPlane[0];

        const outV1 = intersectionNearFace(inV, outsideNearPlane[0]);
        const outV2 = intersectionNearFace(inV, outsideNearPlane[1]);

        const pIn = toScreen(inV);
        const pOut1 = toScreen(outV1);
        const pOut2 = toScreen(outV2);

        faceDraw(pIn, pOut1, pOut2, r, g, b);
      }

      /*
  Two vertices are inside.
  The clipped triangle becomes a quad, which we split into two triangles:

        inV1 -------- inV2
          \            \
           \            \
          outV1 ------- outV2

  triangles:
      inV1 -> inV2 -> outV1
      inV2 -> outV2 -> outV1
*/

      if (totalInside == 2) {
        const inV1 = insideNearPlane[0];
        const inV2 = insideNearPlane[1];

        const outV1 = intersectionNearFace(inV1, outsideNearPlane[0]);
        const outV2 = intersectionNearFace(inV2, outsideNearPlane[0]);

        const pIn1 = toScreen(inV1);
        const pIn2 = toScreen(inV2);
        const pOut1 = toScreen(outV1);
        const pOut2 = toScreen(outV2);

        faceDraw(pIn1, pIn2, pOut1, r, g, b);
        faceDraw(pIn2, pOut2, pOut1, r, g, b);
      }

      //if all points inside the near plane draw em.
      if (totalInside == 3) {
        faceDraw(
          toScreen({ x: x1, y: y1, z: z1 }),
          toScreen({ x: x2, y: y2, z: z2 }),
          toScreen({ x: x3, y: y3, z: z3 }),
          r,
          g,
          b,
        );
      }
    }
  }

  drawWireframe({
    vertices = [],
    edges = [],
    translation = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    pivot = { x: 0, y: 0, z: 0 },
  }) {
    const cam = this.camera;
    const NEAR = 0.01;

    const project = this.project.bind(this);
    const graph = this.cartesianGrapher.bind(this);
    const line = this.line.bind(this);

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

    const px = pivot.x || 0;
    const py = pivot.y || 0;
    const pz = pivot.z || 0;

    const tx = translation.x;
    const ty = translation.y;
    const tz = translation.z;

    const camX = cam.x;
    const camY = cam.y;
    const camZ = cam.z;

    const viewX = new Float32Array(vertices.length);
    const viewY = new Float32Array(vertices.length);
    const viewZ = new Float32Array(vertices.length);

    for (let i = 0, n = vertices.length; i < n; i++) {
      let { x, y, z } = vertices[i];
      let t;
      // console.log(this.depthBuffer);

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

      x += px + tx - camX;
      y += py + ty - camY;
      z += pz + tz - camZ;

      t = x;
      x = t * cYaw - z * sYaw;
      z = t * sYaw + z * cYaw;

      t = y;
      y = t * cPitch - z * sPitch;
      z = t * sPitch + z * cPitch;

      viewX[i] = x;
      viewY[i] = y;
      viewZ[i] = z;
    }

    for (let i = 0, n = edges.length; i < n; i++) {
      const edge = edges[i];
      const a = edge[0];
      const b = edge[1];

      let ax = viewX[a];
      let ay = viewY[a];
      let az = viewZ[a];

      let bx = viewX[b];
      let by = viewY[b];
      let bz = viewZ[b];

      const aInside = az >= NEAR;
      const bInside = bz >= NEAR;

      // console.log(a, b);
      if (!aInside && !bInside) continue;

      if (aInside !== bInside) {
        const t = (NEAR - az) / (bz - az);

        const ix = ax + (bx - ax) * t;
        const iy = ay + (by - ay) * t;
        // console.log(ix, iy);

        if (aInside) {
          bx = ix;
          by = iy;
          bz = NEAR;
        } else {
          ax = ix;
          ay = iy;
          az = NEAR;
        }
      }

      const p1 = graph(project(ax, ay, az));
      const p2 = graph(project(bx, by, bz));

      p1.z = az;
      p2.z = bz;
      // console.log(p1, p2);
      line(p1, p2);
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
    return [
      Math.min(255, color[0] * brightness),
      Math.min(255, color[1] * brightness),
      Math.min(255, color[2] * brightness),
    ];
  }

  startFrame() {
    this.clear();
  }
  endFrame() {
    this.canvas.putImageData(this.imageData, 0, 0);
  }
}

export default visualizer3d;
