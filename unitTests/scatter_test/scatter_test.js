let s;
let s2;
let pts;
let pts2;
let pts3;
let pts4;


function setup() {
  createCanvas(200, 200);
  s = new SPolygon(50, 10);
  s.scale.mult(1.2);
  s.position.add(20, 20);
  s.isPolygonal = false;
  pts = scatter(s, 10, contour = true);
  pts2 = scatter(s, 10, contour = false);
  
  s2 = new SPolygon(50, 10);
  s2.scale.mult(0.5);
  s2.position.add(-50, -50);
  s2.isPolygonal = true;
  pts3 = scatter(s2, 10, contour = true);
  pts4 = scatter(s2, 10, contour = false);
}

function draw() {
  background(0);
  strokeWeight(1);
  s.draw();
  s2.draw();

  stroke(255, 0 ,0);
  strokeWeight(5);
  for (let i = 0; i < pts.length; i++) {
    pPoint(pts[i]);
  }
  
  stroke(0, 255, 0);
  strokeWeight(5);
  for (let i = 0; i < pts2.length; i++) {
    pPoint(pts2[i]);
  }

  stroke(255, 0 ,0);
  strokeWeight(5);
  for (let i = 0; i < pts3.length; i++) {
    pPoint(pts3[i]);
  }
  
  stroke(0, 255, 0);
  strokeWeight(5);
  for (let i = 0; i < pts4.length; i++) {
    pPoint(pts4[i]);
  }
  noLoop();
}
