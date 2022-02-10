const backgroundClr = '000';
const cutOff = 0.01;
const epsilon = 0.1;
const drawShapes = false;


let shapes = [];
let lightSources = [];
let rays = [];


// from  https://gist.github.com/janosh/099bd8061f15e3fbfcc19be0e6b670b9
const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]
const argMin = argFact((max, el) => (el[0] < max[0] ? el : max))


class Source {
  constructor(posX, posY, rotation, dispersion, hexColor, intensity, index=1) {
    this.position = createVector(posX, posY);
    this.hexColor = hexColor;
    this.intensity = intensity;
    this.rotation = rotation;
    this.dispersion = dispersion;
    this.index = index
  }

  shootRay() {
    let randomAngle = this.rotation - this.dispersion + random(2 * this.dispersion);
    let randomDir = p5.Vector.fromAngle(randomAngle);
    let ray = new Ray(this.position.copy(), randomDir, this.intensity, this.hexColor, this.index);
    ray.shoot();
  }
}

class Collider {
  constructor(shape, absorbtion, transparency, diffraction, index) {
    this.shape = shape;
    this.shape.isPolygonal = true; // all shapes must be polygonal
    // physics is highly stylized here with Intensity = Iabsorbed + Itransmited + Ireflected
    this.absorbtion = absorbtion; // in [0, 1], 1 meaning all energy is absorbed
    this.transparency = transparency; // in [0, 1], 1 meaning all non-absorbed energy is transmited
    this.diffraction = diffraction; // in [0, 1] where 1 means completely random bounce direction, 0 means pure reflection
    this.index = index;
  }

  draw() {
    this.shape.draw();
  }
}

class Ray {
  constructor(start, direction, intensity, hexColor, index) {
    // offset starting point by epsilon to avoid self intersection
    this.start = start.add(direction.copy().normalize().mult(epsilon));
    this.direction = direction;
    this.intensity = intensity;
    this.hexColor = hexColor;
    this.end = start;
    this.index = index;

    rays.push(this);
  }

  shoot() {
    // find intersections
    let intersections = [];
    let interpolents = [];
    let edges = [];
    let hit_shapes = [];
    shapes.forEach(s => {
      for (let i = 0; i < s.shape.vertices.length - 1; i++) {
        let [inter, _] = raySegmentIntersection(
          this.start,
          this.direction,
          s.shape.applyTransform(s.shape.vertices[i]),
          s.shape.applyTransform(s.shape.vertices[i + 1])
        );
        if (inter !== false) {
          let dist = inter.copy().sub(this.start);
          let interpolent;
          if (this.direction.x != 0) {
            interpolent = dist.x / this.direction.x;
          }
          else {
            interpolent = dist.y / this.direction.y;
          }

          intersections.push(inter);
          interpolents.push(interpolent);
          edges.push(i);
          hit_shapes.push(s);
        }
      }
    });

    // get closest intersection point
    if (interpolents.length > 0) {
      let closest_idx = argMin(interpolents);

      this.end = intersections[closest_idx];

      // compute intensity of reflected and transmitted rays
      let I_remaining = this.intensity * (1 - hit_shapes[closest_idx].absorbtion);
      let I_transmited = I_remaining * hit_shapes[closest_idx].transparency;
      let I_reflected = I_remaining - I_transmited;

      // if any of the outgoing rays have enough intensity
      if (I_reflected > cutOff || I_transmited > cutOff) {
        // normal to the intersected edge
        let normal = hit_shapes[closest_idx].shape.normalAtPoint(intersections[closest_idx], 0.1)
        // component of the incoming ray along the normal
        let dirNormal = this.direction.dot(normal);

        // reflect wrt the normal
        if (I_reflected > cutOff) {
          let diffract = 1 - random(hit_shapes[closest_idx].diffraction);
          let reflectedDir = this.direction.copy().sub(normal.copy().mult((1 + diffract) * dirNormal)).normalize();
          let reflectedRay = new Ray(
            intersections[closest_idx],
            reflectedDir,
            I_reflected,
            this.hexColor,
            this.index
          );
          reflectedRay.shoot();
        }

        // transmit ray wrt the normal
        if (I_transmited > cutOff) {
          let thetaD = Math.acos(abs(dirNormal));

          let randomReflectionAngle = -Math.PI / 2 + random(Math.PI);
          thetaD = lerp(thetaD, randomReflectionAngle, hit_shapes[closest_idx].diffraction);

          let thetaT = Math.asin(this.index * Math.sin(thetaD) / hit_shapes[closest_idx].index);
          let transmitedDir = this.direction.copy().rotate(thetaT - thetaD);
          let transmitedRay = new Ray(
            intersections[closest_idx],
            transmitedDir,
            I_transmited,
            this.hexColor,
            hit_shapes[closest_idx].index
          );
          transmitedRay.shoot();
        }
      }
    }
    else {
      // otherwise shoot ray to somewhere outside the canvas.
      // We simply take a point that is at least one canvas diagonal (+/- the start pos)
      // away along the ray direction
      let dist = width * width + height * height
      this.end = this.direction.copy().mult(dist);
    }
  }

  draw() {
    let shape = new Fresco.Line(this.start, this.end);
    shape.color = colorFromHex(this.hexColor, this.intensity * 255);
    shape.draw();
  }
}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  shapes.push(new Collider(new Fresco.Circle(100, 256), 0, 0.5, 0.1, 1.44));
  lightSources.push(new Source(-200, 0, 0, Math.PI / 4, 'f00', 0.1, 1));
  lightSources.push(new Source(200, 0, Math.PI, Math.PI / 4, '00f', 0.1, 1));
}

// draw function which is automatically
// called in a loop
function draw() {
  // shoot 1 new ray per light source
  lightSources.forEach(l => l.shootRay());

  if (drawShapes) {
    shapes.forEach(s => s.draw());
  }

  // draw all rays
  rays.forEach(r => r.draw());

  // delete the rays
  rays = [];
}