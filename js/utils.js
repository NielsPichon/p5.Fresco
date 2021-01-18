/**
 * @author Niels Pichon <niels.pichon@outlook.com>
 * @fileoverview Various utility functions to make
 * procedural art generation easier.
 */

/**
 * <a href="https://github.com/spite/ccapture.js">CCapture</a> object which allows for recording animations 
 */
let recorder;

/**
 * The random seed used in the sketch
 */
let seed;

/**
 * Overide of the p5 keyPressed function which handles various  key presses.
 * * Pausing with the p and space keys
 * * Saving the current frame to png with the s key
 * * Right arrow key will draw one frame.
 * * Display/hide the noise seed with n
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

    // Draw one frame
    if (key == 'ArrowRight') {
      redraw();
    }

    // Stop recording and save it
    if (key == 'F1') {
      stopRecording();
    }

    // n like noise to display the  
    if (key == 'n') {
      showSeed();
    }
}


/**
 * Displays the random number generator seed in a
 * pannel, or hides it if already displayed  
 */
function showSeed() {
  let seedDisplay = document.getElementById('seed')
  if (seedDisplay){
    seedDisplay.remove();
  }
  else {
    seedDisplay =  document.createElement('div');
    if (!seed) {
      seedDisplay.innerText = "undifined seed";
      console.log("Seed was not set. Consider calling `setSeeds()`")
    }
    else {
      seedDisplay.innerText = "Seed: " + seed.toFixed();

    }
    
    seedDisplay.id = "seed";
    seedDisplay.style = "position:absolute;top:10;left" +
      ":10;padding:5px 10px;background-color:green;color:#fff;";
    document.body.append(seedDisplay);
  }
}


/**
 * Sets the seed for the random number generator and noise generator.
 * 
 * NOTE: It seems that under the hood p5 uses the native js random
 * number genrator if no seed is set. This generator does not allow
 * to set a seed but is somewhat faster.
 * @param {number} [newSeed] If specified, this will set the seed for 
 * both the random number generator and the noise generator. Otherwise
 * it will use a random seed. 
 */
function setSeed(newSeed=null) {
  // set the seed or generate a random new one
  if (newSeed) {
    seed = newSeed;
  }
  else {
    // set random seed in [0, 1e4]
    seed = Math.floor(Math.random() * 1e4);
  }

  // Set the seeds
  randomSeed(seed);
  noiseSeed(seed);
}

/**
 * Creates a recorder and sets up auto recording. To stop the recording, use `stopRecording`
 * This uses <a href="https://github.com/spite/ccapture.js">CCapture</a> under the hood.
 * @param {number} [fps] Frame rate of the recorded animation.
 * @param {boolean} [video] Whether to export individual frames of the video or directly a video file
 * This will also set the draw call frequency for better pre-viz.
 * WARNING! Video export is not yet implemented.
 */
function recordAnimation(fps=60, video=false) {
  // create a recorder
  if (video) {
    throw "not yet implemented"
    recorder = new CCapture({
      format: 'ffmpegserver',
      framerate: fps,
      extension: ".mp4",
      codec: "mpeg4"});
  }
  else {
    recorder = new CCapture({ format: 'png', framerate: fps});
  }

  // set draw framerate to capture framerate
  frameRate(fps);

  // Override the draw function to add frame recording to it
  let drawCopy = draw;
  let drawAndRecord = function () {
    if (frameCount == 1) {
      // start the recording
      recorder.start(); 
    }
    document.getElementById('rec').innerText = "Recording... " + (frameCount / fps).toFixed(1) + "s"; 
    drawCopy();
    recorder.capture(document.getElementById('defaultCanvas0'));
  }
  draw = drawAndRecord;

  // Add record overlay
  let recDisplay =  document.createElement('div');
  recDisplay.innerText = "Recording...";
  recDisplay.id = "rec";
  recDisplay.style = "position:absolute;top:10;left" +
    ":10;padding:5px 10px;background-color:green;color:#fff;";
  document.body.append(recDisplay);

}

/**
 * Stops the recording and saves it
 */
function stopRecording() {
  if (recorder) {
    recorder.stop();
    recorder.save();
    document.getElementById('rec').remove();
  }
  else {
    throw "No recorder was created"
  }
}


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
 * <a href="https://tinyurl.com/y23km6u5">link</a> to see what the curve looks like.
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