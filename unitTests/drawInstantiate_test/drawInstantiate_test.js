let s;
let offset;
let rot = [];
let clr = [];
let lineWeight = [];
const numShapes = 10;
const globalScale = 0.5;

let scale;

function setup() {
  createCanvas(1000, 1000);
  s = new Fresco.Square(40);

  offset = width / (numShapes + 1);

  for (let i = 0; i < numShapes; i++) {
    for (let j = 0; j < numShapes; j++) {
      rot.push(random(0, 2 * Math.PI));
      clr.push([random(0, 255), random(0, 255), random(0, 255), 255]);
      lineWeight.push(random(1, 3));
    }
  }

  scale = createVector(globalScale, globalScale);
}

function draw() {
  background(0);
  
  let pos = createVector(-width / 2, -height / 2);
  let idx = 0;
  for (let i = 0; i < numShapes; i++) {
    pos.y += offset;
    pos.x  = -width / 2;
    for (let j = 0; j < numShapes; j++) {

      pos.x += offset;
      s.drawInstantiate(false, pos, scale, rot[idx], clr[idx], null, lineWeight[idx]);
      rot[idx] += 0.01;
      idx ++;
    }
  }
}
