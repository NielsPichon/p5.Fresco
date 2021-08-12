const backgroundClr = '000';
const debugColors = true;

// camera settings 
const xSkewDeg = 33; // angle that perspective line have with the horizontal axis in deg
const zSkewDeg = 15; // angle that perspective line have with the depth axis in deg

// box properties
const boxWidth = 200;
const boxDepth = 50;
const boxHeight = 300;

// grid spacing
const minXSpacing = 10;
const maxXSpacing = 300;
const rowSpacing = 100;
const minDepth = -1000;
const maxDepth = 1000;
const minX = -1000;
const maxX = 1000;

// convert camera settings to radians
let xSkew = xSkewDeg * Math.PI / 180;
let zSkew = zSkewDeg * Math.PI / 180 + Math.PI / 2 + xSkew;

// boxes buffer
let boxes = [];

// rotate a point according to camera settings
function rotatePoint(point) {
  let nuPoint = createPoint(0, 0);
  nuPoint.x = point.x * Math.cos(xSkew) + point.z * Math.cos(zSkew);
  nuPoint.y = point.y + point.x * Math.sin(xSkew) + point.z * Math.sin(zSkew);
  return nuPoint;
}

function subtractFaces(subtractFrom, subFace) {
  faceBuffer = [];
  subtractFrom.forEach(face => {
      if (face != null && subFace != null) {
        nuFaces = face.subtract(subFace);
        if (nuFaces != null) {
          faceBuffer = faceBuffer.concat(nuFaces);
        }
      }
  });

  // prune empty faces
  let outFaces = [];
  faceBuffer.forEach(face => {
    if (face != null) {
      outFaces.push(face);
    }
  })

  return outFaces;
}

class Box {
  constructor(boxH, boxW, boxD, position) {
    // invert the x axis
    position.x *= -1;

    // Create corners of the box
    let v1 = rotatePoint(createPoint(-boxW / 2, boxH, 0).add(position));
    let v2 = rotatePoint(createPoint(boxW / 2, boxH, 0).add(position));
    let v3 = v2.copy(); v3.y -= boxH;
    let v4 = v1.copy(); v4.y -= boxH;
    let v5 = rotatePoint(createPoint(-boxW / 2, 0, boxD).add(position));
    let v6 = v5.copy(); v6.y += boxH;
    let v7 = rotatePoint(createPoint(boxW / 2, boxH, boxD).add(position));

    // create faces of the box from from corners
    this.faces = [new Fresco.Shape([v1, v2, v3, v4, v1])]; // front face
    this.faces.push(new Fresco.Shape([v4, v5, v6, v1, v4])); // side face
    this.faces.push(new Fresco.Shape([v1, v6, v7, v2, v1])); // top face

    // ensure faces are polygonal
    this.faces.forEach(face => face.isPolygonal = true);

    // store overall depth
    this.depth = position.z;
  }

  subtractFrom(box) {
    if (box.faces != null && this.faces != null)
    {
      this.faces.forEach(face => box.faces = subtractFaces(box.faces, face));
    }
  }

  draw() {
    this.faces.forEach(face => {
      if (face != null) {
        if (debugColors) {
          face.setColor([random() * 255, random() * 255, random() * 255]);
        }
        face.draw()
      }
    })
  }
}

function setup() {
  createSVGCanvas(770, 770 * Math.SQRT2);
  background(colorFromHex(backgroundClr));
  setSeed();

  let z = maxDepth;
  let x = maxX;
  while (z > minDepth) {
    while (x > minX) {
      x -= lerp(minXSpacing, maxXSpacing, random()) + boxWidth;
      // generate new box
      let nuBox = new Box(boxHeight, boxWidth, boxDepth, createVector(x, 0, z));
      // remove box form existing shapes
      if (boxes.length > 0) {
        boxes.forEach(box => nuBox.subtractFrom(box));
        // prune empty boxes
        for (let i = boxes.length - 1; i >= 0; i--) {
          if (boxes[i].faces.length == 0) {
            boxes.splice(i, 1);
          }
        }
      }
      boxes.push(nuBox);
    }
    z -= rowSpacing + boxDepth;
    x = maxX;
  }
}

// draw function which is automatically
// called in a loop
function draw() {
  boxes.forEach(box => box.draw());

  noLoop();
}

