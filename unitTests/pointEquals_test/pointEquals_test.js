function setup() {
  createCanvas(400, 400);
  let p = createPoint(0, 0);
  let p2 = p.copy();
  print(p.equals(p2));
  p2.add(createVector(0, 1));
  print(p.equals(p2))
}

function draw() {
  background(0);
  
  noLoop();
}