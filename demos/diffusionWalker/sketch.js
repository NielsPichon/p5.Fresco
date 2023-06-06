const backgroundClr = '000';
const colors = [
  'fff', '888', '444']            // Possible colors for the walkers
const numWalkers = 100;           // number of initial walkers per cluster
const numClusters = 5;            // number of spawning clusters
const bestPacking = false;        // Whether we should try to pack clusters as
                                  // evenly as possible (while still random).
                                  // Number of actually spawned clusters
                                  // is not guaranteed
const maxDisplacement = 10;       // Max step distance per move. Also affect
                                  // branching.
const initialDispersion = 100;    // Max distance from cluster center at spawn
const spawnProb = 0.1;            // Probability to branch off at each step
const noiseFreq = 0.001;          // Frequency of the underlying perlin noise
const randomRotAmount = 0.4;      // random jitter at each move
const perlinPerturbation = true;  // If true, the current direction will be
                                  // perturbed by some amount. If False
                                  // direction is completely guided by perlin
                                  // noise
const perturbationAmount = 0.2;   // amount of perturbation in perturbation mode
const roundOnCleanUp = true;      // Whether to convert to spline based shape
                                  // upon cleanup
const margins = 50;               // Margin in pixels to enforce with canvas
                                  // bounds
const clickable = true;           // If true, only spawns clusters on click
const colorButtons = true;        // If true, colors are selectable by clicking
                                  // buttons rather than randomly assigned.


let walkers = [];
let deadWalkers = [];

let clusters = [];

let grid = [];

let resX;
let resY;

let currLayer = 0;


class Walker extends p5.Vector {
  constructor(pos, layer) {
    super();
    this.x = pos.x;
    this.y = pos.y;
    this.hist = [pos.copy()];
    this.layer = layer;
  }

  set_pos(pos) {
    this.x = pos.x;
    this.y = pos.y;
    this.hist.push(pos);
  }

  last_dir() {
    if (this.hist.length == 1) {
      return random2DVector();
    } else {
      return this.hist.at(-1).copy().sub(this.hist.at(-2)).normalize();
    }
  }
}

function canClusterFit(pos, radius) {
  let ok = true;
  for (cluster of clusters) {
    if (distSquared(cluster, pos) < radius * radius){
      ok = false;
      break;
    }
  }
  return ok;
}

function spawnCluster(cluster) {
  let layer = currLayer;
  if (!colorButtons) {
    layer = randomInt(colors.length);
  }
  for (let i = 0; i < numWalkers; i++) {
    walkers.push(new Walker(
      cluster.copy().add(
        random2DVector().mult(random(initialDispersion))
      ),
      layer
    ));
  }
}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed(5341);
  loadFonts();
  Fresco.registerShapes = false;

  if (colorButtons) {
    for (let i = 0; i < colors.length; i++) {
      let bttn = createButton(colors[i], String(i));
      bttn.position(width + 100 + 50 * i, height / 2);
      bttn.mouseClicked(() => {
        currLayer = bttn.value();
      });
    }
  }

  resX = Math.ceil(width / maxDisplacement);
  resY = Math.ceil(height / maxDisplacement);
  for (let i = 0; i < (resX + 1) * (resY+ 1); i++) {
    grid.push([]);
  }

  if (!clickable) {
    if (bestPacking) {
      // Compute approximation of best packing
      let radius = min(width, height) / Math.ceil(Math.sqrt(numClusters));
      clusters.push(
        createVector(random(width) - width / 2, random(height) - height / 2));

      for (let i = 0; i < numClusters - 1; i++) {
        for (let k = 0; k < 1000; k++) {
          let new_pos = clusters.at(-1).copy().add(
            random2DVector().mult(radius + 1));
          if (isInBounds(new_pos) && canClusterFit(new_pos, radius)) {
            clusters.push(new_pos);
            break;
          }
        }
      }
    } else {
      // randomly spawn clusters
      for (let j = 0; j < numClusters; j++) {
        clusters.push(createVector(
          random(width) - width / 2, random(height) - height / 2));
      }
    }

    // create initial pool of walkers
    for (cluster of clusters) {
      spawnCluster(cluster);
    }
  }

  jsonExportCallback = () => {
    if (Fresco.shapeBuffer.length > 0) {
      return Fresco.shapeBuffer.length > 0
    } else {
      let shapes = [];
      walkers.forEach(walker => {
        let shape = new Fresco.Shape(walker.hist);
        if (!roundOnCleanUp) {
          shape.isPolygonal = true;
        }
        shape.layer = walker.layer
        shapes.push(shape);
      })
      deadWalkers.forEach(walker => {
        let shape = new Fresco.Shape(walker.hist);
        if (!roundOnCleanUp) {
          shape.isPolygonal = true;
        }
        shape.layer = walker.layer;
        shapes.push(shape);
      })
      return shapes;
    }
  }
}

