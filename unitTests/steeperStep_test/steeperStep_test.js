const res = 100;
const n = 1;

let pts = [];

function setup() {
  createCanvas(400, 400);
  let x;
  for (let i = 0; i < res; i++) {
    x = i / (res - 1);
    append(pts, createVector(x * 100, steeperStep(x, n) * 100));
  }
}

function draw() {
  background(0);
  strokeWeight(1);
  stroke(255);
  line(0, height / 2, width, height/ 2);
  line(width/2, 0, width / 2, height);
  
  for (let i = 0; i < pts.length; i++) {
    pPoint(pts[i])
  }
  
  noLoop();
}
