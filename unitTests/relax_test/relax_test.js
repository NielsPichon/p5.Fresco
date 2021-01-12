let s;
let pts;

const num_pts = 50;
const num_samples = 5000;

function setup() {
  createCanvas(200, 200);
  s = new SSquare();
  s.scale.mult(2);
  pts = scatter(s, num_pts, contour = false);
  for (let i = 0; i < pts.length; i++) {
    pts[i].radius = random(5, 25);
  }
}

function draw() {
  background(0);
  strokeWeight(1);

  stroke(255, 0 ,0);
  for (let i = 0; i < pts.length; i++) {
    strokeWeight(5);
    pPoint(pts[i]);
    strokeWeight(1);
    noFill();
    pCircle(pts[i], pts[i].radius);
  }
  
  relax(pts, 1, num_samples);

}

function mouseClicked() {
  pts = relax(pts, iterations=1);
}
