/**
 * @author Niels Pichon <niels.pichon@outlook.com>
 * @fileoverview Contains utilities to generate
 * structured noise of various sorts
 */

/**
 * A class for 2D/3D cellular noise
*/
Cardioid.Voronoi = class {
  /**
   * 
   * @constructor
   * @param {number} numCells Number of cells to create within the canvas.
   * If `gridBased` is true, this is interpreted as the number of cell in each axis.
   * (including the z axis if `is3D` is also true). Otherwise this is the number of points to scatter to generate cells
   * @param {boolean} [gridBased] Whether to use a grid based approach.
   * This will prevent animating individual cell centers but is much faster to compute.
   * @param {boolean} [is3D] Whether to generate 3D noise. This will allow
   * animating the z coordinate but is much slower.
   * @property {number} gridBased Whether to use a grid based approach.
   * @property {number} numCells Number of cells to create within the canvas.
   * @property {boolean} is3D Whether the noise is 3D noise.
   * @property {Array.<Cardioid.Point>} seeds Seed points used to generate the noise
   */
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
          createPoint(
            random(-width / 2, width / 2),
            random(-height / 2, height / 2), z));
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


  /**
   * Given a point position (as a vector), returns the value
   * of the voronoi noise at the specified location.
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @returns {number} Value of the voronoi noise at the specified location.
   * In practice this is the distance to the closest cell center remapped to [0, 1];
   */
  get(x, y, z=null) {
    let position = createVector(x, y, z);
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
      return minDist / this.cellSize.mag();
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
      return minDist;
    }
  }
  

  /**
   * a symetrical spherically mapped version of the
   * voronoi noise which is somewhat trippy. Works best
   * with non-cell noise
   * @param {number} x X-coordinate of the point where to query the noise
   * @param {number} y Y-coordinate of the point where to query the noise 
   * @param {number} [z] Z-coordinate of the point where to query
   * the noise. Will only be read if `this.is3D` is `true`
   * @returns {number} Value of the voronoi noise at the specified location,
   * in the [0, 1] range.
   */
  trippy(x, y, z=null) {
    let position = createVector(x, y, z=null)
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


//simple friendlier noise function which calls the perlin noise by its actual name
/**
 * Simple friendlier p5.noise function which calls the perlin noise by its actual name
 * @param {number} x X-coordinate of the point where to query the noise 
 * @param {number} y Y-coordinate of the point where to query the noise  
 * @param {number} [z] Z-coordinate of the point where to query 
 * @returns {number} Value of the perlin noise at the specified location,
 * in the [0, 1] range.
 */
function perlin(x, y=null, z=null) {
  return noise(x, y, z);
}


/**
 * Perlin noise normally leaves in the [-sqrt(N/4), sqrt(N/4)] range.
 * The p5.js implementation has naively shifted it to the [0, 1] range
 * assuming it was originally mapped to [-1, 1].
 * this function renormalizes the noise to actually have values in [0, 1].
 * See
 * <a href="https://digitalfreepen.com/2017/06/20/range-perlin-noise.html">
 * this article</a> on the topic.
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise   
 * @param {number} [z] Z-coordinate of the point where to query
 * @returns {number} Value of the normalized perlin noise at the specified
 * location, in the [0, 1] range.
 */
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


/**
 * Ridged noise is absolute value of Perlin when mapped between -1 and 1
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise   
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} Value of the ridged perlin noise at the specified location,
 * in the [0, 1] range.
 */
function ridgedNoise(x, y, z = null) {
  return Math.abs(map(noise(x, y, z), 0, 1, -1, 1));
}


/**
 * Ridged noise is absolute value of normalized Perlin noise when mapped between -1 and 1
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise   
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} Value of the ridged perlin noise at the specified location,
 * in the [0, 1] range.
 */
function normalizedRidgedNoise(x, y, z = null) {
  return Math.abs(map(normalizedPerlin(x, y, z), 0, 1, -1, 1));
}


/**
 * A discretized noise function which creates "levels".
 * Essentially we snap each noise value to the closest level.
 * @param {Function} noiseFunc A function which takes x, y, z as argument
 * and returns a noise value in the [0, 1] range
 * @param {number} levels Number of levels
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise   
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} Value of the leveled noise at the specified location, in the [0, 1] range.
 */
function leveledNoise(noiseFunc, levels, x, y, z = null) {
  return Math.floor(noiseFunc(x, y, z) * (levels + 1)) / (levels + 1);
}


/**
 * Computes the iso lines for a noise map.
 * @param {Function} noiseFunc A function which takes x, y, z as argument
 * and returns a noise value in the [0, 1] range
 * @param {number} levels Number of iso-heights
 * @param {number} step Differentiation step for detecting level changes
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise   
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} 1 if there is a level change, which is to say an iso-line,
 * 0 otherwise.
 */
function isoLine(noiseFunc, levels, step, x, y, z=null) {
  // compute leveled noise gradient 
  let dx = leveledNoise(noiseFunc, levels, x + step, y) -
    leveledNoise(noiseFunc, levels, x - step, y);
  let dy = leveledNoise(noiseFunc, levels, x, y + step) -
    leveledNoise(noiseFunc, levels, x, y - step);
  if (dx != 0 || dy != 0) {
    return 1;
  }
  else {
    return 0;
  }
}


/**
 * Computes modulo noise at the specified location. This is done by multiplying the
 * provided noise function by the number of levels and return the non-integer part.
 * @param {Function} noiseFunc A function which takes x, y, z as argument
 * and returns a noise value in the [0, 1] range
 * @param {number} levels Number of levels
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise   
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} Value of the modulo noise at the specified location, in the [0, 1] range.
 */
function moduloNoise(noiseFunc, levels, x, y, z=null) {
  return (noiseFunc(x, y, z) * levels % 1);
}


// returns a unit vector which orientation depends
// on the underlying noise
/**
 * Computes a unit vector which orientation depends on the underlying noise.
 * This is achieved by remapping the noise at the specified location to 
 * [0, 5 * 2PI]. The value of 5 is arbirtrarily chosen, but larger than 1 or 2.
 * This is because Perlin noise, as well as Simplex noise are most of the time around
 * 0.5 which would result in the generated vector often pointing in the same direction.
 * By multiplying the number of "turns" by 5, we spread the directions of the vectors.
 * @param {Function} noiseFunc A function which takes x, y, z as argument
 * and returns a noise value in the [0, 1] range
 * @param {number} x X-coordinate of the point where to query the noise
 * @param {number} y Y-coordinate of the point where to query the noise 
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {p5.Vector} p5.Vector of unit length pointing in the noise "direction".
 */
function noiseVector(noiseFunc, x, y, z=null) {
  // get random angle from noise at location
  let n = map(noiseFunc(x, y, z), 0, 1, 0, 10 * PI);
  // convert to 2D displacement vector
  return p5.Vector.fromAngle(n);
}


// distorts some noise (only supports noise types which take only x, y, z as input)
/**
 * Distorts the noise map by displacing the query location in a direction based on the
 * noise itself (#noiseCeption!).
 * @param {Function} noiseFunc A function which takes x, y, z as argument
 * and returns a noise value in the [0, 1] range
 * @param {number} amount Amount of distortion in pixels, which is to say the number
 * of pixels the query will be displaced by.
 * @param {number} x X-coordinate of the point where to query the noise
 * @param {number} y Y-coordinate of the point where to query the noise
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} Value of the distorted noise at the specified location,
 * in the [0, 1] range.
 */
function distortedNoise(noiseFunc, amount, x, y, z=null) {
  // get displacement vector
  let n = noiseVector(noiseFunc, x, y, z).mult(amount);

  // return noise value at displaced location
  return noiseFunc(x + n.x, y + n.y, z);
}


/**
 * Computes the 2D curl noise from the specified noise function. This is a purely 2D approximation.
 * @param {Function} noiseFunc A function which takes x, y, z as argument
 * and returns a noise value in the [0, 1] range
 * @param {number} step Differenciation step used to compute the gradient at the query point
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise   
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} p5.Vector representing the rotational of the noise, which is to say the "curl" noise.
 */
function curlNoise2D(noiseFunc, step, x, y, z=null) {
  // retrieve the noise gradient at location
  let n = gradient(noiseFunc, step, x, y, z);

  // return the orthogonal to the noise
  return createVector(-n.y, n.x);
}


/**
 * Computes the 3D curl noise from the specified noise function.
 * @param {Function} noiseFunc A function which takes x, y, z as argument
 * and returns a noise value in the [0, 1] range
 * @param {number} step Differenciation step used to compute the gradient at the query point
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise   
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} p5.Vector representing the rotational of the noise, which is to say the "curl" noise.
 */
function curlNoise3D(noiseFunc, step, x, y, z=null) {
  // declare fucntion to compute the noise vector of the noise field
  function vec(x0, y0, z0) {return noiseVector(noiseFunc, x0, y0, z0)};
  // compute the gradient of the noise vector
  let grad = gradientVec(vec, step, x, y, z);
  //compute the noise vector
  let n = vec(x, y, z);
  // compute the cross product of the gradient with the noise
  return grad.cross(n);
}