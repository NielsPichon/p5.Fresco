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

    // restart simulation with same seed
    if (key == 'r') {
      setup();
      loop();
    }
  }


// utility to convert a color hex code string to RGBA
// Alpha can be specified independantly if required
function colorFromHex(hex, A = 255) {
  let R = parseInt('0x' + hex[0] + hex[1]);
  let G = parseInt('0x' + hex[2] + hex[3]);
  let B = parseInt('0x' + hex[4] + hex[5]);
  return [R, G, B, A];
}


// The bellow function is a handmade tailored interpolant 
// between 0 and 1 in an S shaped manner (obtained by solving a 4th order 
// polynomial with 0 derivative in 0 and 1 and going through 0 and 1 at these points
// https://tinyurl.com/y23km6u5
function SCurve(t) {
  return (t * t * t * (t * (t * 6 - 15) + 10));
}


// a GLSL inspired smooth step
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}


// invert smoothstep
function invertSmoothstep(t) {
  return 0.5 - Math.sin(Math.asin(1.0 - 2.0 * t) / 3.0);
}


// a function which calls smoothstep in a loop to get steeper step
function steeperStep(t, n) {
  for (let i = 0; i < n; i++) {
    t = smoothstep(t);
  }
  return t;
}