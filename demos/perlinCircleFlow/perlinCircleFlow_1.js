const noiseAmplitude = 3;
const resolution = 24;
const noiseFreq = 0.001;
const angleMultipler = 10;

let c;

function setup() {
  createCanvas(1000, 1000);
  background(0);
  c = new sCircle(resolution, 100);
  c.color = [255, 255, 255, 128];
}

function draw() {
  c.draw();
  step();
}

function step() {
  for (let i = 0; i < c.vertices.length; i++) {
    let angle = remappedNoise(
      c.vertices[i].x * noiseFreq,
      c.vertices[i].y * noiseFreq) * angleMultipler * PI;
    let vel = p5.Vector.fromAngle(angle, noiseAmplitude);
    c.vertices[i].add(vel);
  }
}


function remappedNoise(x, y) {
  let n = noise(x, y);
  return map(n, (-1 + sqrt(2)) / (2 * sqrt(2)), (1 + sqrt(2)) / (2 * sqrt(2)), 0, 1);
}

function keyPressed() {
  if (key == 'p' || key == ' ') {
    if (isLooping()) {
      noLoop();
    }
    else { 
      loop();
    }
  }
  if (key == 's') {
    saveCanvas('canvas', 'png');
  }
}

