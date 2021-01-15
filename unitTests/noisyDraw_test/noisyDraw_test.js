let num_points = 1000;
let point_diffusivity = 8;

let line_diffusivity = 5;
let num_lines = 5;

let s;
let s1;

function setup() {
  createCanvas(500, 500);

  s = new Cardioid.Circle(200, 24);
  s1 = s.copy();
  s1.scale.mult(0.5);
}

function draw() {
  background(0);
  s1.drawScattered(num_points, point_diffusivity);
  s.drawNoisy(num_lines, line_diffusivity);
  noLoop();
}
