// color parameters
const backgroundClr = 'fff0cf';
const backgroundAlpha = 0; // how fast the shape will fade in the background. 0 means no fade
const fillColors = ['ef476f', 'ffd166', '06d6a0', '118ab2'];
const outlineColor = '073b4c';
const fillAlpha = 10; // 10 for best results
const outlineAlpha = 255; // 255 for best results
const lineThickness = 2; // 2 for best results
const interpSpeed = 1 / 120;
// bubbles parameters
const initRadius = 400; // radius of the initial circle 
const initRes = 100; // number of vertices of the initial shape
const minBubbleRadius = 10; // minimum radius of a bubble
const maxBubbleRadius = 100; // maximum radius of a bubble
const bubbleRes = 24; // number of vertices forming each bubble should they be full
const newBubbleRate = 1; // How many frames should there be between each bubble formation
const removeProbability = 0.2; // probability the new bubble will subtract from the shape
const resampleCount = 100; // If not 0, after every new bubble the shape will be resampled
// shrinking parameters
const shrinkSpeed = 1 / 150; // how fast will the shape shrink by half
//record
const record = false;
const drawingSeed = null;


let s; // shape
let dTheta = 2 * Math.PI / bubbleRes; //angular resolution
let shapeColors = []; // color buffer in rgba
let t = 0; // color interpolant
let scale = 0; // sacling factor

