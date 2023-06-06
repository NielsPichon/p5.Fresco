const backgroundClr = '000';
const distance = 2; // particle movement on each frame
const noiseFreq = 0.002; // noise frequency
const rise_magnitude = 0; // how much the smoke should rise each step, w.r.t.
                          //the noise influence.
const spread = 0.3; // how much of the box in-plane area is initially filled
                    // with particles
const show_trails = false; // Whether trals should be displayed. Much slower.
const part_per_cell = 3000; // Number of particles in each box
const decay_parts = true; // Whether the number of particles should decay
                          // as depth increases
const kernel_size = 3; // number of cubes in each axis
const spacing = 0.1; // spacing between cubes as a ratio of cube size
const rotateY = 15; // Rotates the whole grid along the vertical axis. This rot will be applied first.
const rotateX = 15; // Rotates the whole grid along the horizontal axis. This rot will be applied second.
const unzoom = .7; // Global scaling to fake a zoom out
// const unzoom = .2; // Global scaling to fake a zoom out
const colors = ['fff', '888', '222']; // color for each depth


let cells = [];

function rotatePoint(point) {
  cy = Math.cos(rotateY * Math.PI / 180);
  sy = Math.sin(rotateY * Math.PI / 180);
  new_x = point.x * cy + point.z * sy;
  point.z = -point.x * sy + point.z * cy;
  point.x = new_x;

  cx = Math.cos(rotateX * Math.PI / 180);
  sx = Math.sin(rotateX * Math.PI / 180);
  new_z = point.z * cx + point.y * sx;
  point.y = -point.z * sx + point.y * cx;
  point.z = new_z;

  return point;
}


class SmokeCell extends Fresco.Collection {
  constructor(position, size, count, color) {
    super();
    this.halfsize = createPoint(width * .5, width * .5, width * .5);
    this.bottom_left = this.halfsize.copy().mult(-1);
    let cube_lines = new Fresco.Cube(
      this.bottom_left, this.halfsize).toShapes();
    cube_lines.forEach(line => this.attach(line));
    cube_lines.forEach(line => {
      line.vertices[0] = rotatePoint(line.vertices[0]);
      line.vertices[1] = rotatePoint(line.vertices[1]);
      line.color = color;
    })
    this.count = count;
    this.particles = [];
    this.spawn();
    this.particles.forEach(part => part.color = color);
    this.setScale(size);
    this.setPosition(position);
    this.seed = random() * 100000;
  }

  spawn() {
    for (let i = 0; i < this.count; i++) {
      let rx = lerp(
        this.bottom_left.x,
        this.halfsize.x,
        (1 - spread) * 0.5 + random() * spread
      );
      // let ry = this.bottom_left.y;
      let ry = lerp(
        this.bottom_left.y,
        this.halfsize.y,
        (1 - spread) * 0.5 + random() * spread
      );
      let rz = lerp(
        this.bottom_left.z,
        this.halfsize.z,
        (1 - spread) * 0.5 + random() * spread
      );
      let new_part = new Fresco.Shape([createPoint(rx, ry, rz)]);
      new_part.history = [new_part.vertices[0].copy()];
      new_part.true_pos = new_part.vertices[0].copy();
      new_part.vertices[0] = rotatePoint(new_part.vertices[0]);
      this.particles.push(new_part);
      this.attach(new_part);
    }
  }

  step() {
    this.particles.forEach(part => {
      let current_pos = part.true_pos;
      let new_pos = new Fresco.Point(noiseVector(
        noise,
        (current_pos.x + width / 2) * noiseFreq + this.seed,
        (current_pos.y + height / 2) * noiseFreq + this.seed,
        current_pos.z * noiseFreq + this.seed
      ));
      new_pos.y += rise_magnitude;
      new_pos.y *= (
        1 - (current_pos.y - this.bottom_left.y)
        / (this.halfsize.y - this.bottom_left.y)
      );
      new_pos.mult(distance).add(current_pos);
      new_pos.x = min(this.halfsize.x, max(this.bottom_left.x, new_pos.x))
      new_pos.y = min(this.halfsize.y, max(this.bottom_left.y, new_pos.y))
      new_pos.z = min(this.halfsize.z, max(this.bottom_left.z, new_pos.z))
      part.true_pos = new_pos;
      if (show_trails) {
        part.vertices.push(rotatePoint(new_pos.copy()));
      } else {
        part.vertices = [
          rotatePoint(current_pos.copy()), rotatePoint(new_pos.copy())];
      }
      part.history.push(rotatePoint(new_pos.copy()));
    });
  }
}

function setup() {
  // createCanvas(1000, 1000);
  createSVGCanvas(1000,1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  let scale_factor = 1 / (kernel_size * (1 + spacing)) * unzoom;
  let scale = createPoint(scale_factor, scale_factor, scale_factor);
  let offset = width * scale_factor * (1 + spacing);
  let start = - Math.floor(kernel_size / 2) * offset;
  for (let x = 0; x < kernel_size; x++) {
    for (let y = 0; y < kernel_size; y++) {
      for (let z = kernel_size - 1; z >= 0; z--) {
        let pos = createPoint(
          x * offset + start,
          y * offset + start,
          z * offset + start,
        );
        rotatePoint(pos);
        let num_parts = part_per_cell;
        if (decay_parts) num_parts /= (kernel_size - z);
        cells.push(
          new SmokeCell(
            pos,
            scale.copy(),
            num_parts,
            colorFromHex(colors[kernel_size - z - 1])
          )
        );
      }
    }
  }
}

// draw function which is automatically
// called in a loop
function draw() {
  background(colorFromHex(backgroundClr));
  cells.forEach(cell => {
    cell.step();
    cell.draw();
  })
}