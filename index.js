const canvasEl = document.querySelector("#roobiks");
const canvas = canvasEl.getContext("2d");
const fps = 60;

const clear = () => {
  canvas.fillStyle = "#101010";
  canvas.fillRect(0, 0, canvasEl.width, canvasEl.height);
  console.log("cleared");
};
const canvasResize = () => {
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
  clear();
};
window.addEventListener("resize", canvasResize);
canvasResize();

const point = ({ x, y }) => {
  const size = 30;
  canvas.fillStyle = "#18d583";
  canvas.fillRect(x - size / 2, y - size / 2, size, size);
};

const cartesianGrapher = (p) => {
  /* expects points in a cartesian coordinate system from [-1,1]
       to normalize it and display it in canvas, we must convert it.
       canvas has its (0,0) in the top left corner,
       so basically,
       cartesian (0,0) --> canvas(1/2 units, 1/2 units)
       cartesian (-1,1) --> canvas(0 units, 0 units) 
       cartesian (x,y) --> canvas((x+1)/2 units, (1-y)/2 units)
       also, the units in this case is the total size of the canvas.
       hence;
       cartesian (x,y) --> canvas ((x+1)/2 * canvas.width, (1-y)/2 * canvas.height)
    */
  return {
    x: ((p.x + 1) * canvasEl.width) / 2,
    y: ((1 - p.y) * canvasEl.height) / 2,
  };
};
console.log(cartesianGrapher({ x: 0, y: 0 }));
point(cartesianGrapher({ x: 0, y: 0 }));
