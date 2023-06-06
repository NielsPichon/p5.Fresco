const backgroundClr = '000';

const starsCount = 20;
const influence = 1.5;
const speed = 5;
const takeOffProb = 0.8;
const sameSide = false;

const drawHelpers = false;
const drawPlanets = true;

let side = Math.random() > 0.5;

let planets;
let stars;


let Planet = class extends Fresco.Circle {
  draw() {
    super.draw();
    if (drawHelpers) {
      let influenceSphere = new Fresco.Circle(this.radius * influence);
      influenceSphere.position = this.position;
      influenceSphere.color = colorFromHex('444');
      influenceSphere.draw();
    }
  }
}

let raycast = (start, dir, planet, starInluence) => {
  let [hasHit, hitPoint] = doLineIntersectCircle(
    start,
    start.copy().add(dir),
    planet.position,
    planet.radius * starInluence
  );

  if (!hasHit) return null;

  if ((hitPoint.x - start.x) / dir.x > 0) return hitPoint;

  return null;
}

let Star = class extends Fresco.Shape {
  constructor(planets) {
    let starInfluence = lerp(1, influence, random());
    let x;
    if (sameSide) {
      x = (
        planets[0].position.x
        + random() * starInfluence * planets[0].radius
      );
    } else {
      x = (
        planets[0].position.x
        + random() * 2 * starInfluence * planets[0].radius
        - starInfluence * planets[0].radius
      );
    }
    super([
      createVector(x, height / 2),
      createVector(x, height / 2 - speed),
    ])
    this.planets = planets;
    this.objective = 0;
    this.influence = starInfluence;

  }


  velocity() {
    return this.vertices.at(-1).copy().sub(this.vertices.at(-2));
  }

  step() {
    let vel = this.velocity();
    let newVtx = createPoint(this.vertices.at(-1).x, this.vertices.at(-1).y);

    if (this.objective == null || this.objective == this.planets.length - 1) {
      // just keep going
      newVtx.add(vel);
      this.vertices.push(newVtx);
      return;
    }

    let radDir = newVtx.copy().sub(
      this.planets[this.objective].position);
    let radius = radDir.mag();

    if (radius < this.planets[this.objective].radius * this.influence) {
      // orbit
      let theta = atan2(
        newVtx.y - this.planets[this.objective].position.y,
        newVtx.x - this.planets[this.objective].position.x,
      )

      let clockwise = radDir.cross(vel).z > 0;

      theta += clockwise ? speed / radius: -speed / radius;

      newVtx.x = (radius * cos(theta)
        + this.planets[this.objective].position.x);
      newVtx.y = (radius * sin(theta)
        + this.planets[this.objective].position.y);

      this.vertices.push(newVtx);

      vel = this.velocity();

      let hit = raycast(
        this.vertices.at(-1),
        vel,
        this.planets[this.objective + 1],
        this.influence
      );

      if (hit !== null && random() < takeOffProb) {
        this.objective += 1
      };

      if (drawHelpers) {
        let newLine = new Fresco.Line(
          this.vertices.at(-1),
          vel.copy().mult(100000000).add(this.vertices.at(-1))
        );
        newLine.color = colorFromHex('444');
        newLine.draw()
        if (hit !== null) {
          let lastHit = new Fresco.Point(hit);
          lastHit.color = colorFromHex('f00');
          lastHit.radius = 5;
          lastHit.draw();
        }
      }
    } else {
      // check where the start wil hit the next planet
      vel = this.velocity();
      let hit = raycast(
        this.vertices.at(-1),
        vel,
        this.planets[this.objective],
        this.influence
      );

      if (drawHelpers) {
        let newLine = new Fresco.Line(
          this.vertices.at(-2),
          vel.copy().mult(100000000).add(this.vertices.at(-1))
        );
        newLine.color = colorFromHex('444');
        newLine.draw()
        if (hit !== null) {
          let lastHit = new Fresco.Point(hit);
          lastHit.color = colorFromHex('f00');
          lastHit.radius = 5;
          lastHit.draw();
        }
      }

      // if not hit just keep going (in theory we never hit this case)
      if (hit === null) {
        newVtx.add(vel);
        this.vertices.push(newVtx);
        return;
      }

      // // find the point on the circle with the current direction
      // let velDir = vel.copy().normalize();
      // let orth = velDir.rotate(Math.PI / 2);
      // let tgt = orth.mult(
      //   this.planets[this.objective].radius * influence * 0.99).add(
      //   this.planets[this.objective].position)
      // let newVel = lerpVector(
      //   tgt.sub(this.vertices.at(-1)).normalize(), velDir, 1 - 1e-6
      // ).normalize().mult(speed);

      // newVtx.add(newVel);
      newVtx.add(vel);
      this.vertices.push(newVtx);
      return;
    }
  }
}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  planets = [];
  planets.push(new Planet(100));
  planets.at(-1).position = createVector(width / 4, height / 4);
  planets.push(new Planet(50));
  planets.at(-1).position = createVector(-width / 4, 0);
  planets.push(new Planet(125));
  planets.at(-1).position = createVector(width / 4, -height / 3);
  planets.push(new Planet(125));
  planets.at(-1).position = createVector(width / 4, -10 * height);

  stars = new Array(starsCount).fill(0).map(() => new Star(planets));
}

// draw function which is automatically
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  if (drawPlanets) planets.forEach(p => p.draw());
  stars.forEach((star) => {
    star.draw();
    star.step();
  })
}