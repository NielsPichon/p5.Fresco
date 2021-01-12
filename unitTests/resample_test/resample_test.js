let s;
let s0;
let s2;
let s3;

let approx = false;

function setup() {
  createCanvas(200, 200);
  s = new SPolygon(50, 5);
  for (let i = 0; i < s.vertices.length; i++) {
    s.vertices[i].color = [255, 0, 0, 255];
  }
  
  s2 = s.copy();
  s2.position.add(-50, -50);
  s2.isPolygonal = false;
  
  s.position.add(50, 50);
  
  s0 = s.copy();
  
  
  vtx = [new Point(createVector(10 , 0))];
  append(vtx, new Point(createVector(-10 , 30)));
  append(vtx, new Point(createVector(20 , 60)));
  append(vtx, new Point(createVector(-40 , 40)));
  append(vtx, new Point(createVector(-40 , 10)));
  append(vtx, new Point(createVector(10 , 0)));
  
  s3 = new Shape(vtx);
  s3.isPolygonal = true;
  
  for (let i = 0; i < s3.vertices.length; i++) {
    s3.vertices[i].color = [255, 0, 0, 255];
  }
}

function draw() {
  background(0);
  strokeWeight(1);
  s0.draw();
  
  s.draw();
  s.drawPoints();

  s2.draw();
  s2.drawPoints();
  
  s3.draw();
  s3.drawPoints();
}


function mouseClicked() {
  s = resample(s, s.vertices.length + 1);
  s2 = resample(s2, s2.vertices.length + 1);
  s3 = resample(s3, 0);
}
