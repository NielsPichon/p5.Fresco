let s;
let s1;
let min_r = 5;
let max_r = 30;
let num_points = 500;
let noise_freq = 1;
let aesthetic_artifacts = false;

function setup() {
  createCanvas(200, 200);

  s = new Fresco.Circle();
  s.scale.mult(0.5);
  background(0);
}

function draw() {
  strokeWeight(1);
  if (aesthetic_artifacts) {
    if (s1) {
      erase(0);
      s1.draw();
      noErase();
    }
  }
  else {
    background(0);
  }

  s.draw();
  step();
}


function step() {
  s1 = s.copy();
  s = resample(s, num_points);
  
  for (let i = 0; i < num_points; i++) {
    s.vertices[i].radius = min_r +
      noise(noise_freq * s.vertices[i].x,
            noise_freq * s.vertices[i].y) *
      (max_r - min_r);
  }

  s.vertices = relax(s.vertices, 1);  
}
