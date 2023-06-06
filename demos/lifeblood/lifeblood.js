const backgroundClr = '000';
const particlesClr1 = ['60D394'];
const particlesClr2 = ['AAF683', 'FFD97D'];
const particlesOpacity = 255;
const randomParticleColor = []; // if not empty, particles will randomly select a color
                                // from this array instead of the color assigned to their direction
const particleWeight = 2; // if 0 or less, will use the cell size
const trail = false; // If true, particles will leave a trail which never disappears
const shootingStar = true; // If true, particles will leave a short trail which will disappear over time
const fadeSpeed = 0.2; // Value in [0, 1] which defines how fast the trail fades
const clearUpPeriod = 0; // if strictly larger than 0, every period, the fade speed will reach 1 to clear up the sky
const addBorder = true; // adds a black border
const borderClr = '000';
const borderThickness = 100;
const fadeRadius = 0; // if > 0, colors will fade as they go away from center
const squareFade = true; // if true, will fade in a square fashion

const addNoise = false; // whther to modulate the particles velocity with some noise
const useCurl = true; // if true, curl noise rather than a noise vector oriented
                      // along the noise field is used
const distortNoise = false; // whther to distort the noise
const distortionAmount = 0.5; // How much distortion is wanted
const noiseAmount = 0.5; // Amount, in the [0, 1] range to modulate the velocity by
const noiseFreq = 0.01; // Frequency of the noise

const gridResolution = 100; // amount of grid cells along height and width
const particleDensity = 0.375; // number of particles as a fraction of the number of cells

const speed = 3; // movement speed of the particles as an inte

const dirRatio = 0.5; // proportion of particles going along the first direction
const dir1 = 0; // directions along which particles move as an angle in degrees
const dir2 = 90;

const drawGridOverlay = false; // draw a grid on top of the canvas
const gridOverlayThickness = 100;
const gridOverlayCellNum = 4;  // number of lines in the grid overlay
const gridOverlayRandomAmount = 0; // Value describing how much larger a cell can randomly be.
                                   // If 0, will use set sizes instead
const gridOverlaySizes = [2, 2, 4, 2]; // fixed cell sizes
const verticalOnly = false; // Only draws vertical lines
const horizontalOnly = true; // only draws horizontal lines

const record = false; // if true, records the animation

let grid = []
let cellX;
let cellY;
let cellW;

function setup() {
  createCanvas(1440, 1440);
  background(colorFromHex(backgroundClr));
  setSeed();

  // compute amount of particles
  let particlesNum = gridResolution * gridResolution * particleDensity;

  // init the grid
  for (let i = 0; i < gridResolution * gridResolution; i++) {
    grid.push([]);
  }

  // compute cell width and height
  cellX = width / gridResolution;
  cellY = height / gridResolution;

  // scatter particles
  let j = 0;
  for (let i = 0; i < particlesNum; i++) {
    let pos = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
    while (!checkIfCellEmpty(pos, -1)) {
      pos = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
    }
    let p = createParticle(pos.x, pos.y);
    if (particleWeight > 0) {
      p.radius = particleWeight;
    }
    else {
      p.radius = cellX / 2;
    }

    // choose direction randomly and set color accordingly
    if (random() <= dirRatio) {
      p.velocity = p5.Vector.fromAngle(radians(dir1)).mult(speed);
      p.color = colorFromHex(particlesClr1[Math.floor(random(0, particlesClr1.length))], particlesOpacity);
    }
    else {
      p.velocity = p5.Vector.fromAngle(radians(dir2)).mult(speed);
      p.color = colorFromHex(particlesClr2[Math.floor(random(0, particlesClr2.length))], particlesOpacity);
    }

    if (randomParticleColor.length > 0) {
      p.color = colorFromHex(randomParticleColor[Math.floor(random(0, randomParticleColor.length))], particlesOpacity);
    }

    // register cell
    registerCell(p, i, true);
  }


  if (drawGridOverlay) {
    cellW = [];
    let tot = 0;
    // generate random size
    for (let i = 0; i < gridOverlayCellNum; i++) {
      if (gridOverlayRandomAmount > 0) {
        cellW.push(random(1, 1 + gridOverlayRandomAmount));
      }
      else {
        cellW.push(gridOverlaySizes[i]);
      }
      tot += cellW[i];
    }

    // normalize to canvas size
    for (let i = 0; i < gridOverlayCellNum; i++) {
      cellW[i] *= width / tot;
    }
  }

  if (record) {
    recordAnimation();
  }
}

