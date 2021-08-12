const backgroundClr = '000';

let s1;
let s2;
let s3;
let s4;

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  s1 = new Fresco.Circle(200, 6);
  s1.position = createPoint(0, 50);
  s1.isPolygonal = true;
  s1.setColor([0, 0, 255]);
  s2 = new Fresco.Circle(200, 6);
  s2.position = createPoint(0, -50);
  s2.isPolygonal = true;

  s2.vertices.splice(2, 0, createPoint(0, 300));

  s4 = s1.subtract(s2);
  s1.freezeTransform()
  s3 = s1.getIntersectionsPoints(s2);
}

// draw function which is automatically 
// called in a loop
function draw() {
  s1.draw();
  s2.draw();

  s3.forEach(inter => {
    let s = inter.point;
    s.radius = 10;
    s.setColor([255, 0, 0]);
    s.draw();
  })

  print(s4.length)

  s4.forEach(s => {
    s.radius = 10;
    s.setColor([255, 0, 0]);
    s.draw();
  })

  noLoop();
}