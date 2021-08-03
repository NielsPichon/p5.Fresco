const backgroundClr = '888';

let s = [];

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();

  s.push(new Fresco.Square(300));
  s.push(new Fresco.Square(100));


  print(s);
  s[1].position = createVector(50, 50);
}

// draw function which is automatically 
// called in a loop
function draw() {
  s[0].draw();
  s[1].draw();

  noLoop();

  shapesToFile(s, 'test.json');
}