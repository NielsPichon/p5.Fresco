const backgroundClr = 'aaa';
const numClouds = 1;
const numWaves = 20;
const cloudLevels = 3;
const cloudLevelHeight = 45; 
const cloudMaxHorizontal = 200;
const cloudMargin = 90;
const cloudWidth = 500;
const cloudResolution = 8;

let clouds = [];
let waves = [];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
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
    // set shape filled
    clouds[i].noFill = false;
    // change shadow color
    clouds[i].color = [100, 100, 100, 255];
    // draw shadow
    clouds[i].drawShadow(shadowType.stippling, radians(180 + 45), Math.PI / 2, 200,
      20, false, 10, 1, 0.5, true, 10);
    // change shape fill colors
    clouds[i].fillColor = [100, 255, 100, 255];
    // chenge stroke color
    clouds[i].color = [100,255,100,255];
    // draw shape
    clouds[i].draw();
  }
  
  // Draw sea

  noLoop();
}


function createWave() {

}