const backgroundClr = '000';

let pt;
let s;
let s2;
let proj;
let proj2


function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  s = new Fresco.Circle(100, 24);
  s2 = new Fresco.Polygon(200, 10);
  pt = createPoint(0, 0);

  let [projection, closest_edge_idx, percentage, closest_dist] = s.projectOnShape(pt);
  proj = new Fresco.Point(projection);
  let[projection2, closest_edge_idx2, percentage2, closest_dist2] = s2.projectOnShape(pt);
  proj2 = new Fresco.Point(projection);

  proj.radius = 10;
  proj2.radius = 10;
  pt.radius = 10;
  proj.color = colorFromHex('f00');
  proj2.color = colorFromHex('f00');
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));

  s.draw();
  s2.draw();
  if (Math.abs(mouseX) < width && Math.abs(mouseY) < height) {
    pt.x = mouseX - width / 2;
    pt.y = -mouseY + height / 2;

    let [projection, closest_edge_idx, percentage, closest_dist] = s.projectOnShape(pt);
    proj.setPosition(projection);
    let[projection2, closest_edge_idx2, percentage2, closest_dist2] = s2.projectOnShape(pt);
    proj2.setPosition(projection2);
  }

  pt.draw();
  proj.draw();
  proj2.draw();
}