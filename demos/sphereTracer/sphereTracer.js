const backgroundClr = '000';
const noiseFreq = 0.01;
const sphereRadius = 0.3;
const particleNum = 1000;
const noiseAmplitude = 10;
const addRotation = false;
const rotationSpeed = 0.00001;
const scatterStart = false;
const symmetry = true;
const trail = false;
const noiseTransform = 'vector';
let noiseType = ridgedNoise;

let radius;

function setup() {
  createCanvas(1440, 1440);
  background(colorFromHex(backgroundClr));
  setSeed(7812);

  radius = width * sphereRadius;

  // Create particles
  for (let i = 0; i < particleNum; i++) {
    if (scatterStart) {
      // Random point in box of side 2 * radius
      let x = random(-radius, radius);
      let y = random(-radius, radius);
      let z = random(-radius, radius);
      let p = createVector(x, y, z);
      // Project point on sphere
      p.normalize().mult(radius);
      // Create particle at point
      createParticle(p.x, p.y, p.z);

    } 
    else {
      let theta = i * 2 * Math.PI / particleNum - PI / 2;
      createParticle(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
    }
    getParticle(i).leaveTrail = trail;
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  if (frameCount > 1) {
    // Draw particles
    for (let i = 0; i < getParticlesNum(); i++) {
      if (trail) {
        getParticle(i).drawLastMove();
      } 
      else {
        getParticle(i).draw();
      }
    }
  }

  let theta = frameCount * rotationSpeed;

  // Move particles
  for (let i = 0; i < getParticlesNum(); i++) {
    // Retrieve i-th particle
    let p = getParticle(i);
    // Get 2D noise vector
    let x = p.x;
    let y = p.y;
    let z = p.z; 

    if (!symmetry) {
      x += width / 2;
      y += height / 2;
      z += radius;
    }
    let n;
    if (noiseTransform == 'vector') {
      n = noiseVector(noiseType, x * noiseFreq, y * noiseFreq, p.z * noiseFreq);
    }
    else {
      n = curlNoise2D(noiseType, 0.1, x * noiseFreq, y * noiseFreq, p.z * noiseFreq);
    }
    n.mult(noiseAmplitude);
    // Project displacement onto the sphere
    let radialDir = p.position().normalize();
    let xSphere = createVector(radialDir.z, 0, -radialDir.x).normalize();
    if (xSphere.magSq() == 0) {
      xSphere = Math.sign(radialDir.y) * createVector(0, 0, -1);
    }

    let ySphere = radialDir.cross(xSphere);

    if (radialDir.x < 0) {
      ySphere.mult(-1);
    }

    // Displace particle
    p.add(xSphere.mult(n.x)).add(ySphere.mult(n.y));
    // p.add(ySphere.mult(1));

    //Project on sphere 
    p.setPosition(p.position().normalize().mult(radius));

    if (addRotation) {
      p.setPosition(createPoint(p.x * Math.cos(theta) + p.y * Math.sin(theta), -p.x * Math.sin(theta) + p.y * Math.cos(theta), p.z));
    }
    // Register particle position in trail
    if (trail) {
      p.addCurrentPositionToTrail();
    }
  }
}