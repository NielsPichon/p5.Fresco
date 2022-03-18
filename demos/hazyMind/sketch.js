const backgroundClr = '000';
const startDist = 50; // initial single step walk distance
const stopDist = 10; // single step walk distance below which a walker will stop
const shortenProb = 0.2; // probability of shortening the path
const numWalkers = 800; // number of random walkers
const epsilon = 0.1; // how much further in % of the current walk distance should we look at to avoid self-overlap
const usePerlin = false; // if true, underlying perlin noise at location will be querried to choose whether to turn
const noiseFreq = 0.005; // frequency of the underlying perlin noise
const spawnFreq = 5; // How often a new walker is spawned
const burstSpawn = false; // If true, all walkers are spawned at once
const margins = 200; // margins to canvas bounds
const safeSpawnDistance = stopDist; // Minimum distance between any existing wall and a walker being spawned
const drawRect = false; // draw a frame around the drawing area

let walls = [];
let walkers = [];
let totWalkerCount = 0;

class Walker {
  constructor(w=width, h=height) {
    this.isDead = false;
    let cantSpawn = true;
    let maxTries = 100;
    while (cantSpawn) {
      maxTries--;
      cantSpawn = false;
      for (let wall of walls) {
        this.position = createVector(random(w) - w / 2, random(h) - h / 2);
        if (pointDistToSegment(this.position, wall.vertices.at(0), wall.vertices.at(-1)) < safeSpawnDistance) {
          cantSpawn = true;
          break;
        }
      }
      // we limit the max number of tries to avoid infinite loops
      if (cantSpawn && maxTries <= 0) {
        this.position = null;
        this.isDead = true;
        break;
      }
    }
    this.direction = p5.Vector.fromAngle(Math.PI / 2 * Math.floor(random(100000)));
    this.gridSize = startDist;
    if (!this.isDead) {
      this.pts = [new Fresco.Point(this.position.copy())];
    } else {
      this.pts = [];
    }
  }

  update() {
    if (this.isDead) {
      return false;
    }

    // change direction
    let randomValue;
    if (usePerlin) {
      randomValue = noise(this.position.x * noiseFreq, this.position.y * noiseFreq) 
    } else {
      randomValue = random();
    }

    // randomly carry on, turn left or turn right
    if (randomValue < 0.66)
    {
      if (randomValue < 0.33) {
        this.direction.rotate(Math.PI / 2);
      } else {
        this.direction.rotate(-Math.PI / 2);
      }
    }

    // maybe shorten move
    if (random() < shortenProb) {
      this.gridSize /= 2;

      if (this.gridSize < stopDist) {
        return false;
      }
    }

    // set new position
    let newPos = this.position.copy().add(this.direction.copy().mult(this.gridSize));

    // create offset lookup position to avoid overlap
    let lookup = this.position.copy().add(this.direction.copy().mult(this.gridSize * (1 + epsilon)));

    // cast rays against all existing paths. This may be optimized in the future
    let closestImpact = 1e9;
    walls.forEach(wall => {
      let intersection = segmentIntersection(this.position, lookup, wall.vertices.at(0), wall.vertices.at(-1));
      if (intersection !== false) {
        let dist = distSquared(intersection, this.position);
        if (dist < closestImpact && dist > 0) {
          closestImpact = dist;
        }
      }
    });

    // if there is a hit, only move to half the distance to collision
    if (closestImpact < 1e8) {
      newPos = this.position.copy().add(this.direction.copy().mult(Math.sqrt(closestImpact) * 0.5));
    }

    // draw a line to the new position
    let newShape = new Fresco.Line(this.position.copy(), newPos.copy());
    this.position = newPos;
    walls.push(newShape);
    this.pts.push(new Fresco.Point(newPos.copy()));

    return true;
  }

  draw() {
    if (this.pts.length > 0) {
      let s = new Fresco.Shape(this.pts);
      s.isPolygonal = true;
      s.draw();
    }
  }
}


function setup() {
  createA4RatioCanvas(1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  // Fresco.registerShapes = false;

  // create the walkers
  if (burstSpawn) {
    for (let i = 0; i < numWalkers; i++) {
      walkers.push(new Walker(width - 2 * margins, height - 2 * margins));
    }

    totWalkerCount = numWalkers;
  }

  // add walls on the outer edge of the canvas to make sure nothing exits it
  let h = height - 2 * margins;
  let w = width - 2 * margins;
  walls.push(new Fresco.Line(createVector(-w / 2, -h / 2), createVector( w / 2, -h / 2)));
  walls.push(new Fresco.Line(createVector(-w / 2,  h / 2), createVector( w / 2,  h / 2)));
  walls.push(new Fresco.Line(createVector(-w / 2, -h / 2), createVector(-w / 2,  h / 2)));
  walls.push(new Fresco.Line(createVector( w / 2, -h / 2), createVector( w / 2,  h / 2)));
}


// draw function which is automatically 
// called in a loop
function draw() {
  if (drawRect && frameCount == 1) {
    (new Fresco.Rect(width - 2 * margins, height - 2 * margins)).draw();
  }

  if (totWalkerCount < numWalkers && frameCount % spawnFreq == 0) {
    walkers.push(new Walker(width - 2 * margins, height - 2 * margins));
    totWalkerCount++;
  }

  // update each walker and delete it if it is done
  for (let i = walkers.length - 1; i >= 0; i--) {
    if (!walkers[i].update()) {
      walkers[i].draw();
      walkers.splice(i, 1);
    }
  }

  // stop when there is no more walker
  if (walkers.length == 0 && totWalkerCount >= numWalkers) {
    noLoop();
  }
}