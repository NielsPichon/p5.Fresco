const backgroundClr = '10002b'; // background color

const lineClr = ['7400b8', '6930c3', '5e60ce', '5390d9', '4ea8de', '48bfe3', '56cfe1', '64dfdf', '72efdd', '80ffdb']; // colors to randomly choose from
const lineAlpha = 255;
const lineWeight = 2; // how thick each line is

const pointClr = ['fff']; // colors to randomly choose from
const pointAlpha = 255;
const pointWeight = 2; // how thick each node point is. if 0 it will not be drawn


const maxRecursion = 12 ; // max depth of the tree
const maxChildren = 15; // max number of children for the root node
const stopProbabilityIncr = 0.2; // How fast the probability of a branch to stop increases with tree depth
const numChildrenDecrement = 0.1; // How fast the number of branchs per node decreases with tree depth
const initNodesNum = 5; // number of nodes on the first circle
const radialIncr = 80 * 1.44; // how far appart each "circle" is
const maxSpan = 1.8 * Math.PI; // Which angular span the tree covers.
const centerAngle = Math.PI / 2; // angle the tree faces

const rotationSpeed = 0; // how fast the shape spins
const radiusSpeed = 2 * Math.PI / (4 * 60); // how fast the size oscillates
const animateTreeSpanSpeed = 2 * Math.PI / (4 * 60); // if > 0 the span of the tree will oscillate

const record = false; // whether to record the animation


let rootNode;
let radius = radialIncr;

function setup() {
  createCanvas(1440, 1440);
  background(colorFromHex(backgroundClr));
  setSeed(359); //7865

  // create the root node
  rootNode = new Node(0);

  // clear its children
  rootNode.children = [];

  // spawn a set amount of initial branches which will each spawn their own children
  for (let i = 0; i < initNodesNum; i++) {
    rootNode.children.push(new Node(1));
  }

  // the root node can spawn branches around a set angle
  rootNode.alphaWeight = maxSpan;
  rootNode.alpha = centerAngle;

  if (pointWeight > 0) {
    stroke(randomColorFromHex(lineClr, lineAlpha));
    strokeWeight(pointWeight * 2);
    drawPoint(rootNode);
  }

  if (record){
    recordAnimation();
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  if (rotationSpeed > 0 || animateTreeSpanSpeed > 0 ||  radiusSpeed > 0) {
    // draw background
    setBackgroundColor(colorFromHex(backgroundClr));

    // rotate the shape
    if (rotationSpeed > 0) {
      rootNode.alpha += rotationSpeed;
    }

    if (animateTreeSpanSpeed > 0) {
      rootNode.alphaWeight = maxSpan * map(Math.cos(Math.PI + (frameCount - 1) * animateTreeSpanSpeed), -1, 1, 0, 1);
    }

    if (radiusSpeed > 0) {
      radius = radialIncr * map(Math.cos(Math.PI + (frameCount - 1) * radiusSpeed), -1, 1, 0, 1);
    }

    // redraw tree
    rootNode.drawChildren();
  }
  else {
    rootNode.drawChildren();
    noLoop();
  }

  if (record && frameCount == 4 * 60) {
    stopRecording();
  }
}


class Node extends Fresco.Point {
  constructor(recursionLvl) {
    super(createVector(0, 0));
    this.color = randomColorFromHex(lineClr,lineAlpha);
    this.pointColor = randomColorFromHex(pointClr, pointAlpha);
    this.weight = null;
    this.recursionLvl = recursionLvl;
    this.children = [];
    this.spawnChildren();
  }

  spawnChildren() {
    let t = random();
    // if max recursion depth is reached or stop instruction is randomly reached
    if (this.recursionLvl >= maxRecursion || t < stopProbabilityIncr * this.recursionLvl) {
      // terminal nodes have a weight of 1
      this.weight = 1;
      return;
    }

    // get random number of children
    let numChildren = random(0, Math.max(0, maxChildren - numChildrenDecrement * this.recursionLvl));
    for (let i = 0; i < numChildren; i++) {
      // spawn new node children
      this.children.push(new Node(this.recursionLvl + 1));
    }
    if (this.children.length <= 0) {
      this.weight = 1;
    }
  }

  getWeight() {
    // if weight is already computed, return it
    if (this.weight) {
      return this.weight;
    }

    // else the weight of this node is the sum of the weight of the children
    this.weight = 0;
    for (let i = 0; i < this.children.length; i++) {
      this.weight += this.children[i].getWeight();
    }
    return this.weight;
  }

  drawChildren() {
    if (this.children.length == 0) {
      return;
    }

    // pre-compute children weights
    this.getWeight();

    // deduce angular weight as a fraction of this node's weights * angular weight
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].alphaWeight = this.children[i].getWeight() / this.getWeight() * this.alphaWeight;
    }

    // draw first raw of nodes
    let alpha = this.alpha - this.alphaWeight / 2;
    for (let i = 0; i < this.children.length; i++) {
      alpha += this.children[i].alphaWeight / 2;
      this.children[i].setPosition(p5.Vector.fromAngle(alpha).mult(radius * (this.recursionLvl + 1)));
      this.children[i].alpha = alpha;
      let line = new Fresco.Line(this, this.children[i]);
      line.color = this.children[i].color;
      line.strokeWeight = lineWeight
      line.draw();
      if (pointWeight > 0) {
        stroke(this.children[i].pointColor);
        strokeWeight(pointWeight);
        drawPoint(this.children[i]);
      }
      this.children[i].drawChildren()
      alpha += this.children[i].alphaWeight / 2;
    }
  }
}