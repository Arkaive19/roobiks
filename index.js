import { roobiks } from "./lib/cube-data.js";
let visible = false;
let hexAnimated = false;
let fadeOut = false;

const timing = {
  appear: 50,
  draw: 600,
  disappear: 1400,
  finish: 2000,
};

document.addEventListener("DOMContentLoaded", () => {
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
    // console.log("Animation finished");
    content.style.display = "block";
  }, timing.finish);
});

document.querySelector(".solve").addEventListener("click", () => {
  roobiks.solve();
});
document.querySelector(".scramble").addEventListener("click", () => {
  roobiks.scramble();
});
