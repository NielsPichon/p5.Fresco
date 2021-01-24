const record = false;

// scene size
const w = 1440;
const h = 1440;

// color settings
const backgroundClr = '001c26';
const shadowClr = '00141c';
const cloudsClr = ['7ae3ef', '857aef', '7aa9ef', 'f9d97f'];
// const cloudsClr = ['1adaef', '2f1aef', '1a6fef', 'f9d163'];

const circlessClr = ['f28482', '84a59d', 'f5cac3', 'f7ede2', 'f6bd60'];
const waveStrokeClr = '7ae3ef';
const waveFillClr = '001c26';
const waveStrokeWeight = 5;
const shadowAngle = Math.PI / 4;
const rainClr = 'fff';
const rainOpacity = 50;
const borderClr = '002533';

//wave settings
const numInnerRings = 5; // number of rings inside a wave
const ringRadiusOffset = 30; // offset in radius between rings (pixels)
const waveBaseRadius = 160; // radius of the largest ring of a wave
const numWaveRaws = 5; // number of wave raws.
const waveRawOffset = waveBaseRadius / 2; // Vertical offset between raws 
const bottomRawOffset = waveBaseRadius / 2; // Vertical offset towards the bottom
                                            // of the screen of the bottom most raw
const waveMoveSpeed = 0.1; // How fast waves move
const waveMoveAmplitude = waveBaseRadius / 8; // How far each wave can travel before coming back

// Cloud settings
const cloudLevels = 6; // How many times the contour of the cloud contour goes "up" on its left side.
                       //May be increased by 1 or 2 by the generator depending of the case
const cloudLevelHeight = 100; // How high is each "up" movement in the cloud generator. Note: this is to
                             // be compared to the cloudMaxHorizontal parameter and considered as a 
                             // "ratio" rather than an absolute value since the cloud will later be scaled to have constant width.
const cloudMaxHorizontal = 200; // How far left or right a cloud contour can travel at once.
                                // be compared to the cloudLevelHeight parameter and considered as a 
                                // "ratio" rather than an absolute value since the cloud will later be scaled to have constant width.
const cloudMinHorizontal = 50; // How far left or right a cloud contour can travel at once.
const cloudMargin = 200; // Min width of the cloud in its center.
const cloudWidth = 500; // Fixed width of a cloud. Clouds will always be scaled down or up to match this fixed width;
const cloudResolution = 8; // Number of vertices in that define the rounded parts of the cloud.
const minCloudNum = 8; // Minimum amount of clouds to spawn
const maxCloudNum = 12; // maximum amount of clouds to spawn
const cloudsBorderThickness = 100; // Max distance from canvas border where a cloud could spawn
const forbidSquareClouds = true; // Wether clouds with a "squarish" bottom are allowed.
const cloudBottomLine = 2 / 3; // ratio of the image, starting from the
                               // bottom where the bottom most cloud could be spawned
const cloudMinScale = 1; // Minimum  scale of a cloud
const cloudMaxScale = 1.5; // maximum scale of a cloud
const cloudMinSpeed = 0.5; // minimum movement speed of a cloud
const cloudMaxSpeed = 2; // maximum movement speed of a cloud
const cloudSeed = 9750; // seed to use for the random generation of the clouds. If negative, a random seed will be used

// circles settings
const minNumCircles = 0; // Min amount of circles
const maxNumCircles = 0; // maximum amount of circles
const minCircleRadius = 5; // minimum radius of a circle in pixels
const maxCircleRadius = 50; // maximum radius of a circle in pixels
const circleSeed = -1; // seed to use for the random generation of the circles. If negative, a random seed will be used


// rain settings
const rainSpeed = 100; // Speed the rain falls at
const rainSpawnRate = 5; // Amount of rain particles to spawn at each frame
const rainSpawnProbability = 0.5; // Probability to actually spawn a particle when asked to
const rainTrailLenght = 2; // Amount of successive rain particle positions stored and displayed in the trail
const preDrawStepsNum = 100; // number of simulation steps to run before the first frame

// circular frame settings
const circleFrameRadius = w / 2 - 100; // Radius of the inner circle
const borderShadowDepth = 13; 
const borderShadowBands = 10;

let clouds = [];
let cloudsVel = [];
let waves = [];
let circles = [];
let frameBorder;
let frameBorderShadows = [];

