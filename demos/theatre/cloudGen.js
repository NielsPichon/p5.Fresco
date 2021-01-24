let prevClrIdx = -1;

function createCloud(angularPosition) {
    let vertices = [];
  
    // Initiate point
    vertices.push(createPoint(0, cloudLevelHeight));
    let vertex = createPoint(0, cloudLevelHeight);
  
    // Create left side of the cloud
    let leftOrRight;
    let maxRight = vertex.x;
    let maxLeft = vertex.x;
    let firstDirection;
    for (let i = 0; i < cloudLevels; i++) {
      // Choose left or right
      let previousDir = leftOrRight;
      leftOrRight = randomDirection();
  
      if (i > 0) {
        // move up a half circle
        if (previousDir == leftOrRight) {
          sPath(1, previousDir, vertex, vertices);
        }
        else {
          halfCircle(1, previousDir, vertex, vertices);
        }
      }
      else {
        firstDirection = leftOrRight;
        vertices[0].x += leftOrRight * cloudLevelHeight * 0.5;
      }
  
      // Move horizontally.
      moveHorizontal(leftOrRight, vertex, vertices, 2 * cloudLevelHeight,
          cloudMaxHorizontal - 2 * cloudLevelHeight);
  
      // If move right, check if new position is right of max right
      // If so, store current position as max right
      if (leftOrRight > 0 && vertex.x > maxRight) {
        maxRight = vertex.x;
      }
      // If move left, check if new position is left of max left
      // If so, store current position as max left
      if (leftOrRight < 0 && vertex.x < maxLeft) {
        maxLeft = vertex.x;
      }
    }
  
    // If last move is left, then go up
    if (leftOrRight < 0) {
      halfCircle(1, -1, vertex, vertices);
    }
  
    // Minimum displacement to reach the right most position
    let leftCap = maxRight + cloudMargin;
    let horizontal = leftCap - vertex.x;
  
    // Move right 
    moveHorizontal(1, vertex, vertices, horizontal, horizontal + cloudMaxHorizontal);
    let topMost = vertex.y;
    maxRight = vertex.x;
    leftOrRight = 1;
  
    // Create right side of the cloud
    for (let i = 0; i < cloudLevels; i++) {
      
      let previousDir = leftOrRight
      // Choose direction. If already max Left, can only move right.
      // Else choose randomly.
      if (vertex.x - leftCap < cloudMargin) {
        leftOrRight = 1
      } else {
        leftOrRight = randomDirection();
      }
  
      // move down a half circle
      if (previousDir == leftOrRight) {
        sPath(-1, previousDir, vertex, vertices);
      }
      else {
        halfCircle(-1, previousDir, vertex, vertices);
      }
      
      // Move horizontally.
      moveHorizontal(leftOrRight, vertex, vertices, 2 * cloudLevelHeight, cloudMaxHorizontal, leftCap);
  
      // If move right, check if new position is right of max right
      // If so, store current position as max right
      if (leftOrRight > 0 && vertex.x > maxRight) {
        maxRight = vertex.x;
      }
      // If move left, check if new position is left of max left
      // If so, store current position as max left
      if (leftOrRight < 0 && vertex.x < maxLeft) {
        maxLeft = vertex.x;
      }
    }
  
    // If last move is right, then down
    if (leftOrRight > 0) {
      // Move down 
      halfCircle(-1, 1, vertex, vertices);
      leftOrRight = 0; // prevent further offset
     }
  
    // if higher than start point, move down
    if (vertex.y > 0) {
      // Move down
      if (leftOrRight == -1) {
        sPath(-1, leftOrRight, vertex, vertices);
      }
      else {
        halfCircle(-1, leftOrRight, vertex, vertices);
      }
    }
  
    // move left to start point absiss
    let bottomMost = vertex.y; 
    vertex.x = cloudLevelHeight * 0.5;
    vertices.push(vertex.copy());
    
    //if lower than start point, move up
    if (vertex.y < 0) {
      if (forbidSquareClouds) {
        return createCloud(angularPosition);
      }
      botQuarterCircle(1, -1, vertex, vertices);
      vertex.y = cloudLevelHeight * 0.5;
      vertices.push(vertex.copy());
      if (firstDirection == -1) {
        topQuarterCircle(1, 1, vertex, vertices);
      }
      else {
        topQuarterCircle(1, -1, vertex, vertices);
      }
    }
    else {
      if (firstDirection == -1) {
        sPath(1, -1, vertex, vertices);
      }
      else {
        halfCircle(1, -1, vertex, vertices);
      }
    }

    // close shape
    vertices.push(vertices[0].copy());
  
    // center cloud and scale so that it that it always is of set width
    let scaleRatio = cloudWidth / (maxRight - maxLeft);
    let offsetX = (maxRight + maxLeft) / 2;
    let offsetY = (topMost + bottomMost) / 2;
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].x -= offsetX;
      vertices[i].y -= offsetY;
      vertices[i].x *= scaleRatio;
      vertices[i].y *= scaleRatio;
    }
  
    // Create cloud shape
    let cloud = new Fresco.Shape(vertices);
    
    // set random color (but different from previous cloud)
    let clrIdx = prevClrIdx;
    while (clrIdx == prevClrIdx) {
      clrIdx = Math.floor(random(cloudsClr.length));
    }
    prevClrIdx = clrIdx;
    cloud.color = colorFromHex(cloudsClr[clrIdx]);
    cloud.fillColor = cloud.color;
    cloud.noFill = false;

    // set shape as polygonal
    cloud.isPolygonal = true;

    // set random position along border 
    cloud.position = p5.Vector.fromAngle(
      angularPosition);
    
    let radius;
    // assuming the angular position is between [- PI /4, 5 PI/4]
    // we compute the distance the edge.
    if (angularPosition > 3 * Math.PI / 4 ||
      angularPosition < Math.PI / 4) {
        radius = width * 0.5 / Math.abs(Math.cos(angularPosition));
    }
    else {
      radius = height * 0.5 / Math.abs(Math.sin(angularPosition));
    }
    // choose random position, but more towards the edge
    let t = random();
    t = 1 - t * t;
    t = (1 - t) * (radius -
    cloudsBorderThickness) + t * radius;
    cloud.position.mult(t);

    // choose random scale
    cloud.setScale(random(cloudMinScale, cloudMaxScale));
  
    return cloud;
  }
  
  
  function randomDirection(){
    if (random() > 0.5) {
      return 1;
    }
    return -1;
  }
  
  
  function halfCircle(verticalDirection, horizontalDirection,
    vertex, vertices) {
    botQuarterCircle(verticalDirection, horizontalDirection,
        vertex, vertices);
    topQuarterCircle(verticalDirection, horizontalDirection,
        vertex, vertices);
  }
  
  
  function botQuarterCircle(verticalDirection, horizontalDirection,
    vertex, vertices) {
    let x0 = vertex.x;
    let y0 = vertex.y + verticalDirection * cloudLevelHeight * 0.5;
    quarterCircle(- Math.PI / 2, x0, y0, verticalDirection,
        horizontalDirection, vertex, vertices);
  }
  
  
  function topQuarterCircle(verticalDirection, horizontalDirection,
    vertex, vertices) {
    let x0 = vertex.x - horizontalDirection * cloudLevelHeight * 0.5;
    let y0 = vertex.y;
    quarterCircle(0, x0, y0, verticalDirection,
        horizontalDirection, vertex, vertices);
  }

  
  function quarterCircle(phase, x0, y0, verticalDirection,
    horizontalDirection, vertex, vertices) {
    for (let i = 0; i < cloudResolution; i++){
        vertex.x = Math.cos(phase + (i + 1) / cloudResolution * Math.PI / 2) *
          horizontalDirection * cloudLevelHeight * 0.5 + x0;
        vertex.y = Math.sin(phase + (i + 1) / cloudResolution * Math.PI / 2) *
          verticalDirection * cloudLevelHeight * 0.5 + y0;
    
        vertices.push(vertex.copy());
      }    
  }
  
  
  function sPath(verticalDirection, horizontalDirection,
    vertex, vertices) {
    let x0 = vertex.x;
    let y0 = vertex.y + verticalDirection * cloudLevelHeight * 0.5;
    quarterCircle(-Math.PI / 2, x0, y0, verticalDirection, horizontalDirection, vertex, vertices);
    x0 += horizontalDirection * cloudLevelHeight;
    quarterCircle(0, x0, y0, verticalDirection, -horizontalDirection, vertex, vertices);
  }
  
  
  function moveHorizontal(direction, vertex, vertices, minDist, maxDist, leftCap=null) {
    // The minimal displacement has to be at least equal to the minimum up displacement
    let horizontal = random(minDist, maxDist);
    vertex.add(createVector(horizontal * direction, 0));
  
    // make sure the point stays in bounds
    if (leftCap) {
      vertex.x = Math.max(vertex.x, leftCap);
    }
  
    vertices.push(vertex.copy());
  }