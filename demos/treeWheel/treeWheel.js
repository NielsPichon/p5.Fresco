const backgroundClr = '000';
const lineClr = 'fff'
const lineWeight = 1;
const pointWeight = 5;

const maxRecursion = 5;
const maxChildren = 5;
const stopProbabilityIncr = 0.1;
const numChildrenDecrement = 0.5;
const initNodesNum = 3;
const radialIncr = 100;


let rootNode;

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();

  rootNode = new Node(0);
  rootNode.children = [];

  for (let i = 0; i < initNodesNum; i++) {
    rootNode.children.push(new Node(1));
  }

  rootNode.alphaWeight = 2 * Math.PI;
  rootNode.alpha = 0;

  rootNode.drawChildren();
}

// draw function which is automatically 
// called in a loop
function draw() {
}


class Node extends Fresco.Point {
  constructor(recursionLvl) {
    super(createVector(0, 0));
    this.color = lineClr;
    this.weight = null;
    this.recursionLvl = recursionLvl;
    this.children = [];
    this.spawnChildren();
  }

  spawnChildren() {
    let t = random();
    // if max recursion depth is reached or stop instruction is randomly reached
    if (this.recursionLvl >= maxRecursion || t > stopProbabilityIncr * this.resursionLvl) {
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

    // retrieve the weights of each child of the root node
    let weights = new Array(this.children.length);
    for (let i = 0; i < this.children.length; i++) {
      weights[i] = this.children[i].getWeight();
    }

    // deduce angular weight
    for (let i = 0; i < this.children.length; i++) {
      weights[i] /= this.getWeight();
      weights[i] *= this.alphaWeight;
      this.children[i].alphaWeight = weights[i];
    }

    // draw first raw of nodes
    let alpha = this.alpha - weights[0] / 2 - this.alphaWeight / 2;
    for (let i = 0; i < this.children.length; i++) {
      alpha += weights[i] / 2;
      this.children[i].setPosition(p5.Vector.fromAngle(alpha).mult(radialIncr * (this.recursionLvl + 1)));
      this.children[i].alpha = alpha;
      stroke(this.children[i].color);
      strokeWeight(lineWeight);
      drawLine(this, this.children[i]);
      strokeWeight(pointWeight);
      drawPoint(this.children[i]);
      this.children[i].drawChildren()
      alpha += weights[i] / 2;
    }
  }
}