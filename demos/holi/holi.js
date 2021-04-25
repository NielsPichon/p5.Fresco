const backgroundClr = '000';
const gridResolution = 150; // number of cells in each direction. WARNING! SLOW!
const noiseFreq = 0.1; // frequency of the noise when initialising with some noise
const numCompounds = 10; // number of compounds == colors
const diffusionSpeed = [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]; // how fast each color diffuses
const evaporationSpeed = [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02]; // how fast each colors disappears

const compoundClr = [
  'f72585', 'b5179e', '7209b7', '560bad', '480ca8', '3a0ca3', '3f37c9', '4361ee', '4895ef', '4cc9f0'
]; // color of each compound

// const compoundClr = [
//   '00296b', '003f88', '00509d', 'fdc500', '00296b', '003f88', '00509d', 'fdc500',  '00296b',  '003f88',
// ]; // color of each compound

// const compoundClr = [
//   '0a1128', '001f54', '034078', '1282a2', 'fefcfb','0a1128', '001f54', '034078', '1282a2', 'fefcfb',
// ]; // color of each compound

// const compoundClr = [
//   '390099', '9e0059', 'ff0054', 'ff5400', 'ffbd00', '390099', '9e0059', 'ff0054', 'ff5400', 'ffbd00'
// ]; // color of each compound

const fillAmount = 1; // how much compound the agents leave behind
const numAgents = 200; // number of agents
const randomActionProb = 0.5; // probability that an agent makes a random move
const emptyInit = true; // whether the scene should initially be empty or filled with noise
const allHaters = true; // whether all agents should hate another compound
const allLovers = false; // whether all agents should love another compound. Love is stronger than hate
const spawnInCircle = true; // whether agents should all spawn within a circle
const circleRadius = 10; // radius of the spawn circle
const angle = Math.PI / 2; // angle at which the agents look and turn
const cellSizeMult = 0.7; // display size of each cell
const screenRes = 1080; // resolution of the image in pixels

const record = true;

let cells = [];
let clrs = []; // colors converted to rgb
let agents = [];
let gridStepSize = 0; //size of a cell in pixels

class Agent {
  constructor(gridPos, compoundIdx, attractionIdx, lover) {
    this.position = gridPos;
    this.compoundIdx = compoundIdx;
    let theta = Math.floor(random(2 * Math.PI / angle)) * angle;
    this.orientation = [Math.cos(theta), Math.sin(theta)];
    this.attractionIdx = attractionIdx;
    this.lover = lover;
  }

  // better is a matter of whether the agent likes or hates the other compound
  better(a, b) {
    if (this.lover) {
      return a >= b;
    }
    else {
      return a < b;
    }
  }

  // when reaching one border, telport to the opposite border
  wraparound(a) {
    return (a + 3 * width / 2) % width - width / 2
  }

  move() {
    // look at the cell in front and those in diagonal ahead
    let left = [
      this.orientation[0] * Math.cos(angle) - this.orientation[1] * Math.sin(angle),
      this.orientation[0] * Math.sin(angle) + this.orientation[1] * Math.cos(angle)
    ];
    let center = [this.orientation[0], this.orientation[1]];
    let right = [
      this.orientation[0] * Math.cos(angle) + this.orientation[1] * Math.sin(angle),
      -this.orientation[0] * Math.sin(angle) + this.orientation[1] * Math.cos(angle)
    ];
    
    // offset to position
    let A = [center[0] * gridStepSize + this.position[0], center[1] * gridStepSize + this.position[1]];
    let B = [left[0] * gridStepSize + this.position[0], left[1] * gridStepSize + this.position[1]];
    let C = [right[0] * gridStepSize + this.position[0], right[1] * gridStepSize + this.position[1]];

    // wrap around
    A = [this.wraparound(A[0]), this.wraparound(A[1])];
    B = [this.wraparound(B[0]), this.wraparound(B[1])];
    C = [this.wraparound(C[0]), this.wraparound(C[1])];
    
    // get closest cell
    let Ac = [Math.floor((A[0] / width + 0.5) * gridResolution), Math.floor((A[1] / height + 0.5) * gridResolution)];
    let Bc = [Math.floor((B[0] / width + 0.5) * gridResolution), Math.floor((B[1] / height + 0.5) * gridResolution)];
    let Cc = [Math.floor((C[0] / width + 0.5) * gridResolution), Math.floor((C[1] / height + 0.5) * gridResolution)];

    let cellA = cells[Ac[0]][Ac[1]];
    let cellB = cells[Bc[0]][Bc[1]];
    let cellC = cells[Cc[0]][Cc[1]];

    // there's a chance to select a random action
    if (random() < randomActionProb) {
      let t = random();
      if (t < 1 / 3) {
        this.position = [A[0], A[1]];
      }
      else if (t < 2 / 3) {
        this.position = [B[0], B[1]];
        this.orientation = [left[0], left[1]];
      }
      else {
        this.position = [C[0], C[1]];
        this.orientation = [right[0], right[1]];
      }
    }
    else {
      // rank the compound amount in the 3 cells based on attraction type
      if (this.better(cellA.compounds[this.attractionIdx], cellB.compounds[this.attractionIdx])) {
        if (this.better(cellA.compounds[this.attractionIdx], cellC.compounds[this.attractionIdx])) {
          this.position = [A[0], A[1]];
        }
        else if (this.better(cellB.compounds[this.attractionIdx], cellC.compounds[this.attractionIdx])) {
          this.position = [B[0], B[1]];
          this.orientation = [left[0], left[1]];
        }
        else {
          this.position = [C[0], C[1]];
          this.orientation = [right[0], right[1]];
        }
      }
      else {
        if (this.better(cellB.compounds[this.attractionIdx], cellC.compounds[this.attractionIdx])) {
          this.position = [B[0], B[1]];
          this.orientation = [left[0], left[1]];
        }
        else {
          this.position = [C[0], C[1]];
          this.orientation = [right[0], right[1]];
        }
      }
    }
  }

