const num_cells = 25;
const speed = 10;
const freq = 0.1;

let voronoi;

function setup() {
  createCanvas(200, 200);

  voronoi = new Voronoi(num_cells, false, false);
  
}

function draw() {
  background(0);
  
  let vel = createVector(0, 0);
  for (let i = 0; i < voronoi.seeds.length; i++) {
    vel =  p5.Vector.fromAngle(
      2 * Math.PI * noise(
        freq * voronoi.seeds[i].x, 
        freq * voronoi.seeds[i].y)
    ).mult(speed);
    voronoi.seeds[i].add(vel);
    
    if (voronoi.seeds[i].x < - width / 2) {
      voronoi.seeds[i].x += width;
    }
    if (voronoi.seeds[i].x > width / 2) {
      voronoi.seeds[i].x -= width
    }
    if (voronoi.seeds[i].y < - height / 2) {
      voronoi.seeds[i].y += height;
    }
    if (voronoi.seeds[i].y > height / 2) {
      voronoi.seeds[i].y -= height
    }
  }
  
  for (let i = -width / 2; i < width / 2; i++) {
    let j;
    let pt = createVector(i, 0);
    for (j = -height / 2; j < height / 2; j++) {
      pt.y = j;
      stroke(voronoi.get(pt));
      PPoint(pt);
    }
  }
}
