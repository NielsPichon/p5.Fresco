// Input sketch parameters here
const dt = 1; // time step between 2 simulation steps
//


function setup() {
  createCanvas(1000, 1000);
}

// draw function which is automatically 
// called in a loop
function draw() {
  background(0);
  step(dt);
}

// function called to move one step in the simulation
function step(dt = 1) {
}
