s = [];
s2 = [];

// debug function to draw points along a catmullRom spline
function debugDrawCatmullRom(A, resolution) {
  for (let k = 0; k < A.vertices.length - 1; k++) {
    p0 = A.applyTransform(A.vertices[max([0, k - 1])]);
    p1 = A.applyTransform(A.vertices[k]);
    p2 = A.applyTransform(A.vertices[k + 1]);
    p3 = A.applyTransform(
      A.vertices[min([k + 2, A.vertices.length - 1])]);
    
    if (k == 0 && A.vertices[0].equals(
      A.vertices[A.vertices.length - 1])) {
      p0 = A.applyTransform(
        A.vertices[A.vertices.length - 2]);
    }
    if(k == A.vertices.length - 2 &&
       A.vertices[0].equals(A.vertices[A.vertices.length - 1])) {
      p3 = A.applyTransform(A.vertices[1]);
    }
    
    let [a, b, c, d] = catmullRom(p0, p1, p2, p3);

    for (let i = 0; i < resolution; i++) {
      let t = i / (resolution - 1);
      let nu_pt = a.copy().mult(t * t * t).add(
        b.copy().mult(t * t)).add(
        c.copy().mult(t)).add(d);
      pPoint(nu_pt);
    }
  }
}


function setup() {
  createCanvas(400, 400);
  s = new SSquare();
  s.isPolygonal = false
  s2 = s.copy();
  s2.scale.mult(1.2);
  s2.position.add(10, 10);
  s2.rotation = PI / 4;
  s2.stroke = [255, 0, 0, 255];
  s2.isPolygonal = false;
}


function draw() {
  background(0);
  s.draw();
  s2.draw();
  stroke(0, 255, 0, 255);
  strokeWeight(4);
  debugDrawCatmullRom(s, 5);
  stroke(0, 0, 255, 255);
  debugDrawCatmullRom(s2, 5);
  
  noLoop();
}