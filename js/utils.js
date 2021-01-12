/**
 * Overide of the p5 keyPressed fucntion which handles pausing with
 * the p and space keys, and saving the current frame to png
 * with the s key.
 */
function keyPressed() {
    // pause/unpause
    if (key == 'p' || key == ' ') {
      if (isLooping()) {
        noLoop();
      }
      else { 
        loop();
      }
    }

    // save current frame to png
    if (key == 's') {
      saveCanvas('canvas', 'png');
    }
}


// 
// Alpha can be specified independantly if required
/**
 * Utility to convert a color hex code string to RGBA
 * @param {string} hex Hex code 
 * @param {number} [A] Opacity, between 0 and 255;
 * @returns {Array.<number>} RGBA color defined as an array of
 * 4 numbers in the [0, 255] range.
 */
function colorFromHex(hex, A = 255) {
  let R, G, B;
  if (hex.length == 6) {
    R = parseInt('0x' + hex[0] + hex[1]);
    G = parseInt('0x' + hex[2] + hex[3]);
    B = parseInt('0x' + hex[4] + hex[5]);
  }
  else if (hex.length == 3) {
    R = parseInt('0x' + hex[0] + hex[0]);
    G = parseInt('0x' + hex[1] + hex[1]);
    B = parseInt('0x' + hex[2] + hex[2]);
  }
  else {
    throw 'Hex color code expects 6 or 3 characters'
  }
  return [R, G, B, A];
}


/**
 * Handmade tailored interpolant between 0 and 1 in an S shaped manner
 * (obtained by solving a 4th order polynomial with 0 derivative in 0
 * and 1 and going through 0 and 1 at these points. Follow the following
 * [link](https://tinyurl.com/y23km6u5) to see what the curve looks like.
 * @param {number} t Value in range [0, 1] to evaluate the S-curve at
 * @returns {number} Value in the [0, 1] range of the S-curve evaluated from the
 * specified value
 */
function sCurve(t) {
  return (t * t * t * (t * (t * 6 - 15) + 10));
}


/**
 * A smooth step, implemented from the GLSL smoothstep equation
 * @param {number} t Value in range [0, 1] to evaluate the smoothstep at
 * @returns {number} Value in the [0, 1] range of the smoothstep evaluated from the
 * specified value
 */
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}


/**
 * Evaluates an invert smoothstep at the specified absciss.
 * @param {number} t Value in range [0, 1] to evaluate the smoothstep at
 * @returns {number} Value in the [0, 1] range of the invert smoothstep evaluated from the
 * specified value
 */
function invertSmoothstep(t) {
  return 0.5 - Math.sin(Math.asin(1.0 - 2.0 * t) / 3.0);
}


/**
 * A function which calls smoothstep in a loop to get steeper step.
 * @param {number} t Value in range [0, 1] to evaluate the smoothstep at
 * @param {number} n Number of iterations. The higher, the steeper the curve
 * @returns {number} Value in the [0, 1] range of the steeper step evaluated from the
 * specified value
 */
function steeperStep(t, n) {
  for (let i = 0; i < n; i++) {
    t = smoothstep(t);
  }
  return t;
}


// 
/**
 * Linearly interpolates between as many colors as provided
 * @param {number} t Interpolant, in the [0, 1] range
 * @param {Array.<Array.<number>>} colors Array of RGBA colors (represented as individual arrays of 4 numbers)
 * @returns {Array.<number>} RGBA color as an array of 4 numbers in the [0, 255] range
 */
function colorInterp (t, colors) {
  if (colors.length == 1) {
    return colors[0];
  }
  if (t <= 0) {
    return colors[0];
  }
  if (t >= 1) {
    return colors[colors.length - 1];
  }

  // retrieve color interval to interpolate into
  t *= colors.length - 1;
  let idx = Math.floor(t);

  // get interpolant
  t -= idx;

  let color = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    color[i] = (1 - t) * colors[idx][i] + t * colors[idx + 1][i];
  }

  return color;
}


// a function that adds a border of the specified color around the canvas
/**
 * Draws some borders on top of the current canvas.
 * @param {number} thickness Thickness of the borders in pixels. 
 * @param {Array.<number>} color RGBA color of the border, represented as an
 * array of 4 numbers in the [0, 255] range
 */
function border(thickness, color) {
  stroke(color);
  strokeWeight(thickness);
  line(0, thickness / 2, width, thickness / 2);
  line(0, height - thickness / 2, width, height - thickness / 2);
  line(thickness / 2, 0, thickness / 2, height);
  line(width - thickness / 2, 0, width - thickness / 2, height);
}


/**
 * Computes the squared distance between to points. This allows for
 * faster length comparison over the non-squared version
 * @param {p5.Vector} pt1 point 1 
 * @param {p5.Vector} pt2 point 2
 * @returns {number} Distance squared between the 2 points 
 */
function distSq(pt1, pt2) {
  const dx = pt1.x - pt2.x;
  const dy = pt1.y - pt2.y;
  return dx * dx + dy * dy;
}


/**
 * Computes the 2D gradient (in the xy plane) of a given 1D function
 * @param {Function} func Function to compute the gradient of.
 * It should take as argument (x, y, [z]) and return a 1D value
 * @param {number} step Differenciation step
 * @param {number} x X-coordinate of the point to evaluate the gradient at
 * @param {number} y Y-coordinate to evaluate the gradient at
 * @param {number} [z] Z-coordinate to evaluate the gradient at
 * @returns {p5.Vector} Gradient of the function at the specified point
 */
function gradient(func, step, x, y, z=null) {
  let dx = (func(x + step, y, z) - func(x - step, y, z)) / step; 
  let dy = (func(x, y + step, z) - func(x, y - step, z)) / step;
  return createVector(dx, dy); 
}


/**
 * Computes the 2D gradient (in the xy plane) of a given 1D function
 * @param {Function} func Function to compute the gradient of.
 * It should take as argument (x, y, [z]) and return a p5.Vector.
 * @param {number} step Differenciation step
 * @param {number} x X-coordinate of the point to evaluate the gradient at
 * @param {number} y Y-coordinate to evaluate the gradient at
 * @param {number} [z] Z-coordinate to evaluate the gradient at
 * @returns {p5.Vector} Gradient of the function at the specified point
 */
function gradientVec(func, step, x, y, z=null) {
  let dx = func(x + step, y, z).sub(func(x - step, y, z)).div(step); 
  let dy = func(x, y + step, z).sub(func(x, y - step, z)).div(step);
  return dx.add(dy); 
}