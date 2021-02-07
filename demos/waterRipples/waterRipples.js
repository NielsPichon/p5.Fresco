const backgroundClr = 'ffd166';
const lineClr = 'fff';
const lineAlpha = 0;
const fillClr1 = 'ef476f';
const fillAlpha1 = 128;
const fillClr2 = '118ab2';
const fillAlpha2 = 128;
const numPoints = 100;
const initRadius = 500;
const speed = 1;
const margin = 200;
const randomInitVelocity = true;
const initRandomAmount = 1;
const noisyPaths = true;
const noiseFreq = 1;
const noiseAmplitude = 0.001;
const refreshAlways = true;


let shapes = []

function setup() {
  createCanvas(1440, 1440);
  setSeed();
  background(colorFromHex(backgroundClr));


  // initialize shape
  let s = new Fresco.Circle(initRadius, numPoints)
  s.color = colorFromHex(lineClr, lineAlpha);
  s.noFill = false;
  s.fillColor = colorFromHex(fillClr1, fillAlpha1);

  // set vertices initial velocity along circle normals
  for (let i = 0; i < s.vertices.length; i++) {
    let velocity = speed;
    if (randomInitVelocity) {
      velocity *= random(1 - initRandomAmount, 1);
    }
    s.vertices[i].velocity = s.vertices[i].copy().normalize().mult(velocity);
  }
  // make sure the shape remains closed
  s.vertices[s.vertices.length - 1].velocity = s.vertices[0].velocity.copy();


  // Split shape in half
  s1 = s.copy();

  // manually copy the velocities as they are native properties of the vertices
  for (let i = 0; i < s.vertices.length; i++) {
    s1.vertices[i].velocity = s.vertices[i].velocity.copy();
  }

  s.vertices.splice(0, Math.floor(s.vertices.length / 2));
  s1.vertices.splice(Math.floor(s1.vertices.length / 2) + 1, Math.floor(s1.vertices.length / 2));

  // set second half color
  s1.fillColor = colorFromHex(fillClr2, fillAlpha2);

  shapes.push(s);
  shapes.push(s1);
}

// draw function which is automatically 
// called in a loop
function draw() {
  if (refreshAlways) {
    background(colorFromHex(backgroundClr));
  }

  for (let k = 0; k < shapes.length; k++) {
    let s = shapes[k];

    // draw shape
    s.draw();

    for (let i = 0; i < s.vertices.length; i++) {
      // change velocity based on noise if relevant
      if (noisyPaths) {
        let amplitude = s.vertices[i].velocity.mag();

        // keep only the velocity direction
        s.vertices[i].velocity.normalize();

        // linear interpolation between noise field and velocity direction
        let n =  noiseVector(ridgedNoise, s.vertices[i].x, s.vertices[i].y);
        s.vertices[i].velocity = lerpVector(s.vertices[i].velocity, n, noiseAmplitude);

        // make sure the velocity keeps its magnitude
        s.vertices[i].velocity.normalize().mult(amplitude);
      }

      // move particle
      s.vertices[i].add(s.vertices[i].velocity);

      // reflect on walls
      if (Math.abs(s.vertices[i].x) >= width / 2 - margin) {
        // move particle to the wall
        s.vertices[i].x = Math.sign(s.vertices[i].x) * (width / 2 - margin);
        // invert horizontal velocity
        s.vertices[i].velocity.x *= -1;
      }

      if (Math.abs(s.vertices[i].y) >= height / 2 - margin) {
        // move particel to the wall
        s.vertices[i].y = Math.sign(s.vertices[i].y) * (height / 2 - margin);
        // invert vertical velocity
        s.vertices[i].velocity.y *= -1;
      }
    }
  }
}