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