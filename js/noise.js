// a class for 2D/3D cellular noise
// If gridBased is true, numCells x numCells square
// boxes are generated and one seed per cell is placed.
// This will prevent animating the seeds themselves,
// but will result in a nicer looking noise, which will 
// scale better with the number of seeds.
// Else, numCells seeds are randomly placed in the canvas.
// If is3D is set, the points will be scattered in the
// z direction as well (numCells of them if using grid_based noise)
// and the z direction will also be used for computing the noise
// value, allowing for animating the z direction if the noise
class Voronoi {
  constructor(numCells, gridBased = false, is3D=false) {
    this.gridBased = gridBased;
    this.numCells = numCells;
    this.is3D = is3D;
    this.seeds = [];
    
    if (!this.gridBased) {
      let z = 0;
      const zDim = max([width, height]);
      for (let i = 0; i < numCells; i++) {
        if (is3D) {
          z = random(zDim);
        }
        append(
          this.seeds,
          new Point(createVector(
            random(-width / 2, width / 2),
            random(-height / 2, height / 2), z)));
      }
    }
    else {
      let xDim = width / numCells;
      let yDim = height / numCells;
      let zDim = 0;
      if (is3D) {
        zDim = max([width, height]) / numCells;
      }
      this.cellSize = createVector(xDim, yDim, zDim);
      let inCellPos = createVector(0, 0, 0);
      let j = 0;
      let k = 0;
      for (let i = 0; i < numCells; i++) {
        for (j = 0; j < numCells; j++) {
          if (is3D) {
            for (k = 0; k < 256; k++) {
              inCellPos.x = random();
              inCellPos.y = random();
              inCellPos.z = random();
              append(
                this.seeds,
                inCellPos.copy().mult(this.cellSize));
            }
          }
          else {
            inCellPos.x = random();
            inCellPos.y = random();
            append(
              this.seeds,
              inCellPos.copy().mult(this.cellSize));
          }
        }
      }
    }
  }

  // given a point position (as a vector), returns the value
  // of the voronoi noise at the specified location.
  get(position) {
    if (this.gridBased) {
      // Retrieve the position modulo the window size
      let inCellPos = position.copy();
      inCellPos.x = (inCellPos.x +
        (Math.floor(Math.abs(inCellPos.x / width)) + 1) *
        width) % width;
      inCellPos.y = (inCellPos.y +
        (Math.floor(Math.abs(inCellPos.y / height)) + 1) *
        height) % height;
      
      // get cell where the point lands
      let cellX = Math.floor(inCellPos.x / this.cellSize.x);
      let cellY = Math.floor(inCellPos.y / this.cellSize.y);
      
      inCellPos.x -= cellX * this.cellSize.x;
      inCellPos.y -= cellY * this.cellSize.y;
      
      let cellZ = 0;
      if(this.is3D) {
        inCellPos.z = (inCellPos.z +
          (Math.floor(Math.abs(
          inCellPos.z / 256 / this.cellSize.z)) + 1) *
          256 * this.cellSize.z) % (256 * this.cellSize.z);
        cellZ = Math.floor(inCellPos.z / this.cellSize.z);
        inCellPos.z -= cellZ * this.cellSize.z;
      }

      let minDist = width * width + height * height;
      let Y;
      let Z;
      let j = 0;
      let k = 0;
      let dist = 0;
      let pt;
      let X;
      for (let i = -1; i < 2; i++) {
        let X = ((cellX + i + this.numCells) % this.numCells) *
            this.numCells;
        for (j = -1; j < 2; j++) {
          Y = (cellY + j + this.numCells) % this.numCells;
          if (this.is3D) {
            for (k = -1; k < 2; k++) {
              Z = ((cellZ + k + 256) % 256);
              pt = this.seeds[(X + Y) * 256 + Z].copy().add(
                this.cellSize.copy().mult(createVector(i, j, k)));
              dist = (pt.sub(inCellPos)).mag();
              if (dist < minDist) {
                minDist = dist;
              }
            }
          }
          else {
            pt = this.seeds[X + Y].copy().add(
              this.cellSize.copy().mult(createVector(i, j)));
            dist = (pt.sub(inCellPos)).mag();
            if (dist < minDist) {
              minDist = dist;
            }
          }
        }
      }
      return minDist / this.cellSize.mag() * 255;
    }
    else {
      let minDist = width * width + height * height;
      let dist = 0;
      let seed;
      
      // compute the "normal" of at the location of the query
      let theta = Math.acos(position.x / width * 2);
      let phi = Math.acos(position.y / height * 2);
      const n1 = p5.Vector.fromAngles(theta, phi);
      let n2;
      for (let  i = 0; i < this.seeds.length; i++) {
        // we compute the great-circle distance from the 
        // normal at each point and retrieving the arccos of the
        // dot product of the normals (the normals are computed)
        // assuming we go around the unit circle from left to right
        // of the image
        // see https://preview.tinyurl.com/y7lb9tpz
        seed = this.seeds[i].position();
        theta = Math.acos(seed.x / width * 2);
        phi = Math.acos(seed.y / height * 2);
        let n2 = p5.Vector.fromAngles(theta, phi);
        
        dist = Math.abs(Math.acos(n1.dot(n2)));

        if (dist < minDist) {
          minDist = dist;
        }
      }
      return minDist * 255;
    }
  }
  
