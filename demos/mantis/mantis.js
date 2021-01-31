// color settings
const backgroundClr = 'f9efcf';
const lineColor = '2d170b';
const lineOpacity = 255;
const lineThickness = 2;
const borderColor = '2d170b';
const borderOpacity = 255;
const borderThickness = 3;
const rounded = true;

// branch settings
const stopProbability = 0.1;
const branchProbability = 0.5;

const minAngle = -Math.PI / 2;
const maxAngle = Math.PI / 2;

const minBranchLength = 100 * (1440 / 1100);
const maxBranchLength = 200 * (1440 / 1100);

// restrictions settings
const topBorder = 0.1;
const fadeBorder = 0.3;

const outlineDistance = 100 * (1440 / 1100);
const marginThickness = 40 * (1440 / 1100);

const speed = 0.03;
const strip = false;

const animalSeed = 1133;
const record = true;


let firstBranching = true;
let symetric;


class Branch extends Fresco.Particle {
  constructor(pos, tgt, parentSrc) {
    super(pos);
    this.src = pos.copy();
    this.tgt = tgt;
    this.parentSrc = parentSrc;
    this.velocity = this.tgt.copy().sub(pos).mult(speed);
    this.leaveTrail = true;
    this.children = [];
    this.radius = lineThickness;
    this.color = colorFromHex(lineColor, lineOpacity);
    this.colorOverLife = [this.color];
  }
}

function setup() {
  createCanvas(1440, 1440);
  background(colorFromHex(backgroundClr));
  setSeed(animalSeed);

  let p = new Branch(createPoint(0, -height / 2 + marginThickness),
    createPoint(0, -height / 2 + minBranchLength + marginThickness),
    createPoint(0, -height / 2 + marginThickness));
  
  let children = genBranches(p);
  p.children = children;

  symetric = createVector(-1, 1);

  if (record) {
    recordAnimation();
  }

}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  simulationStep();

  for (let i = 0; i < particles.length; i++) {
    drawBranch(particles[i]);
  }

  // kill particles that are exiting the canvas
  checkCollision();

  // check whether we should branch
  maybeBranch();

  border(marginThickness, colorFromHex(backgroundClr));

  stroke(colorFromHex(borderColor, borderOpacity));
  strokeWeight(borderThickness);
  line(outlineDistance, outlineDistance, width - outlineDistance, outlineDistance);
  line(outlineDistance, outlineDistance, outlineDistance, height - outlineDistance)
  line(width - outlineDistance, outlineDistance, width - outlineDistance, height - outlineDistance)
  line(outlineDistance, height - outlineDistance, width / 3, height - outlineDistance)
  line(2 * width / 3, height - outlineDistance, width - outlineDistance, height - outlineDistance)
}

function checkCollision() {
  for (let i = 0; i < particles.length; i++) {
    if (abs(particles[i].x) >= width / 2 || Math.abs(particles[i].y) > height / 2) {
      particles[i].stopSimulate = true;
    }
  }
}


function maybeBranch() {
  for (let i = 0; i < particles.length; i++) {
    // if have reached target
    if (!particles[i].stopSimulate &&
      particles[i].position().sub(particles[i].src).magSq() >=
      particles[i].tgt.copy().sub(particles[i].src).magSq()) {
        // avoid link glitches
        particles[i].setPosition(particles[i].tgt);
        // set children to simulate and generate them some children
        // branches of their own
        for (let j = 0; j < particles[i].children.length; j++) {
          let children = genBranches(particles[i].children[j]);
          particles[i].children[j].children = children;
          particles[i].children[j].stopSimulate = false;
        }
        // set to not simulate anymore (grown branch)
        particles[i].stopSimulate = true;
    }
  }
}


function genBranches(p) {
  let newBranches = [];
  let stop = stopProbability;
  if (p.y > fadeBorder * height * 0.5) {
    let t = (p.y - (0.5 - fadeBorder) * height) / (fadeBorder - topBorder) / height;
    stop = Math.min(stopProbability * (1 - t) + t, 1); 
  }

  let spawnProbability = branchProbability * (1 - p.y / height - 0.5);

  // check if keep on going
  if (random() > stop || firstBranching) {
    newBranches.push(spawnBranch(p.tgt, p.src));
    // check if should spawn an extra branch
    if (random() < spawnProbability || firstBranching) {
      newBranches.push(spawnBranch(p.tgt, p.src));
    }
    firstBranching = false;
  }

  return newBranches;
}


function spawnBranch(src, parentSrc) {
  let angle = random(minAngle, maxAngle);
  let length = random(minBranchLength, maxBranchLength);
  let tgt = p5.Vector.fromAngle(angle + Math.PI / 2).mult(length);
  let p = new Branch(src, createPoint(tgt.x, tgt.y).add(src), parentSrc);
  p.stopSimulate = true;
  return p;
}


function drawBranch(p) {
  // only draw if a branch has started to grow
  if (p.x == p.src.x && p.y == p.src.y){
    return;
  }
  if (!strip) {
    noFill();
  }

  stroke(p.color);
  strokeWeight(p.radius);

  let addVtx;
  if (rounded) {
    addVtx = drawCurveVertex;
  }
  else {
    addVtx = drawVertex;
  }
  
  // draw the curve
  beginShape();
  if (rounded)
    addVtx(p.parentSrc);
  addVtx(p.src);
  addVtx(p);
  if (p.children.length > 0 && rounded) {
    addVtx(p.children[0].tgt);
  }
  else if (rounded){
    addVtx(p);
  }
  endShape();

  // draw the symetric curve
  beginShape();
  if (rounded)
    addVtx(symetric.copy().mult(p.parentSrc));
  addVtx(symetric.copy().mult(p.src));
  addVtx(symetric.copy().mult(p));
  if (p.children.length > 0 && rounded) {
    addVtx(symetric.copy().mult(p.children[0].tgt));
  }
  else if (rounded){
    addVtx(symetric.copy().mult(p));
  }
  endShape();
}