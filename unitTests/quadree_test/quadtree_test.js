const backgroundClr = '000';

let tree;

let circle;
let dot;
let circleSpeed;
let dotSpeed;

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();

  tree = new Fresco.Quadtree(5, createVector(-width / 2, -height / 2), createVector(width, height));

  circle = new Fresco.Circle(50);
  circle.position = createPoint(random() * width - width / 2, random() * height / 2);

  dot = createPoint(random() * width - width / 2, random() * height / 2);
  dot.radius = 5;

  tree.registerShape(circle);
  tree.register(dot);

  circleSpeed = p5.Vector.fromAngle(3 * Math.PI / 4).mult(5);
  dotSpeed = p5.Vector.fromAngle(Math.PI / 4).mult(5);
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  circle.draw();
  dot.draw();
  tree.draw();
  update();
}


function update() {
  tree.unregisterShape(circle);
  circle.position.add(circleSpeed);

  if (Math.abs(circle.position.x) > width / 2) {
    if (circle.position.x > 0) {
      circle.position.x = width - circle.position.x;
    }
    else {
      circle.position.x = -width - circle.position.x;
    }
    circleSpeed.x *= -1;
  }

  if (Math.abs(circle.position.y) > height / 2) {
    if (circle.position.y > 0) {
      circle.position.y = height - circle.position.y;
    }
    else {
      circle.position.y = -height - circle.position.y;
    }
    circleSpeed.y *= -1;
  }

  tree.registerShape(circle);

  tree.unregister(dot);
  dot.add(dotSpeed);

  if (Math.abs(dot.x) > width / 2) {
    if (dot.x > 0) {
      dot.x = width - dot.x;
    }
    else {
      dot.x = -width - dot.x;
    }
    dotSpeed.x *= -1;
  }

  if (Math.abs(dot.y) > height / 2) {
    if (dot.y > 0) {
      dot.y = height - dot.y;
    }
    else {
      dot.y = -height - dot.y;
    }
    dotSpeed.y *= -1;
  }

  tree.register(dot);

}