// draw function which is automatically
// called in a loop
function draw() {
  if (!trail) {
    let opacity = 255;
    if (shootingStar) {
      opacity = fadeSpeed * 255;
      if (clearUpPeriod > 0) {
        opacity = lerp(1, fadeSpeed, Math.abs(Math.sin(frameCount / clearUpPeriod * Math.PI))) * 255;
      }
    }
    background(colorFromHex(backgroundClr, opacity));
  }

  // move all particles from one direction
  for (let  i = 0; i < getParticlesNum(); i++) {
    // retrieve i-th  particle
    let p = getParticle(i);

    // store current position as the previous position
    p.previousPosition = p.position();

    if (addNoise) {
      let n;
      function distorted(x, y) {
        return distortedNoise(perlin, distortionAmount, x, y)
      }
      let noiseType = perlin;
      if (distortNoise) {
        noiseType = distorted;
      }
      if (useCurl) {
        n = curlNoise2D(noiseType, 0.01, p.x * noiseFreq, p.y * noiseFreq);
      }
      else {
        n = noiseVector(noiseType, 0.01, p.x * noiseFreq, p.y * noiseFreq);
      }
      p.velocity = lerpVector(p.velocity, n, noiseAmount);
    }

    // to simplify the problem we only check the arrival position to see if we can move
    let new_pos = p.position().add(p.velocity);
    let wrap = false
    // wrap around borders
    if (Math.abs(new_pos.x) >= width / 2) {
      new_pos.x = -Math.sign(new_pos.x) * (width / 2 - 1);
      wrap = true;
    }
    if (Math.abs(new_pos.y) >= height / 2) {
      new_pos.y = -Math.sign(new_pos.y) * (height / 2 - 1);
      wrap = true;
    }

    if (checkIfCellEmpty(new_pos, i)) {
      // deregister previous cell
      registerCell(p, i, false);

      // move particle
      p.x = new_pos.x;
      p.y = new_pos.y;

      // register new cell
      registerCell(p, i, true);
    }

    // fade if required
    if (fadeRadius > 0) {
      let t;
      if (squareFade) {
        t = Math.max(Math.min(1, Math.abs(p.x) / fadeRadius),
          Math.min(1, Math.abs(p.y) / fadeRadius));
      }
      else {
        t = Math.min(1, p.position().mag() / fadeRadius);
      }
      p.color[3] = lerp(particlesOpacity, 0, t);
    }

    // if the particle hasn't wrapped around, draw the trail
    // from previous position
    // else simply draw the particle
    if (trail && !wrap) {
      p.drawLastMove();
    }
    else {
      p.draw();
    }
  }

  if (addBorder) {
    border(borderThickness, colorFromHex(borderClr));
  }

  // draw the collision grid
  if (drawGridOverlay) {
    strokeWeight(gridOverlayThickness);
    let w = 0;
    for (let i = 0; i < gridOverlayCellNum - 1; i++) {
      w += cellW[i];
      if (!verticalOnly) {
        line(0, w, width, w);
      }
      if (!horizontalOnly) {
        line(w, 0, w, height);
      }
    }
  }
}


function getCell(pos) {
  let x = Math.floor((pos.x + width / 2) / cellX);
  let y = Math.floor((pos.y + height / 2) / cellY);

  return x * gridResolution + y;
}

function registerCell(pos, idx, register=true) {
  let cell = getCell(pos);

  if (register) {
    grid[cell].push(idx);
  }
  else {
    let k = grid[cell].indexOf(idx);
    grid[cell].splice(k, 1);
  }
}

function checkIfCellEmpty(pos, idx) {
  let cell = getCell(pos);

  if (cell >= grid.length || cell < 0) {
    print(cell, pos, idx)
  }

  // cell is considered empty if this particle is already in
  // it or the cell is truely empty
  return (grid[cell].length <= 0 || grid[cell].indexOf(idx) >= 0);
}