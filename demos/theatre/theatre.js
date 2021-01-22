const backgroundClr = '000';
const numClouds = 1;
const numWaves = 20;
const cloudLevels = 3;
const cloudUpMin = 30; 
const cloudUpMax = 60;
const cloudMaxHorizontal = 200;
const cloudMargin = 60;

let clouds = [];
let waves = [];

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();

  // Create clouds
  for (let i = 0; i < numClouds; i++) {
    clouds.push(createCloud());
  }

  // Create waves
  for (let i = 0; i < numWaves; i++) {
    waves.push(createWave());
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  // Draw clouds
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].draw();
  }
  
  // Draw sea

  noLoop();
}

function createCloud() {
  let vertices = [];

  // Initiate point
  vertices.push(createPoint(0, 0));
  let vertex = createPoint(0, 0);

  // Create left side of the cloud
  let leftOrRight;
  let maxRight = vertex.x;
  
  for (let i = 0; i < cloudLevels; i++) {
    // Move up 
    // let up = random(cloudUpMin, cloudUpMax);
    let up = (cloudUpMin + cloudUpMax) * 0.5;
    vertex.add(createVector(0, up));
    vertices.push(vertex.copy());
    
    // Move left or right
    if (random() < 0.5) {
      leftOrRight = -1;
    } else {
      leftOrRight = 1;
    }
    
    // Move horizontally.
    // The minimal displacement has to be at least equal to the minimum up displacement
    let horizontal = random(up + cloudUpMax, cloudMaxHorizontal);
    vertex.add(createVector(horizontal * leftOrRight, 0));
    vertices.push(vertex.copy());

    // If move right, check if new position is right of max right
    // If so, store current position as max right
    if (leftOrRight > 0) {
      if (vertex.x > maxRight) {
        maxRight = vertex.x;
      }
    }
  }

  // If last move is left, then go up
  if (leftOrRight < 0) {
     // Move up 
    //  let up = random(cloudUpMin, cloudUpMax);
     let up = (cloudUpMin + cloudUpMax) * 0.5;
     vertex.add(createVector(0, up));
     vertices.push(vertex.copy());   
  }

  // Minimum displacement to reach the right most position
  let maxLeft = maxRight + cloudMargin;
  let horizontal = maxLeft - vertex.x;

  // Move right 
  vertex.add(createVector(random(horizontal, horizontal + cloudMaxHorizontal), 0));
  vertices.push(vertex.copy());

  // Create right side of the cloud
  for (let i = 0; i < cloudLevels; i++) {
    // Move down
    // let down = random(cloudUpMin, cloudUpMax);
    let down = (cloudUpMin + cloudUpMax) * 0.5;
    vertex.add(createVector(0, -down));
    vertices.push(vertex.copy());
    
    // Move left or right
    if (vertex.x - maxLeft < cloudMargin) {
      leftOrRight = 1
    } else {
      if (random() < 0.5) {
        leftOrRight = -1;
      } else {
        leftOrRight = 1;
      }
    }
    
    // Move horizontally.
    // The minimal displacement has to be at least equal to the minimum up displacement
    let horizontal = random(down + cloudUpMax, cloudMaxHorizontal);
    vertex.add(createVector(horizontal * leftOrRight, 0));
    vertex.x = Math.max(maxLeft, vertex.x);
    vertices.push(vertex.copy());
  }

  // If last move is right, then down
  if (leftOrRight > 0) {
      // Move down 
      // let down = random(cloudUpMin, cloudUpMax);
      let down = (cloudUpMin + cloudUpMax) * 0.5;
      vertex.add(createVector(0, -down));
      vertices.push(vertex.copy());   
   }

  // if higher move down
  if (vertex.y > 0) {
    // Move down 
    // let down = random(cloudUpMin, cloudUpMax);
    let down = (cloudUpMin + cloudUpMax) * 0.5;
    vertex.add(createVector(0, -down));
    vertices.push(vertex.copy());   
  }

  // move left
  vertices.push(createPoint(0, vertex.y));

  //if lower move up
  if (vertex.y < 0) {
    vertices.push(createPoint(0, 0));
  }

  // Create cloud shape
  let cloud = new Fresco.Shape(vertices);
  // cloud.isPolygonal = true;

  return cloud;
}

function createWave() {

}