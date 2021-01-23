// scene size
const w = 1440;
const h = 1440;

// color settings
const backgroundClr = '293241';
const shadowClr = '202733';
const cloudsClr = ['f28482', '84a59d', 'f5cac3', 'f7ede2', 'f6bd60'];
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

let clouds = [];
let waves = [];

function setup() {
  createCanvas(w, h);
  background(colorFromHex(backgroundClr));
  setSeed();

  // Create clouds
  let maxAngle = Math.atan2(height * (cloudBottomLine - 0.5), width / 2);
  let minAngle = Math.PI - maxAngle;
  let numClouds = random(minCloudNum, maxCloudNum);
  for (let i = 0; i < numClouds; i++) {
    clouds.push(createCloud(minAngle + i / (numClouds - 1) * (maxAngle - minAngle)));
  }

  // Create waves
  createWave();
}

// draw function which is automatically 
// called in a loop
function draw() {
  // Draw clouds
  for (let i = 0; i < clouds.length; i++) {
    let clr = clouds[i].color;
    // set shape filled
    clouds[i].noFill = false;
    // change shadow color
    clouds[i].color = colorFromHex(shadowClr);
    // draw shadow
    clouds[i].drawShadow(shadowType.vanishing, shadowAngle, Math.PI / 2, 200,
      20, false, 10, 1, 0.5, true, 10);
    // change shape fill colors
    clouds[i].fillColor = clr;
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
    }
    while (pos.x <= width / 2) {
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


  noLoop();
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