function setup() {
  createCanvas(w, h);
  background(colorFromHex(backgroundClr));
  
  // Create waves
  createWave()

  // create circles
  if (circleSeed) {
    setSeed(circleSeed);
  }
  else {
    setSeed();
  }
  print("circles seed", seed);
  let numCircles = random(minNumCircles, maxNumCircles);
  for (let i = 0; i < numCircles; i++) {
    let c = new Fresco.Polygon(random(minCircleRadius, maxCircleRadius), 64);
    c.position = createVector(
      random(- width / 2, width / 2), random(- height / 2 + height *
        cloudBottomLine , height / 2));
    c.color = colorFromHex(circlessClr[Math.floor(random(circlessClr.length))]);
    c.noFill = false;
    c.fillColor = c.color;
    circles.push(c);
  }

  // Create clouds
  if (cloudSeed >= 0) {
    setSeed(cloudSeed);
  }
  else {
    setSeed(0);
  }
  print("clouds seed", seed);
  let maxAngle = Math.atan2(height * (cloudBottomLine - 0.5), width / 2);
  let minAngle = Math.PI - maxAngle;
  let numClouds = random(minCloudNum, maxCloudNum);
  for (let i = 0; i < numClouds; i++) {
    clouds.push(createCloud(minAngle + i / (numClouds - 1) * (maxAngle - minAngle)));
    cloudsVel.push(random(cloudMinSpeed, cloudMaxSpeed));
  }

  // add rain emitter
  let rainEmitter = new Fresco.ShapeEmitter(
    new Fresco.Line(createPoint(-width / 2, height / 2),
      createPoint(width / 2, height / 2)), true);
  rainEmitter.shape.isPolygonal = true;
  rainEmitter.minNormalV = rainSpeed;
  rainEmitter.maxNormalV = rainSpeed;
  rainEmitter.spawnRate = rainSpawnRate;
  rainEmitter.spawnProbability = rainSpawnProbability;
  rainEmitter.leaveTrail = true;
  rainEmitter.maxTrailLength = rainTrailLenght;
  rainEmitter.colorOverLife = [colorFromHex(rainClr, rainOpacity)]

  // run a number of simulation steps before the first frame
  // to make sure rain already fills the canvas
  for (let i = 0; i < preDrawStepsNum; i++) {
    simulationStep();
  }

  // Create circular frameBorder
  frameBorder = createCircleBorder(circleFrameRadius, colorFromHex(borderClr));
  for (let i = 0; i < borderShadowBands; i++) {
    frameBorderShadows.push(
      createCircleBorder(circleFrameRadius - borderShadowDepth / borderShadowBands * (i + 1),
        colorFromHex(shadowClr, 255 * Math.pow(1 - i / (borderShadowBands + 1), 3))));
  }

  if (record) {
    recordAnimation();
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  simulationStep();

  // draw rain
  for (let  i = 0; i < particles.length; i++) {
    // if out of screen, kill particle instead
    if (particles[i].position.y < -height / 2) {
      particles[i].isDead = true;
    }
    else {
      particles[i].draw();
    }
  }

  // Draw circles
  for (let i = 0; i < circles.length; i++) {
    let clr = circles[i].color;
    // change shadow color
    circles[i].color = colorFromHex(shadowClr);
    // draw shadow
    circles[i].drawShadow(shadowType.vanishing, shadowAngle, Math.PI / 2, 200,
      20, false, 10, 1, 0.5, true, 10);
    // change stroke color
    circles[i].color = clr;
    // draw shape
    circles[i].draw();
  }

  // Draw clouds
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].position.x += cloudsVel[i];
    if (clouds[i].position.x > width / 2 + cloudWidth * clouds[i].scale.x * 0.6) {
      clouds[i].position.x = -width / 2 - cloudWidth * clouds[i].scale.x * 0.6;
    }

    let clr = clouds[i].color;
    // change shadow color
    clouds[i].color = colorFromHex(shadowClr);
    // draw shadow
    clouds[i].drawShadow(shadowType.vanishing, shadowAngle, Math.PI / 2, 200,
      20, false, 10, 1, 0.5, true, 10);
    // chenge stroke color
    clouds[i].color = clr;
    // draw shape
    clouds[i].draw();
  }
  
  // Draw sea
  let pos = createVector(-width / 2, -height / 2 + (numWaveRaws - 1) *
    waveRawOffset - bottomRawOffset);
  for (let i = 0; i < numWaveRaws; i++) {
    pos.x = - width / 2;
    if (i % 2 == 1) {
      pos.x -= waveBaseRadius;
      // animate x position
      pos.x += waveMoveAmplitude * Math.sin(frameCount * waveMoveSpeed);
    }
    else {
      // animate x position
      pos.x -= waveMoveAmplitude * Math.sin(frameCount * waveMoveSpeed);
    }
    while (pos.x <= width / 2 + waveBaseRadius) {
      for (let i = 0; i < waves.length; i++) {
        waves[i].position = pos;
        if (i == 0) {
          let clr = waves[0].color;
          waves[0].color = colorFromHex(shadowClr);
          waves[0].drawShadow(shadowType.vanishing, shadowAngle, Math.PI / 2, 200,
                20, false, 10, 1, 0.5, true, 10);
          waves[0].color = clr;
        }
        waves[i].draw();
      }
      pos.x += 2 * waveBaseRadius;
    }
    pos.y -= waveRawOffset;
  }


  // Draw the border
  for (let i = 0; i < 2; i++) {
    for (let j = frameBorderShadows.length - 1; j >= 0; j--) {
      frameBorderShadows[j].rotation = Math.PI * i;
      frameBorderShadows[j].draw();
    }
    frameBorder.rotation = Math.PI * i;
    frameBorder.draw();
  }
}


// Create a set of concentric arcs representing a single wave
function createWave() {
  for (let i = 0; i < numInnerRings; i++) {
    let wave = new Fresco.Arc(Math.PI, waveBaseRadius - i * ringRadiusOffset, 32);
    wave.isPolygonal = true;
    wave.rotation = Math.PI;
    wave.color = colorFromHex(waveStrokeClr);
    wave.fillColor = colorFromHex(waveFillClr);
    wave.noFill = false;
    wave.strokeWeight = waveStrokeWeight;
    waves.push(wave);
  }
}

function createCircleBorder(radius, color) {
  let arc = new Fresco.Arc(Math.PI, radius, 128);
  arc.isPolygonal = true;
  // add a square around it
  arc.vertices.push(createPoint(width / 2 , 0));
  arc.vertices.push(createPoint(width / 2 , -height / 2));
  arc.vertices.push(createPoint(- width / 2 , -height / 2));
  arc.vertices.push(createPoint(- width / 2 , 0));
  arc.vertices.push(arc.vertices[0].copy());
  arc.noFill = false;
  arc.noStroke = true;
  arc.color = color;
  arc.fillColor = color;
  return arc;
}