function setup() {
  createCanvas(1440, 1400);
  background(colorFromHex(backgroundClr));
  setSeed(drawingSeed);
  s = new Fresco.Circle(initRadius, initRes);
  s.strokeWeight = lineThickness;
  s.noFill = false;
  s.color = colorFromHex(outlineColor, outlineAlpha);

  // convert colors to rgba
  for (let i = 0; i < fillColors.length; i++) {
    shapeColors.push(colorFromHex(fillColors[i], fillAlpha));
  }

  // Add the first color at the end of the array to make a cyclic interpolation
  shapeColors.push(shapeColors[0]);

  if (record) { 
    recordAnimation()
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  if (backgroundAlpha > 0) {
    background(colorFromHex(backgroundClr, backgroundAlpha));
  }
  s.fillColor = colorInterp(t, shapeColors);
  s.draw();
  if (frameCount % newBubbleRate == 0) {
    addOrRemoveBubble();
  }

  t += interpSpeed;
  t = t % 1; 

  scale = 1 / Math.pow(2, frameCount * shrinkSpeed);
  s.setScale(scale); 
}

function addOrRemoveBubble() {
  // randomly choose whether the bubble will be added or substracted
  let add = random() > removeProbability;
  // randomly choose the bubble's radius
  let radius = random() * (maxBubbleRadius - minBubbleRadius) + minBubbleRadius;
  // apply scaling factor
  radius *= scale;
  // randomly choose a vertex to grow from
  let vertex = Math.floor(random() * s.vertices.length);

  // Find intersections of the bubble with the shape,
  // starting clockwise and anti clockwise
  let right = findVertexOut(vertex, radius, 1);
  let left = findVertexOut(vertex, radius, -1);

  // if the entire shape is inside
  if (right == -1 || left == -1) {
    // if additive bubble, we reset the shape to
    // the chosen bubble radius
    if (add) {
      s = new Fresco.Circle(radius, initRes)
    }
    else {
      // otherwise we stop the program after erasing the shape
      noLoop();
      s.vertices = [];
      redraw();
    }
  }
  else {
    // We compute the intersection with the relevant edges
    let I1 = edgeCircleIntersection(s.vertices[moduloShape(right - 1)],
                                    s.vertices[right], s.vertices[vertex],
                                    radius);
    let I2 = edgeCircleIntersection(s.vertices[moduloShape(left + 1)],
                                    s.vertices[left], s.vertices[vertex],
                                    radius);

    let offset = I2.copy().sub(s.vertices[vertex])

    // compute angle between the vector from the buibble center to
    // the first intersection and the one to the second intersection
    let maxTheta = Math.abs(offset.angleBetween(I1.copy().sub(s.vertices[vertex])));
    
    let newVtx = [];
    
    // Add circle vertices, starting at the left intersection and stopping at the right
    if (!add) {
      maxTheta = -(2 * Math.PI - maxTheta);
      let theta = -dTheta;
      while (theta > maxTheta) {
        newVtx.push(offset.copy().rotate(theta).add(s.vertices[vertex]));
        theta -= dTheta;
      }
      newVtx = dissolveVertices(newVtx, false);
    }
    else { 
      let theta = dTheta;
      while (theta < maxTheta) {
        newVtx.push(offset.copy().rotate(theta).add(s.vertices[vertex]));
        theta += dTheta;
      }
      newVtx = dissolveVertices(newVtx, true);
    }


    // replace vertices inside the circle by the circle itself
    s.vertices.splice(left + 1, right - left - 1, ...newVtx);
  }

  if (resampleCount > 0) {
    s = resample(s, resampleCount);
  }
}

function findVertexOut(startVtx, radius, step = 1) {
  let idx = moduloShape(startVtx + step);

  let rSq = radius * radius;
  // We go through all the vertices in order, until we find one that
  // is out of the circle's radius. This obviously assumes the shape
  // is convex which will not always be true, and we may miss
  // intersections this way (in the event of a concavity with 2 vertices
  // inside but the sahpe cutting the edge), but it is much faster to compute and is
  // enough for our purpose
  while (distSquared(s.vertices[idx], s.vertices[startVtx]) < rSq) {
    idx += step;

    idx = moduloShape(idx);

    // In the event where we have reached the start vertex this means
    // the entire shape is in the bubble. We thus return -1 and this will
    // be dealt with accordingly in the bubble gen
    if (idx == startVtx) {
      return -1;
    }
  }

  return idx;
}

// TODO: shift circle center
// computes the intersection of a circle, described by its center and radius,
// and an edge, described by its 2 extremity points
function edgeCircleIntersection(p1, p2, center, radius) {
  let p11 = p1.copy().sub(center);
  let p22 = p2.copy().sub(center);
  // see https://mathworld.wolfram.com/Circle-LineIntersection.html
  // Note that we disregard the case with 2 intersections because we
  // know that one and only one of the 2 vertices is inside the circle
  let dx = p22.x - p11.x;
  let dy = p22.y - p11.y;
  let dr2 = dx * dx + dy * dy;
  let D = p11.x * p22.y - p11.y * p22.x;
  
  let r2 = radius * radius;
  let D2 = D * D;

  x1 = (D * dy  + Math.sign(dy) * dx * Math.sqrt(r2 * dr2 - D2)) / dr2;
  y1 = (-D * dx  + Math.abs(dy) * Math.sqrt(r2 * dr2 - D2)) / dr2;

  // if the resulting point is in between the 2 edge vertices, this is the actual intersection.
  if ((p11.x <= x1 && x1 <= p22.x) || (p22.x <= x1 && x1 <= p11.x)) {
    return createPoint(x1, y1).add(center);
  }
  else {
    x2 = (D * dy  - Math.sign(dy) * dx * Math.sqrt(r2 * dr2 - D2)) / dr2;
    y2 = (-D * dx  - Math.abs(dy) * Math.sqrt(r2 * dr2 - D2)) / dr2;

    return createPoint(x2, y2).add(center);
  }
}

function moduloShape(idx) {
  // if we reach the end of the array, we start back
  // at the second vertex because the shape is closed
  if (idx >= s.vertices.length) {
    idx = 1;
  }
  // if we reach the beginning of the array, we start
  // back at the last but one vertex because the shape is closed
  if (idx < 0) {
    idx = s.vertices.length - 2;
  }
  return idx;
}

// remove vertices, when they are inside/outside the shape
function dissolveVertices(vertices, inside=true) {
  let buffer = [];

  for (let i = 0; i < vertices.length; i++) {
    let isIn = isInside(vertices[i], s);
    if (isIn != inside) {
      buffer.push(vertices[i]);
    }
  }
  return buffer;
}