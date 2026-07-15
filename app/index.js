import { roobiks, modalCubie, setModalCubie } from "./lib/cube-data.js";

//make btns work

let visible = false;
let hexAnimated = false;
let fadeOut = false;

const timing = {
  appear: 50,
  draw: 600,
  disappear: 1400,
  finish: 2000,
};
const popup = document.querySelector(".popup");

document.addEventListener("DOMContentLoaded", () => {
  popup.style.display = "none";
  const overlay = document.querySelector(".overlay");
  const content = document.querySelector(".content");
  const polygon = document.querySelector(".hex-border polygon");
  polygon.getBoundingClientRect();
  setTimeout(() => {
    visible = true;
    overlay.classList.add("visible");
  }, timing.appear);

  setTimeout(() => {
    hexAnimated = true;
    polygon.style.strokeDashoffset = "0";
  }, timing.draw);

  setTimeout(() => {
    fadeOut = true;
    overlay.classList.add("fade-out");
  }, timing.disappear);

  setTimeout(() => {
    content.style.display = "block";
  }, timing.finish);
});

document.querySelector(".solve").addEventListener("click", () => {
  roobiks.solve();
});
document.querySelector(".model").addEventListener("click", () => {
  modalCubie == "cube" ? setModalCubie("penguin") : setModalCubie("cube");
  console.log(modalCubie);
});
document.querySelector(".scramble").addEventListener("click", () => {
  roobiks.scramble();
});
document.querySelector(".information").addEventListener("click", () => {});
