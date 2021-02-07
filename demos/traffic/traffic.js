const backgroundClr = '000';
const particlesClr = 'fff';
const particleWeight = -2;

const gridResolution = 50; // amount of grid cells along height and width
const particlesNum = 1000; // number of particles

const speed = 1; // movement speed of the particles as an inte

const dirRatio = 0.5; // proportion of particles going along the first direction
const dir1 = [0, 1]; // directions along which particles move
const dir2 = [1, 0];

const drawGrid = false; // debug functionality which draws the underlying grid


let grid = []
let cellX;
let cellY;

function setup() {
  createCanvas(1440, 1440);
  setSeed();

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
    p.color = colorFromHex(particlesClr);
    if (particleWeight > 0) {
      p.radius = particleWeight;
    }
    else {
      p.radius = cellX / 2;
    }

    // choose direction randomly
    if (random() <= dirRatio) {
      p.velocity = createVector(dir1[0] * speed, dir1[1] * speed);
    }
    else {
      p.velocity = createVector(dir2[0] * speed, dir2[1] * speed);
    }
    // register cell
    registerCell(p, i, true);
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));

  // draw the collision grid
  if (drawGrid) {
    for (let i = 0; i < gridResolution; i++) {
      strokeWeight(0.5);
      line(0, i * cellY, width, i * cellY);
      line(i * cellX, 0, i * cellX, height);
    }
  }

  // move all particles from one direction 
  for (let  i = 0; i < getParticlesNum(); i++) {
    // retrieve i-th  particle
    let p = getParticle(i);

    // to simplify the problem we only check the arrival position to see if we can move
    let new_pos = p.position().add(p.velocity);

    // wrap around borders
    if (Math.abs(new_pos.x) >= width / 2) {
      new_pos.x = -Math.sign(new_pos.x) * (width / 2 - 1);
    }
    if (Math.abs(new_pos.y) >= height / 2) {
      new_pos.y = -Math.sign(new_pos.y) * (height / 2 - 1);
    }

    if (checkIfCellEmpty(new_pos, i)) {
      // store current position as the previous position
      p.previousPosition = p.position();

      // deregister previous cell
      registerCell(p, i, false);

      // move particle
      p.x = new_pos.x;
      p.y = new_pos.y;

      // register new cell
      registerCell(p, i, true);
    }

    p.draw();
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