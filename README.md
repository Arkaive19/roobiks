

# Roobiks

A Javascript Software 3D renderer made from scratch!

[@TSCODING]()

https://github.com/user-attachments/assets/bcc9686c-523e-42bf-a0b8-797385fa876c


Click on the canvas to start moving around,
WASD and mouse to look around.
1-R;
2-L;
3-U;
4-D;
5-F;
6-B;

press shift and the numerals to do a ' move. SHIFT+1(!)=>R' etc

## Overview

Roobiks is a personal project ive been wanting to try to simualte how 3d graphics is actually rendered. This video by [@TSCODING](https://www.youtube.com/watch?v=qjWkNZ0SXfo) was a great inspiration for me to get involved and start this project in general!

## Features

- Perspective projection
- Camera system
- Mouse-look
- Backface culling
- Lambert lighting
- Face sorting
- Mesh rendering
- Rubik's Cube demo
- Well documented steps inside scripts for each feature and method

## Built for Hack Club Stardance

Arkaive was built as part of **Hack Club Stardance**, where the goal was to create and ship a real project from start to finish. The project was an opportunity to learn more about rasterizations, GPU rendering processes and the math used to make it possible!

## AI Usage

To be transparent, AI was used only as a development aid for:

- Looking up html5 canvas queries and syntax
- Debugging issues during development
- Researching actual cubing methods, algorithms and theory.
- Optimization questions and queries. (Lots of them)
- Add a fps counter (never worked with requestAnimationFrame() before)

The application's design, implementation, features, and overall architecture were created by me. 😊

## Installation

(I HIGHLY reccomend installing this if u really wanna learn how rasterization works, i dont claim to be "all knowing" but i think ive
explained things with comments to an extent where anyone can understand what's going on. but ofcourse, do check out)
installation is very easy and simple; just clone the repo and serve with either

```zsh
npx serve
http-server
# whatever serving tool you have
```

or other serving tools, or more conviniently check my project out the github Repo
Roobiks has reached a stage where im forced on a wall of cpu rasterization, and html5 canvas methods can no longer
be used for complex meshes and stuff.
