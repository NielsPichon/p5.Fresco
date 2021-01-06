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