class visualizer3d {
  constructor(selector) {
    this.canvasEl =
      document.querySelector(selector) ??
      (() => {
        throw new Error("Canvas not found");
      })();
    this.canvas = this.canvasEl.getContext("2d");
    window.addEventListener("resize", this.canvasResize);
    this.canvasResize();
  }

  clear = () => {
    this.canvas.fillStyle = "#101010";
    this.canvas.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
  };

  canvasResize = () => {
    this.canvasEl.width = window.innerHeight;
    this.canvasEl.height = window.innerHeight;
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
    */
    return {
      x: ((p.x + 1) * this.canvasEl.width) / 2,
      y: ((1 - p.y) * this.canvasEl.height) / 2,
    };
  };

  project = ({ x, y, z }) => {
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
        the projection of the 3d object is accurate to scale of the this.canvas/screen/renderer and our eyes,
        the shape retains but we perceive it differently. human error is not inducive for perspective.

        a good analogy is;
          if we make a eye and want it to stare the user we make it look at (0,0)
          if the player moves to the right, the eye will still look at (0,0)
          but the player will perceive it as if the eye is looking at the left, that is the users fault
          not ours and doesnt need fixing!

        (im hoping someone reads this i spent wayy too much time writing this 🥀🥀🥀🥀)
    */
    return { x: x / z, y: y / z };
  };

  fixPerspective = ({ x, y, z }) => {
    return { x, y, z: z + 1 };
  };

  rotate_xz = ({ x, y, z }, angle) => {
    /*Standard xz rotation matrix */
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
      x: x * c - z * s,
      y,
      z: x * s + z * c,
    };
  };
}

export default visualizer3d;