  // a symetrical spherically mapped version of the
  // voronoi noise which is somewhat trippy. Works best
  // with non-cell noise
  trippy(position) {
    let minDist = width * width + height * height;
    let dist = 0;
    let seed;
      
    // compute the "normal" of at the location of the query
    let theta = Math.acos(Math.abs(position.x / width));
    let phi = Math.acos(Math.abs(position.y / height));
    const n1 = p5.Vector.fromAngles(theta, phi);
    let n2;
    for (let  i = 0; i < this.seeds.length; i++) {
      // we compute the great-circle distance from the 
      // normal at each point and retrieving the arccos of the
      // dot product of the normals (the normals are computed)
      // assuming we go around the unit circle from left to right
      // of the image
      // see https://preview.tinyurl.com/y7lb9tpz
      seed = this.seeds[i].position();
      theta = Math.acos(Math.abs(seed.x / width));
      phi = Math.acos(Math.abs(seed.y / height));
      let n2 = p5.Vector.fromAngles(theta, phi);
      
      dist = Math.abs(Math.acos(n1.dot(n2)));
      
      if (dist < minDist) {
        minDist = dist;
      }
    }
    return minDist * 255;    
  }
}


// Perlin noise normally leaves in the [-sqrt(N/4), sqrt(N/4)] range.
// The p5.js implementation has naively shifted it to the [0, 1] range
// assuming it was originally mapped to [-1, 1].
// this function renormalizes the noise to actually have values in [0, 1];
// see https://digitalfreepen.com/2017/06/20/range-perlin-noise.html
function normalizedPerlin(x, y, z = null) {
  if (z) {
    let n = noise(x, y, z);
    return map(n, -sqrt(3) / 4  + 0.5, sqrt(3) / 4 + 0.5, 0, 1);
  }
  else {
    let n = noise(x, y);
    return map(n, (-1 + sqrt(2)) / (2 * sqrt(2)), (1 + sqrt(2)) / (2 * sqrt(2)), 0, 1);
  }
}


// ridged noise is absolute value of perlin when mapped between -1 and 1
function ridgedNoise(x, y, z = null) {
  return Math.abs(map(noise(x, y, z), 0, 1, -1, 1));
}


// normalized ridged noise
function normalizedRidgedNoise(x, y, z = null) {
  return Math.abs(map(normalizedPerlin(x, y, z), 0, 1, -1, 1));
}