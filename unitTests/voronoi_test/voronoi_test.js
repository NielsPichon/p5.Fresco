let num_cells = 5;
let gridBased = true;
let is3D = false;
let speed = 1;

let voronoi;
let t = 0;

function setup() {
  createCanvas(200, 200);

  voronoi = new Cardioid.Voronoi(num_cells, gridBased, is3D);
}

function draw() {
  background(0);
  if (is3D) {
    t += speed;
  }
  
  for (let i = -width / 2; i < width / 2; i++) {
    let j;
    let pt = createVector(i, 0, t);
    for (j = -height / 2; j < height / 2; j++) {
      pt.y = j;
      stroke(voronoi.get(pt.x, pt.y) * 255);
      drawPoint(pt);
    }
  }
  
  
  if (!is3D){
    noLoop();
  }
}
