const noiseAmplitude = 5;
const resolution = 24;
const noiseFreq = 1;
const margin = 150;
const maxRadius = 300;
const outterNoise = 200;
let angleMultiplier = 180;
const modulateAmplitude = false;
const circleConstrain = true;
const boxConstrain = false;

let circleShape;

function setup() {
  createCanvas(1000, 1000);
  background(0);
  circleShape = new Fresco.Circle(100, resolution);
  circleShape.color = [255, 255, 255, 128];
  angleMultiplier = radians(angleMultiplier);
}

function draw() {
  circleShape.draw(false, true);
  step();
}

function step() {
  let nrm = circleShape.computeNormals();
  for (let i = 0; i < circleShape.vertices.length; i++) {
    // get noise at vertex
    let n = normalizedPerlin(
      (width / 2 + circleShape.vertices[i].x) * noiseFreq,
      (height / 2 + circleShape.vertices[i].y) * noiseFreq);

    // get cone angle
    let angle = n * angleMultiplier * 2 - angleMultiplier;

    // rotate normal by angle
    let dir = nrm[i].copy().rotate(angle);
    
    // if the angle with the vector from center to point
    // is larger than 90deg, this means the point would go towards
    // the inside of the circle which we don't want. Hence we clamp it
    // to the orthogonal direction
    let alpha = Math.acos(circleShape.vertices[i].copy().normalize().dot(dir));
    if (Math.abs(alpha) > PI / 2) {
      // this is plain wrong because the cosine is symetric but overall the artifacts 
      // are actually nice looking so not worth solving
      dir = circleShape.vertices[i].copy().normalize().rotate(PI / 2 * Math.sign(alpha));
    }
    
    // scale the displacement
    let amplitude;
    if (modulateAmplitude) {
     amplitude = n * noiseAmplitude;
    }
    else {
      amplitude = noiseAmplitude;
    }
    let vel = dir.mult(amplitude);

    // apply displacement
    circleShape.vertices[i].add(vel);

    if (circleConstrain) {
      // constrain inside noisy circle
      let inter = circleShape.vertices[i].copy().normalize().mult(maxRadius);
      let rad = maxRadius + normalizedPerlin(noiseFreq * inter.x, noiseFreq * inter.y) * outterNoise;
      if (circleShape.vertices[i].mag() > rad) {
        circleShape.vertices[i].normalize().mult(rad);
      }
    }
    else if (boxConstrain) {
      circleShape.vertices[i].x = constrain(circleShape.vertices[i].x,
                                            -width / 2 + margin, width / 2 - margin)
      circleShape.vertices[i].y = constrain(circleShape.vertices[i].y,
                                            -height / 2 + margin, height / 2 - margin)
    }
  }
}
