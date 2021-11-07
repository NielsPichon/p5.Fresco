const noiseAmplitude = 3;
const resolution = 24;
const noiseFreq = 0.001;
const angleMultipler = 10;

let c;

function setup() {
  createCanvas(1000, 1000);
  background(0);
  c = new Fresco.Circle(100, resolution);
  c.color = [255, 255, 255, 128];
}

function draw() {
  c.draw(false, true);
  step();
}

function step() {
  for (let i = 0; i < c.vertices.length; i++) {
    let angle = normalizedPerlin(
      c.vertices[i].x * noiseFreq,
      c.vertices[i].y * noiseFreq) * angleMultipler * PI;
    let vel = p5.Vector.fromAngle(angle, noiseAmplitude);
    c.vertices[i].add(vel);
  }
}
