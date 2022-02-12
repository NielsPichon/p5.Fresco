let s;

function setup() {
  createCanvas(500, 500);

  s = new Fresco.Circle(200);

  recordAnimation();
}

function draw() {
  background(0);
  s.setScaleFromScalar(Math.sin(0.01  * frameCount));
  s.draw();

  if (frameCount > 100) {
    stopRecording();
    noLoop();
  }
}
