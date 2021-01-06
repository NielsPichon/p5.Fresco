let p;

const dT = 0.01;
const fireProb = 0.05;
const minFireCount = 3;
const maxFireCount = 5;

const colors = [
  [119, 118, 188, 255],
  [252, 122, 87, 255],
  [255, 251, 219, 255]
]

function setup() {
  createCanvas(1000, 1000);

  // convert points to particles and set tangential velocity
  f = new Gravity();
}

function draw() {
  background(3, 1, 44);
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }

  if (random() <= fireProb) {
    let x = random(-width / 2, width / 2);
    let y = random(-height / 2, height / 2);
    firework(x, y);
  }

  simulationStep(false, dT);
}


function firework(x, y) {
  let fireCount = Math.floor(random(minFireCount, maxFireCount + 1));
  for (let  i = 0; i < fireCount; i++) {
    // create point emiter
    p = new PointEmitter(new Point(createVector(x, y)));
    p.simulatePhysics = true;
    p.minV = createVector(-0.5, 0.2).mult(50);
    p.maxV = createVector(0.5, 1).mult(50);
    p.minLife = 0.4;
    p.maxLife = 0.6;
    p.spawnProbability = 0.2;
    p.spawnRate = 50;
    p.burst = true;
    p.leaveTrail = true;
    let t = Math.floor(random(0, colors.length));
    
    // fade the color toward the end of life
    let endCol = new Array(4);
    arrayCopy(colors[t], endCol);
    endCol[3] = 0;
    p.colorOverLife = [colors[t], endCol];
    p.colorOverLifeTime = [0, p.maxLife];
  }
}


function mouseClicked() {
  firework(mouseX - width / 2, -mouseY + height / 2)
}

function keyPressed() {
  if (key == 'p') {
    if (isLooping()) {
      noLoop();
    }
    else {
      loop();
    }
  }
}
