let s;
let s1;
let s2;

function setup() {
  createCanvas(200, 200);
  s = new sPolygon(resolution=10);
  s.scale.mult(0.5);
  
  s1 = s.copy();
  s2 = s.copy();
  
  s1.isPolygonal = false;
  s2.isPolygonal = false;
  
  s.position.add(15,15);
  s1.position.add(-50, 50);
  s2.position.add(-50, -50);
}

function draw() {
  background(0);
  strokeWeight(1);
  
  for (let  i = -100; i < 100; i++) {
   for (let j = -100; j < 100; j++) {
     if(isInside(createVector(i, j), s) ||
       isInside(createVector(i, j), s1, false) ||
       isInside(createVector(i, j), s2, true)) {
       stroke(0, 255, 0);
     }
     else {
       stroke(255, 0, 0);
     }
     PPoint(createVector(i, j));
   }
  }

  s.draw();
  s1.draw();
  s2.draw();

  noLoop();
}
