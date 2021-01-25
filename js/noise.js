/**
 * @author Niels Pichon <niels.pichon@outlook.com>
 * @fileoverview Contains utilities to generate
 * structured noise of various sorts
 */


/**
 * Container for a `Fresco.Worley` noise class instance. Not to be tempered with unless
 * you know what you are doing.
 */
let worleyInstance=null;

/**
 * A class for 2D/3D cellular noise
*/
Fresco.Worley = class {
  /**
   * 
   * @constructor
   * @property {Array.<Fresco.Point>} seeds Seed points used to generate the noise
   */
  constructor() {
    this.scatterSeeds();
  }

  /**
   * Scatter the seeds, one per cell, in a 256 x 256 x 256 cell
   */
  scatterSeeds() {
    this.seeds = [];
    let inCellPos = createVector(0, 0, 0);
    let j = 0;
    let k = 0;
    for (let i = 0; i < 256; i++) {
      for (j = 0; j < 256; j++) {
        for (k = 0; k < 256; k++) {
          inCellPos.x = random();
          inCellPos.y = random();
          inCellPos.z = random();
          this.seeds.push(inCellPos.copy());
        }
      }
    }
  }


  /**
   * Computes the position of the point in the grid with wrapping
   * around the edges (meaning exiting right makes you enter left).
   * In practice, this returns the modulo of x with handling of negative values.
   * @param {number} x 1D point position towrap arouind the edges.
   * @returns {number} The wrapped point position
   */
  edgeWrapPosition(x) {
    while (x < 256) {
      x += 256;
    }
    return x % 256;
  }


  /**
   * Given a point position, returns the value
   * of the F1 worley noise at the specified location.
   * @param {number} x 
   * @param {number} y 
   * @param {number} [z] 
   * @returns {number} Value of the F1 worley noise at the specified location.
   * In practice this is the distance to the closest cell center remapped to [0, 1];
   */
  get(x, y, z=null) {
    let inCellPos = createVector(x, y, z);
    
    // get cell where the point lands
    let cellX = Math.floor(inCellPos.x);
    let cellY = Math.floor(inCellPos.y);

    // Retrieve the floating point part of the position
    // which is the position within a cell
    inCellPos.x -= cellX;
    inCellPos.y -= cellY;
    
    let cellZ = 0;
    if(z) {
      cellZ = Math.floor(inCellPos.z);
      inCellPos.z -= cellZ;
    }

    // arbitrary large number, larger than the diagonal of the 3 x 3 x 3 block of cells checked
    // Which is sqrt(3) in this case
    let minDist = 3;
    let X;
    let Y;
    let Z;
    let j = 0;
    let k = 0;
    let dist = 0;
    let pt;
    for (let i = -1; i < 2; i++) {
      // find the specified cell with wrapping around the edges
      X = this.edgeWrapPosition(cellX + i) * 256 * 256;
      for (j = -1; j < 2; j++) {
        Y = this.edgeWrapPosition(cellY + j) * 256;
        if (z) {
          for (k = -1; k < 2; k++) {
            Z = this.edgeWrapPosition(cellZ + k) % 256;
            pt = this.seeds[X + Y + Z].copy().add(createVector(i, j, k));
            dist = (pt.sub(inCellPos)).mag();
            if (dist < minDist) {
              minDist = dist;
            }
          }
        }
        else {
          pt = this.seeds[X + Y].copy().add(createVector(i, j, -this.seeds[X + Y].z));
          dist = (pt.sub(inCellPos)).mag();
          if (dist < minDist) {
            minDist = dist;
          }
        }
      }
    }

    // the maximum possible distance between 2 points is 1 cell diagonal
    return minDist / sqrt(2);
  }
}


/**
 * Computes the value of some F1 worley noise at a specified query point. 
 * F1 here means that the noise is computed from the distance to the nearest
 * random seed point.
 * @param {number} x X coordinate of the query point
 * @param {number} y Y coordinate of the query point
 * @param {number} [z] Z coordinate of the query point. If not specified the
 * noise will only considerthe 2D coordinates of the seeds at z = 0;
 */
function worleyNoise(x, y, z=null) {
  if (!worleyInstance) {
    worleyInstance = new Fresco.Worley();
  }
  return worleyInstance.get(x, y, z);
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

/**
 * Computes the fractal noise from a noise function
 * @param {Function} noiseFunc Noise function to use a generator for each octave layer.
 * @param {number} octaves Number of octaves, or in another words, layers of noise
 * with a higher frequency
 * @param {number} lacunarity Lacunarity describes how fast subsequent octaves fade.
 * A smaller value will mean they will be less visible faster.
 * @param {number} x X-coordinate of the point where to query the noise  
 * @param {number} y Y-coordinate of the point where to query the noise  
 * @param {number} [z] Z-coordinate of the point where to query the noise
 * @returns {number} Value of the fractal noise at the point of query in the [0,1] range.
 */
function fractalNoise(noiseFunc, octaves, lacunarity, x, y, z=null) {
  let n = 0;
  let norm = 0;
  let fade = 1;
  for (let i = 0; i < octaves; i++) {
    norm += fade;
    if (z) {
      n += fade * noiseFunc(x * (i + 1), y * (i + 1), z * (i + 1));
    }
    else {
      n += fade * noiseFunc(x * (i + 1), y * (i + 1));
    }
    fade *= lacunarity
  }

  return n /= norm;
}
