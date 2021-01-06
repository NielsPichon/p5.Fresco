s = [];
s2 = [];
copies = [];

function setup() {
  createCanvas(400, 400);
  s = new sSquare();
  s.scale.mult(1.2);
  s.rotation = 45;
  s2 = new sSquare();
  for (let i = 0; i < s.vertices.length; i++) {
    s.vertices[i].scale = createVector(0.1, 0.1);
  }

  copies = copyToPoints(s2, s.vertices);
}

function draw() {
  background(0);
  s.draw();

  for (let i = 0; i < copies.length; i++) {
    copies[i].draw();
  }
  
  noLoop();
}
