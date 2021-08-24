const backgroundClr = '888';

let s = [];

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts()

  s.push(new Fresco.Circle(300, 3));
  // s.push(new Fresco.Square(100));
  s[0].isPolygonal = true;
  s[0].rotation = - Math.PI / 2;

  // print(s);
  // s[1].position = createVector(50, 50);
}

// draw function which is automatically 
// called in a loop
function draw() {
  s[0].draw();
  // s[1].draw();

  text = Fresco.Futural.drawText('This way up!', 12, createVector(0, -300), true)
  s.concat(text);

  jsonExportCallback = () => {
    return s;
  }

  noLoop();

  // shapesToFile(s.concat(text), 'test.json');
}