const backgroundClr = '000';
const growthSpeed = 1;
const res = 50;

let blobs = [];

class Blob extends Fresco.Circle {
  grow() {
    let buffer = [];
    let normals = this.computeNormals();
    for (let i = 0; i < this.vertices.length; i++) {
      // Grow along normal
      let vtx = this.vertices[i].copy().add(normals[i].mult(growthSpeed));
      // Make sure it stays inside canvas
      vtx.x = Math.max(-width / 2, Math.min(vtx.x, width / 2));
      vtx.y = Math.max(-height / 2, Math.min(vtx.y, height / 2));
      // Make sure we don't collide with any blobs

      // Add point to buffer
      buffer.push(vtx);
    }

    // Store buffer as shape vertices
    this.vertices = buffer;
  }
}

function setup() {
  createSVGCanvas(1000, 1000);
  setSeed();
  loadFonts();

  blobs.push(new Blob(100, res));
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  // Update all blobs and draw them
  blobs.forEach(b => {
    b.grow();
    b.draw();
  })
}