const backgroundClr = '000';
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
    clouds[i].draw();
  }
  
  // Draw sea

  noLoop();
}


function createWave() {

}