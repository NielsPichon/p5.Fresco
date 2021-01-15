const minRadius = 30;
const scaleIncrement = 0.1;
const numberOfSides = 3;
const angleIncrement = 2 * Math.PI * 0.005;
const backgroundClr = '04080f';
const shapeColor = '507dbc';
const shapeThickness = 2;
const shapeOutlineColor = 'd81159';
const shapeOutlineThickness = 0.2;

let s;
let s1;
let s2;
let normalizedVerticesDirection = []

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  background(colorFromHex(backgroundClr));

  s = new Scatter.Polygon(minRadius, numberOfSides);
  s.color = colorFromHex(shapeColor);
  s.strokeWeight = shapeThickness;
  s.isPolygonal = false;

  s1 = s.copy();
  s1.strokeWeight = shapeOutlineThickness;
  s1.color = colorFromHex(shapeOutlineColor);
  s2 = s1.copy();
  
  for (let i = 0; i < s.vertices.length; i++) {
    normalizedVerticesDirection.push(s.vertices[i].copy().normalize());
  }
}

function draw() {
  s.draw();
  s1.draw();
  s2.draw();

  // Increment the scale and rotation
  s.scale.add(createVector(scaleIncrement, scaleIncrement));
  s.rotation += angleIncrement;
  s1.scale = s.scale.copy();
  s2.scale = s.scale.copy();
  s1.rotation = s.rotation;
  s2.rotation = s.rotation;

  // Offset the 2 shape copies so that in world coordinate it is offset by half the outline thickness
  let offset;
  for (let i = 0; i < s1.vertices.length; i++) {
    offset = normalizedVerticesDirection[i].copy().mult((0.5 * (shapeOutlineThickness + shapeThickness)) / s1.scale.x);
    s1.vertices[i] = s.vertices[i].copy().add(offset.copy());
    s2.vertices[i] = s.vertices[i].copy().sub(offset.copy());
  }
}
