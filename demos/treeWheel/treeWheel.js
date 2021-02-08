const backgroundClr = '000'; // background color
const lineClr = ['023e8a', '0077b6', '0096c7','00b4d8', '48cae4', '90e0ef', 'ade8f4', 'caf0f8']; // colors to randomly choose from
const lineWeight = 0.5; // how thick each line is
const pointWeight = 0; // how thick each node point is. if 0 it will not be drawn

const maxRecursion = 5; // max depth of a the tree
const maxChildren = 50; // max number of children for the root node
const stopProbabilityIncr = 0.2; // How fast the probability of a branch to stop increases with tree depth
const numChildrenDecrement = 15; // How fast the number number of branchs per node decreases with tree depth
const initNodesNum = 3; // number of nodes on the first circle
const radialIncr = 100; // how far appart each "circle" is
const maxSpan = 2 * Math.PI; // Which angular span the tree covers.
const centerAngle = 0; // angle the tree faces

const rotationSpeed = 0.02; // how fast the shape spins
const animateTreeSpanSpeed = .01; // if > 0 the span of the tree will oscillate

const record = false; // whether to record the animation


let rootNode;

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();

  // create the root node
  rootNode = new Node(0);

  // clear its children
  rootNode.children = [];

  // spaen a set amount of initial branches which will each spawn their own children
  for (let i = 0; i < initNodesNum; i++) {
    rootNode.children.push(new Node(1));
  }

  // the root node can spawn branches around a set angle
  rootNode.alphaWeight = maxSpan;
  rootNode.alpha = centerAngle;

  if (pointWeight > 0) {
    stroke(randomColorFromHex(lineClr));
    strokeWeight(pointWeight * 2);
    drawPoint(rootNode);
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  if (rotationSpeed > 0 || animateTreeSpanSpeed > 0) {
    // sraw background
    background(colorFromHex(backgroundClr));

    // rotate the shape
    if (rotationSpeed > 0) {
      rootNode.alpha += rotationSpeed;
    }

    if (animateTreeSpanSpeed > 0) {
      rootNode.alphaWeight = maxSpan * map(Math.cos((frameCount - 1) * animateTreeSpanSpeed), -1, 1, 0, 1);
    }

    // redraw tree
    rootNode.drawChildren();
  }
  else {
    rootNode.drawChildren();
    noLoop();
  }
}


class Node extends Fresco.Point {
  constructor(recursionLvl) {
    super(createVector(0, 0));
    this.color = randomColorFromHex(lineClr);
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
      this.children[i].setPosition(p5.Vector.fromAngle(alpha).mult(radialIncr * (this.recursionLvl + 1)));
      this.children[i].alpha = alpha;
      stroke(this.children[i].color);
      strokeWeight(lineWeight);
      drawLine(this, this.children[i]);
      if (pointWeight > 0) {
        strokeWeight(pointWeight);
        drawPoint(this.children[i]);
      }
      this.children[i].drawChildren()
      alpha += this.children[i].alphaWeight / 2;
    }
  }
}