function mouseClicked() {
  cluster = createVector(mouseX - width / 2, height / 2 - mouseY);
  spawnCluster(cluster);
}

function isInBounds(pos) {
  return (
    Math.abs(pos.x) < width / 2 - margins
  ) && (
    Math.abs(pos.y) < height / 2 - margins
  );
}

function checkForCollision(old_pos, new_pos) {
  let paths = [...grid[getCell(old_pos)]];
  paths.push(...grid[getCell(new_pos)]);

  let collides = false;
  for (path of paths) {
    if (
      segmentIntersection(
        old_pos, new_pos, path[0], path[1], 0.01
      ) !== false
    ) {
      collides = true;
      break;
    };
  }

  return collides;
}

function getCell(pos) {
  let x_idx = Math.min(Math.max(
    0, Math.floor((pos.x + width / 2) / maxDisplacement)), resX);
  let y_idx = Math.min(Math.max(
    0, Math.floor((pos.y + height / 2) / maxDisplacement)), resY);

  return y_idx * resX + x_idx;
}

function step() {
  let buffer = []

  // for each walker, move it and check whether it has hit a wall.
  // If not move it.
  for (walker of walkers) {
    let x = (walker.x + width / 2) * noiseFreq;
    let y = (walker.y + height / 2) * noiseFreq;
    let norm = noise(x, y) * maxDisplacement;
    let dir = noiseVector(noise, x + 100, y + 100);
    let randomDir = random2DVector();
    dir = lerpVector(dir, randomDir, randomRotAmount);

    if (perlinPerturbation) {
      dir = lerpVector(walker.last_dir(), dir, perturbationAmount);
    }

    let disp = dir.mult(norm);
    let new_pos = walker.copy().add(disp);
    if (!checkForCollision(walker, new_pos) && isInBounds(new_pos)) {
      let line = new Fresco.Line(walker, new_pos);
      line.color = colorFromHex(colors[walker.layer]);
      line.draw();
      grid[getCell(walker)].push([walker.copy(), new_pos.copy()]);
      grid[getCell(new_pos)].push([walker.copy(), new_pos.copy()]);

      walker.set_pos(new_pos);
      buffer.push(walker);
    } else {
      if (walker.hist.length > 1) {
        deadWalkers.push(walker);
      }
    }
  }

  // store remaining walkers
  walkers = [...buffer];

  // maybe spawn new walkers
  buffer = [];
  walkers.forEach(walker => {
    if (random() < spawnProb) {
      buffer.push(new Walker(walker.copy(), walker.layer));
    }
  })
  walkers.push(...buffer);

  if (walkers.length == 0 && !clickable) {
    makeClean();
  }
}

function makeClean() {
  noLoop();
  print('Done');
  background(colorFromHex(backgroundClr));
  Fresco.registerShapes = false;
  deadWalkers.forEach(walker => {
    let shape = new Fresco.Shape(walker.hist);
    if (!roundOnCleanUp) {
      shape.isPolygonal = true;
    }
    shape.layer = walker.layer;
    shape.color = colorFromHex(colors[walker.layer]);
    shape.draw();
  })
}

// draw function which is automatically
// called in a loop
function draw() {
  step();
}