  update() {
    // Leave some compound in the current cell
    let x = Math.floor((this.position[0] / width + 0.5) * gridResolution);
    let y = Math.floor((this.position[1] / height + 0.5) * gridResolution);
    cells[x][y].compounds[this.compoundIdx] += fillAmount;
    if (cells[x][y].compounds[this.compoundIdx] > 1) {
      cells[x][y].compounds[this.compoundIdx] = 1;
    }

    // move
    this.move();
  }
}


class Cell extends Fresco.Point {
  constructor(position, compounds) {
    super(position);
    this.compounds = compounds;
  }
}


function setup() {
  createCanvas(screenRes, screenRes);
  background(colorFromHex(backgroundClr));
  setSeed();

  gridStepSize = width / gridResolution
  cellsize = gridStepSize * cellSizeMult;

  // compute colors
  for (let k = 0; k < numCompounds; k++) {
    clrs.push(colorFromHex(compoundClr[k]));
  }

  // Init a grid of cells, with each there concentration for each compound.
  // The concentration decided from perlin noise
  for (let i = 0; i < gridResolution; i++) {
    let x = i * width / (gridResolution - 1) - width / 2;
    let row = []
    for (let j = 0; j < gridResolution; j++) {
      let y = j * height / (gridResolution - 1) - height / 2;
      
      let compounds = [];
      let tot = 0;
      if (!emptyInit) {
        for (let k = 0; k < numCompounds; k++) {
          compounds.push(normalizedPerlin(x * noiseFreq, y * noiseFreq, k));
          tot += compounds[k];
        }
        if (numCompounds > 1) {
          for (let k = 0; k < numCompounds; k++) {
            compounds[k] /= tot;
          }
        }
      }
      else {
        for (let k = 0; k < numCompounds; k++) {
          compounds.push(0);
        }
      }

      row.push(new Cell(createVector(x, y), compounds));
      row[row.length - 1].radius = cellsize;
    }
    cells.push(row);
  }

  // Create the agents
  for (let i = 0; i < numAgents; i++) {
    let pos = [
      Math.floor(random(gridResolution)) * width  / gridResolution - width / 2,
      Math.floor(random(gridResolution)) * height / gridResolution - height /2
    ]
    if (spawnInCircle) {
      let r = random() * circleRadius;
      let theta = random(2 * Math.PI);
      pos = [
        Math.floor(r * Math.cos(theta) + gridResolution / 2) * width / gridResolution - width / 2,
        Math.floor(r * Math.sin(theta) + gridResolution / 2) * height / gridResolution - height / 2,
      ]
    }
    agents.push(
      new Agent(
        pos,
        Math.floor(random(numCompounds)),
        Math.floor(random(numCompounds)),
        ((random() > 0.5) && !allHaters) || allLovers
      )
    )
  }
  
  if (record) {
    recordAnimation();
  }
}


// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  drawGrid();
  updateAgents();
  diffuse();

  // noLoop();
}


// display the cells
function drawGrid() {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      
      clr = [0, 0, 0, 0];
      for (let k = 0; k < numCompounds; k++) {
        for (let w = 0; w < 4; w++) {
          clr[w] += clrs[k][w] * cells[i][j].compounds[k];
          if (clr[w] > 255) {
            clr[w] = 255;
          }
        }
      }
      cells[i][j].color = clr;
      cells[i][j].draw()
    }
  }
}


// update all agents
function updateAgents() {
  for (let i = 0; i < agents.length; i++) {
    agents[i].update();
  }
}


// diffuse the compounds through the grid
function diffuse(){
  let buffer = [];

  // fill buffer
  for (let i = 0; i < gridResolution; i++) {
    let row = [];
    for (let j = 0; j < gridResolution; j++) {
      compounds = [];
      for (let k = 0; k < numCompounds; k++) {
        compounds[k] = cells[i][j].compounds[k];
      }
      row.push(compounds);
    }
    buffer.push(row);
  }  


  // for each cell, look at the right cell and bottom cell
  // and exchange compounds
  for (let i = 0; i < gridResolution; i++) {
    let row = [];
    for (let j = 0; j < gridResolution; j++) {
      for (let k = 0; k < numCompounds; k++) {
        if (i == 0) {
          buffer[i][j][k] -= cells[i][j].compounds[k] * diffusionSpeed[k];
        }

        if (j == 0 || j == gridResolution - 1) {
          buffer[i][j][k] -= cells[i][j].compounds[k] * diffusionSpeed[k];
        }
        else {
          diff = cells[i][j].compounds[k] - cells[i][j + 1].compounds[k];
          buffer[i][j][k] -= diff * diffusionSpeed[k];
          buffer[i][j + 1][k] += diff * diffusionSpeed[k];

          if (i < gridResolution - 1) {
            diff = cells[i][j].compounds[k] - cells[i + 1][j].compounds[k];
            buffer[i][j][k] -= diff * diffusionSpeed[k];
            buffer[i + 1][j][k] += diff * diffusionSpeed[k];
          }
          else {
            buffer[i][j][k] -= cells[i][j].compounds[k] * diffusionSpeed[k];
          }
        }
      }
    }
  }

  // store buffer
  for (let i = 0; i < gridResolution; i++) {
    for (let j = 0; j < gridResolution; j++) {
      for (let k = 0; k < numCompounds; k++) {
        cells[i][j].compounds[k] = min(
          max(buffer[i][j][k] - cells[i][j].compounds[k] * evaporationSpeed[k], 0), 1);
      }
    }
  }
}