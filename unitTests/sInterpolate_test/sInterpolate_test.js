s = [];
s2 = [];

let  t = 0;

function setup() {
  createCanvas(400, 400);
  s = new Scatter.Square();
  s2 = s.copy();
  s2.scale.mult(1.2);
  s2.position.add(10, 10);
  s2.rotation = PI/4;
  s2.stroke = [255, 0, 0, 255];
  s2.isPolygonal = false;
}

function draw() {
  t += 1;
  if (t > 100) t = 100;

  background(0);
  s.draw();
  s2.draw();
  let s3 = sInterpolate(s, s2, (t / 100) * (t / 100), false);
  s3.color = [0, 255, 0, 255];
  s3.draw();
  
  let s4 = sInterpolate(s, s2, 1 - (t / 100) * (t / 100), true);
  s4.color = [0, 0, 255, 255];
  s4.draw();
}