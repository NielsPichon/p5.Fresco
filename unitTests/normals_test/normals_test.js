s = [];
s2 = [];
let nrm;
let nrm2;

function setup() {
  createCanvas(400, 400);
  s = new Scatter.Polygon(50, 8);
  s2 = s.copy();
  s2.scale.mult(createVector(1.2, 2));
  s2.position.add(50, 50);
  s2.rotation = Math.PI / 3;
  s2.stroke = [255, 0, 0, 255];
  s2.isPolygonal = false;
  s.position.add(createVector(-60,-60));
  
  print(windingNumber(createVector(0,0), s.vertices));
  
  nrm = s.normals();
  nrm2 = s2.normals();
}

function draw() {
  background(0);
  s.draw();
  s2.draw();
  
  stroke(0, 255, 0);
  strokeWeight(1);
  let n;
  for (let i = 0; i < nrm.length; i++) {
    n = drawNormal(nrm[i], s.vertices[i], s);
    drawLine(s.applyTransform(s.vertices[i]), n);
  }
  
  for (let i = 0; i < nrm2.length; i++) {
    n = drawNormal(nrm2[i], s2.vertices[i], s2);
    drawLine(s2.applyTransform(s2.vertices[i]), n);
  }
  
  noLoop();
}
