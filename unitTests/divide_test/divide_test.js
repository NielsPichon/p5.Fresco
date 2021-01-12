let s;

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
}

function draw() {
  background(0);
  strokeWeight(1);
  s.draw();
  s2.draw();
  
  s.drawPoints();
  s2.drawPoints();
}


function mouseClicked() {
  s = divide(s, 1);
  s2 = divide(s2, 1, approx=approx);
}