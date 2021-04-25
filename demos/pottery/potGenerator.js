// returns a 3rd order polynomial in y, which goes from x0 to x1
// when y goes from 0 to 1 and has dx0 and dx1 derivative in 0 and 1
function solvePoly3(x0, x1, dx0, dx1) {
  let d = x0;
  let c = dx0;
  let a = dx1 - c - 2 * (x1 - d - c);
  let b = x1 - d - c - a;
  return [a, b, c, d]
}

class Pot extends Fresco.Shape {
  constructor(levels, maxLevels=3, maxSize=200, segmentRes=16, circleBase=false, baseWidth=0.5,
              basePower=2, baseMaxX=1.5, nextX = [], nextDX = [],) {
    let vertices = []
    // add base
    for (let i = 0; i < segmentRes; i++) {
      let x = i / (segmentRes - 1)
      let y;
      if (circleBase) {
        y = 1 - Math.sqrt(1 - Math.pow(x, basePower));
      }
      else {
        y = Math.pow(x, basePower);
      }
      // if there is more than one level, allow width modulation
      if (levels == 1) {
        x = x + baseWidth;
      }
      else {
        x = lerp(baseWidth, baseMaxX, x);
      }
      vertices.push(createPoint(x, y));
      vertices.unshift(createPoint(-x, y));
    }

    let maxX = 1 + baseWidth;
    if (levels > 1) {
      maxX = baseMaxX;
    }

    // add subsequent segments
    let startDX = 0;
    if (circleBase) {
      startDX  = 0;
    }
    else {
      startDX = (baseMaxX - baseWidth) / (basePower);
    }
    let startX = maxX;
    for (let i = 0; i < levels - 1; i++) {
      // find 4th order polynomial which goes through start and
      // end point of level with right angle
      let [a, b, c, d] = solvePoly3(startX, nextX[i], startDX, nextDX[i]);
      let x;
      for (let j = 0; j < segmentRes; j++) {
        let y = (j + 1) / segmentRes;
        x = ((a * y + b) * y + c) * y + d;
        vertices.push(createPoint(x, y + i + 1));
        vertices.unshift(createPoint(-x, y + i + 1));

        if (x > maxX) {
          maxX = x;
        }
      }
      startDX = nextDX[i];
      startX = x;
    }

    // normalize width if it is larger than one or if this is a bowl
    if (maxX > 1 || levels == 1) {
      for (let i = 0; i < vertices.length; i++) {
        vertices[i].x /= maxX;
      }
    }
    // scale the pot to size
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].x *= maxSize / maxLevels;
      vertices[i].y *= maxSize / maxLevels;
     }    

    // close shape
    vertices.push(vertices[0]);

    super(vertices);
    this.isPolygonal = true;
  }
}


class RandomPot extends Pot {
  constructor(maxLevels, maxSize, segmentRes, minBaseWidth, maxBaseWidth, baseMinX, baseMaxX, minWidth, maxWidth, cylinderProb) {
    let levels = 1 + Math.floor(random(maxLevels));
    let circleBase = random() > 0.5;
    let baseWidth = lerp(minBaseWidth, maxBaseWidth, random());
    let basePower = 1 + Math.floor(random(3));
    baseMaxX = lerp(baseMinX, baseMaxX, random()) + baseWidth;
    if (random() > 0.5) {
      basePower = 1 / basePower; 
    }

    let cylinder = random() <= cylinderProb;

    let nextX = [];
    let nextDX = [];
    for (let i = 0; i < levels - 1; i++) {
      if (cylinder) {
        nextX.push(baseMaxX);
        nextDX.push(0);
      }
      else {
        nextX.push(lerp(minWidth, maxWidth, random()));
        nextDX.push(Math.cos(lerp(Math.PI / 4, 3 * Math.PI / 4, random())));
      }
    }

    super(levels, maxLevels, maxSize, segmentRes, circleBase, baseWidth, basePower, baseMaxX, nextX, nextDX);

    this.color = colorFromHex(randomSelect(potColors));
    this.fillColor = this.color;
    this.noFill = false;
  }
}
