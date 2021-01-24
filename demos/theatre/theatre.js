// scene size
const w = 1440;
const h = 1440;

// color settings
const backgroundClr = '293241';
const shadowClr = '202733';
const cloudsClr = ['f28482', '84a59d', 'f5cac3', 'f7ede2', 'f6bd60'];
const circlessClr = ['f28482', '84a59d', 'f5cac3', 'f7ede2', 'f6bd60'];
const waveStrokeClr = 'fff';
const waveFillClr = '293241';
const waveStrokeWeight = 5;
const shadowAngle = Math.PI / 4;

//wave settings
const numInnerRings = 5;
const ringRadiusOffset = 30;
const waveBaseRadius = 160;
const numWaveRaws = 5;
const waveRawOffset = waveBaseRadius / 2;
const bottomRawOffset = waveBaseRadius / 2;
const waveMoveSpeed = 0.1;
const waveMoveAmplitude = waveBaseRadius / 8;

// Cloud settings
const cloudLevels = 3;
const cloudLevelHeight = 90; 
const cloudMaxHorizontal = 200;
const cloudMargin = 180;
const cloudWidth = 500;
const cloudResolution = 8;
const minCloudNum = 8;
const maxCloudNum = 14;
const cloudsBorderThickness = 100; // Max distance from canvas border where a cloud could spawn
const forbidSquareClouds = true;
const cloudBottomLine = 2 / 3; // ratio of the image, starting from the
                               // bottom where the bottom most cloud could be spawned
const cloudMinScale = 1;
const cloudMaxScale = 1.5;
const cloudSeed = 0;

// circles settings
const minNumCircles = 5;
const maxNumCircles = 7;
const minCircleRadius = 5;
const maxCircleRadius = 50;
const circleSeed = 3108;

let clouds = [];
let waves = [];
let circles = [];

function setup() {
  createCanvas(w, h);
  background(colorFromHex(backgroundClr));
  
  // Create clouds
  setSeed();
  let maxAngle = Math.atan2(height * (cloudBottomLine - 0.5), width / 2);
  let minAngle = Math.PI - maxAngle;
  let numClouds = random(minCloudNum, maxCloudNum);
  for (let i = 0; i < numClouds; i++) {
    clouds.push(createCloud(minAngle + i / (numClouds - 1) * (maxAngle - minAngle)));
  }

  // Create waves
  createWave()

  // create circles
  setSeed(circleSeed);
  let numCircles = random(minNumCircles, maxNumCircles);
  for (let i = 0; i < numCircles; i++) {
    let c = new Fresco.Polygon(random(minCircleRadius, maxCircleRadius), 64);
    c.position = createVector(random(- width / 2, width / 2), random(- height / 2 + height * cloudBottomLine , height / 2));
    c.color = colorFromHex(circlessClr[Math.floor(random(circlessClr.length))]);
    c.noFill = false;
    c.fillColor = c.color;
    circles.push(c);
  }
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));

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


  // noLoop();
}


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