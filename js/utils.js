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


// utility to convert a color hex code string to RGBA
// Alpha can be specified independantly if required
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


// interpolate linearly between as many colors as provided
function colorInterp (t, colors) {
  if (t == 1) {
    return colors[colors.length - 1];
  }

  // retrieve color interval to interpolate into
  t *= colors.length - 1;
  let idx = Math.floor(t);

  // get interpolant
  t -= idx;

  let color = [0, 0, 0, leaveOpacity];
  for (let i = 0; i < 3; i++) {
    color[i] = (1 - t) * colors[idx][i] + t * colors[idx + 1][i];
  }

  return color;
}


// a function that adds a border of the specified color around the canvas
function border(thickness, color) {
  stroke(color);
  strokeWeight(thickness);
  line(0, thickness / 2, width, thickness / 2);
  line(0, height - thickness / 2, width, height - thickness / 2);
  line(thickness / 2, 0, thickness / 2, height);
  line(width - thickness / 2, 0, width - thickness / 2, height);
}