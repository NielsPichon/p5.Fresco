const backgroundClr = '000';
const growthSpeed = 1;
const res = 10;
const margin = 100;
const numCircle = 10;
const minRadius = 10;
const maxRadius = 100;
const maxIterations = 100;
const globalScale = 0.5;
const quadtreeDepth = 3;

let blobs = [];
let tree;

class Blob extends Fresco.Circle {
  constructor(radius, resolution) {
    super(radius, resolution);
    this.isDone = false;
  }

  grow() {
    if (!this.isDone) {
      let buffer = [];
      let hasMoved = false;
      let normals = this.computeNormals();
      for (let i = 0; i < this.vertices.length; i++) {
        // Grow along normal
        let vtx = this.vertices[i].copy().add(normals[i].mult(growthSpeed));
        let vtxCopy = this.applyTransform(vtx.copy());
        // Make sure it stays inside canvas
        vtxCopy.x = Math.max(-width / 2 + margin, Math.min(vtxCopy.x, width / 2 - margin));
        vtxCopy.y = Math.max(-height / 2 + margin, Math.min(vtxCopy.y, height / 2 - margin));
        vtx = vtxCopy.copy().sub(this.position);

        // Make sure we don't collide with any blobs
        let colliders = tree.getColliders(vtxCopy);
        for (let j = 0; j < colliders.length; j++) {
          if (colliders[j] != this) {
            if (isInside(vtxCopy, colliders[j], false)) {
              vtx = this.vertices[i].copy();
              break;
            }
          }
        }
        if (vtx != this.vertices[i]) {
          hasMoved = true;
        }
        // Add point to buffer
        buffer.push(vtx);
      }
      if (!hasMoved) {
        this.isDone = true;
      }
      else {
        // unregister the shape before modifying it
        tree.unregisterShape(this);
        // Store buffer as shape vertices
        this.vertices = buffer;
        // re-register the overlapped region of the tree by the updated shape
        tree.registerShape(this, false);
      }

    }
  }
}

function setup() {
  createSVGCanvas(1000, 1000);
  setSeed();
  loadFonts();

  tree = new Fresco.Quadtree(3, createVector(-width / 2, -height / 2), createVector(width, height));

  for (let i = 0; i < numCircle; i++) {
    let isFitting = false;
    let newCircle;
    let counter = 0;
    // Generate circles until one fits
    while (!isFitting && counter < maxIterations) {
      counter ++;
      isFitting = true;
      // Create random radius
      let r = minRadius + random() * (maxRadius - minRadius);
      // Create Blob
      newCircle = new Blob(r, res);
      // Generate random position of Blob
      let x = -width / 2 + margin + random() * (width - 2 * margin);
      let y = -height / 2 + margin + random() * (height - 2 * margin);
      newCircle.position = createVector(x, y);
      // Check whether new circle collides with another circle
      for (let j = 0; j < blobs.length; j++) {
        if (newCircle.position.dist(blobs[j].position) <= newCircle.radius + blobs[j].radius) {
          isFitting = false;
          break;
        }
      }
    }
    if (isFitting) {
      blobs.push(newCircle);
    }
    else {
      break;
    }
  }

  // register shapes in the quadtree
  blobs.forEach(b => {
    tree.registerShape(b);
  })
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  // Update all blobs and draw them
  blobs.forEach(b => {
    // b.grow();
    b.drawInstantiate(false, b.position, createVector(globalScale, globalScale));
  })

  tree.draw();
  print(tree)
  noLoop();
}