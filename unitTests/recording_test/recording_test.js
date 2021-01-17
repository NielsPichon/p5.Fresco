let s;

function setup() {
  createCanvas(500, 500);

  s = new Fresco.Circle(200);

  recordAnimation(60, true);
}

function draw() {
  background(0);
  s.setScale(Math.sin(0.01  * frameCount));
  s.draw();

  if (frameCount > 100) {
    stopRecording();
    noLoop();
  }
}
