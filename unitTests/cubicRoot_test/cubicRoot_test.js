let s1;
let roots1;
let a1 = 0.001;
let b1 = -0.1;
let c1 = 0.1;
let d1 = 20;


let s2;
let roots2;
let a2 = 0.001;
let b2 = 0;
let c2 = 0;
let d2 = 10;


let s3;
let roots3;
let a3 = 0.001;
let b3 = 0.1;
let c3 = 0;
let d3 = 0;

function spline(a, b, c, d, min, max, num_pts) {
  pts = [];
  let dx = 1 / (num_pts - 1);
  for (let i = 0; i < num_pts; i++) {
    let x = min + (max - min) * i * dx;
    let pt = createVector(x, a * x * x * x + b * x * x + c * x + d);
    append(pts, new Cardioid.Point(pt.copy()));
  }
  
  return new Cardioid.Shape(pts);
}


function setup() {
  createCanvas(400, 400);
  s1 = spline(a1, b1, c1, d1, -150, 150, 100);
  s1.stroke = [0, 0, 255];
  roots1 = cubicRoots(a1, b1, c1, d1);
  
  s2 = spline(a2, b2, c2, d2, -150, 150, 100);
  s2.stroke = [0, 255, 0];
  roots2 = cubicRoots(a2, b2, c2, d2);
  
  s3 = spline(a3, b3, c3, d3, -150, 150, 100);
  s3.stroke = [255, 0, 0];
  roots3 = cubicRoots(a3, b3, c3, d3);
}

function draw() {
  background(0);
  strokeWeight(1);
  stroke(255);
  line(0, height / 2, width, height/ 2);
  line(width/2, 0, width / 2, height);
  
  s1.draw();
  strokeWeight(10);
  stroke(128, 128, 255);
  for (let  i = 0; i < roots1.length; i++) {
    let x = roots1[i];
    let y = a1 * x * x * x + b1 * x * x + c1 * x + d1;
    drawPoint(createVector(x, y));
  }
    
  s2.draw();
  strokeWeight(10);
  stroke(128, 255, 128);
  for (let  i = 0; i < roots2.length; i++) {
    let x = roots2[i];
    let y = a2 * x * x * x + b2 * x * x + c2 * x + d2;
    drawPoint(createVector(x, y));
  }
  
  s3.draw();
  strokeWeight(10);
  stroke(255, 128, 128);
  for (let  i = 0; i < roots3.length; i++) {
    let x = roots3[i];
    let y = a3 * x * x * x + b3 * x * x + c3 * x + d3;
    drawPoint(createVector(x, y));
  }
  
  noLoop();
}
