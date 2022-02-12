const backgroundClr = '000';

const gapThickness = 10; // gap size inside the squares. 5 looks nice on a regular grid, 10 on a recursive grid
const showText = false; // whether to display the seed below each tile. Not available in recursive tiling.

const crossHatch = true; // whether to cross hatch some of the pieces
const hatchAngle = Math.PI / 4; // hatching direction
const interHatch = 8.4; // distance between hatches

const resX = 5; // number of tiles on the horizontal axis. Use 10 for a filled grid (==width / 100)
const resY = 6; // number of tiles on the vertical axis. Use 14 for a roughly filled grid (~=height / 100)

const tileRecursive = true; // if true, the tiling will be on a multi-scale grid rather than a regular grid
const minRecursiveDepth = 2; // Max recursion depth. The larger, the smaller the largest cells.
const maxRecursiveDepth = 4; // Max recursion depth. The larger, the smaller the smallest cells.
const fillRecursiveTiles = true; // whether to try to fill the recursive grid cells
const recursiveMargins = 8; // if filling the grid cells, apply this margin in each cell first

const drawingSeed = null;

let tiler;

class Tile extends Fresco.Collection {
  constructor(lineNumber = 2, gap = 0, showText = true, showLinesAnyway = false) {
    super();
    if (Math.floor(lineNumber) != lineNumber) {
      console.log('Don\'t be a moron!');
      return;
    }
    this.lineCombination = [];
    this.square = new Fresco.Square(100);
    if (gap == 0) {
      this.attach(this.square);
    }
    this.throughCenter = false;
    this.stopAtCenter = false;
    this.lines = [];
    this.name = '';

    for (let i = 0; i < lineNumber; i++) {
      let nuLine = this.generateLine(i == lineNumber - 1);
      if (nuLine == null) {
        break;
      }
      if (gap == 0 || showLinesAnyway) {
        this.attach(nuLine);
      }
      this.lines.push(nuLine);
    }

    if (showText) {
      let textShapes = Fresco.Futural.drawText(this.name, 4, createVector(0, -75), true, false);
      textShapes.forEach(s => {
        this.attach(s);
      })
    }

    if (gap > 0) {
      this.cutShape(gap);
      if (crossHatch) {
        let hatches = this.objects[this.objects.length - 1].hatchFill(hatchAngle, interHatch);
        hatches.forEach(h => this.attach(h));
      }
    }
  }

  generateLine(isLast){
    let startPoint;
    let endPoint;
    let unique = false;
    let combination = '';
    let revertCombination = '';
    let counter = 0;

    let bufferThroughCenter = this.throughCenter;
    let bufferStopAtCenter = this.stopAtCenter;

    while (!unique && counter < 10) {
      this.throughCenter = bufferThroughCenter;
      this.stopAtCenter = bufferStopAtCenter;
      counter++;
      combination = '';
      // Generate first point
      let isEdgeMiddle = random() < 0.5;
      let vtxIdx = randomInt(4);
      if (isEdgeMiddle) {
        startPoint = this.getEdgeMiddle(vtxIdx);
        combination += vtxIdx + 'e';
      }
      else {
        startPoint = this.square.vertices[vtxIdx].copy();
        combination += vtxIdx + 'a';
      }

      // Generate second point
      let vtxType = randomInt(3);
      let forceCenter = false;
      if (isLast && !this.throughCenter) {
        if (!this.stopAtCenter) {
          vtxType = randomInt(2);
        }
        else if (isEdgeMiddle) {
          vtxType = randomSelect([0, 2]);
          forceCenter = true;
        }
        else {
          vtxType = randomInt(1, 3);
          forceCenter = true;
        }
      }

      switch (vtxType) {
        // Edge Middle
        case 0:
          if (isEdgeMiddle) {
            let idx = (vtxIdx + randomInt(1, 4)) % 4;
            if (forceCenter) {
              idx = (vtxIdx + 2) % 4;
            }
            endPoint = this.getEdgeMiddle(idx);
            combination += idx + 'e';
            if (idx == (vtxIdx + 2) % 4) {
              this.throughCenter = true;
            }
          }
          else {
            let idx = (vtxIdx + randomInt(1, 3)) % 4;
            endPoint = this.getEdgeMiddle(idx);
            combination += idx + 'e';
          }
          break;

        // Angle
        case 1:
          if (isEdgeMiddle) {
            let idx = (vtxIdx + randomInt(2, 4)) % 4;
            endPoint = this.square.vertices[idx].copy();
            combination += idx + 'a';
          }
          else {
            let idx = (vtxIdx + 2) % 4;
            endPoint = this.square.vertices[idx].copy();
            combination += idx + 'a';
            this.throughCenter = true;
          }
          break;

        // Square Center
        case 2:
          endPoint = createPoint(0, 0);
          combination += 0 + 'c';
          if (this.stopAtCenter) {
            this.throughCenter = true;
          }
          this.stopAtCenter = true;
          break;
        }

        revertCombination = combination.substring(2) + combination.substring(0, 2);
        unique = this.lineCombination.indexOf(combination) == -1 && this.lineCombination.indexOf(revertCombination) == -1;
    }
    if (unique) {
      this.lineCombination.push(combination, revertCombination);
      this.name += combination;
      return new Fresco.Line(startPoint, endPoint);
    }
    else {
      return null;
    }
  }

  getEdgeMiddle(vtxIdx) {
    return this.square.vertices[vtxIdx].copy().add(this.square.vertices[vtxIdx + 1]).mult(0.5);
  }

  offsetLine(line, gap) {
    let normals = line.computeNormals();
    let offset1 = normals[0].copy().mult(gap);
    let offset2 = normals[0].copy().mult(-gap);
    let vtx1 = [];
    let vtx2 = [];
    line.vertices.forEach(v => {
      vtx1.push(v.copy().add(offset1));
      vtx2.push(v.copy().add(offset2));
    })
    let line1 = new Fresco.Line(...vtx1);
    let line2 = new Fresco.Line(...vtx2);

    return [line1, line2];
  }

  lineCut(line, shape, centerCut = false) {
    let dir = line.vertices[0].copy().sub(line.vertices[1]);
    let intersections = [];
    for (let i = 0; i < shape.vertices.length - 1; i++) {
      let inter = lineSegmentIntersection(line.vertices[1], dir, shape.vertices[i], shape.vertices[i + 1], true);
      // if there is an interesection which isn't the fist vertex of the edge (this avoids duplicate detections at vertices)
      if (inter.length > 0 && inter[1] > 0) {
        // If it is a center cut, the interesection is only valid if it is along the direction from the center to the edge.
        // Because the line always ends with the center, this means the interpolent must be negative
        if (!centerCut || inter[2] >= 0) {
          intersections.push([inter[0], i]);
        }
      }
    }

    if (intersections.length == 0) {
      return [shape];
    }
    else {
      if (intersections.length > 2) {
        // remove duplicates that would correspond to an intersection at a vertex
      }
      if (intersections.length == 1) {
        return [shape]
      }

      // create 2 halves
      let firstHalfVtx = shape.vertices.slice(intersections[0][1] + 1, intersections[1][1] + 1);
      firstHalfVtx.push(intersections[1][0]);
      firstHalfVtx.push(intersections[0][0]);
      firstHalfVtx.push(firstHalfVtx[0]);
      let firstHalf = new Fresco.Shape(firstHalfVtx);

      let halfVtx = shape.vertices.slice(0, intersections[0][1] + 1);
      halfVtx.push(intersections[0][0]);
      halfVtx.push(intersections[1][0]);
      halfVtx.push(...shape.vertices.slice(intersections[1][1] + 1));
      let secondHalf = new Fresco.Shape(halfVtx);

      return [firstHalf, secondHalf];
    }
  }

  isCenterLine(line) {
    // because the line always ends with the center we only need to test the second vertex
    return line.vertices[1].x == 0 && line.vertices[1].y == 0;
  }

  almostEqual(a, b) {
    return Math.abs(a - b) < 0.0001;
  }

  handleCenterCuts(lineBuf, buffer, gap) {
    let line1 = lineBuf.pop();
    let line2 = lineBuf.pop();

    // if the last 2 lines are joining at center from 2 opposite angles, we merge them into a single line
    if (this.almostEqual(line1.vertices[0].x, -line2.vertices[0].x) && this.almostEqual(line1.vertices[0].y, -line2.vertices[0].y)) {
      let nuLine = new Fresco.Line(line1.vertices[0], line2.vertices[0]);
      lineBuf.unshift(nuLine);

      return [lineBuf, buffer];
    }

    // register indices of vertex from wich each line starts
    let inter1 = -1;
    let inter2 = -1;
    for (let i = 0; i < this.square.vertices.length; i++) {
      if (this.square.vertices[i].x == line1.vertices[0].x && this.square.vertices[i].y == line1.vertices[0].y) {
        inter1 = i;
      }
      if (this.square.vertices[i].x == line2.vertices[0].x && this.square.vertices[i].y == line2.vertices[0].y) {
        inter2 = i;
      }
      if (inter1 > 0 && inter2 > 0) {
        break;
      }
    }

    // sort intersection vertices by order
    let point1;
    let point2;
    if (inter1 < inter2) {
      point1 = line1.vertices[0];
      point2 = line2.vertices[0];
    }
    else {
      point1 = line2.vertices[0];
      point2 = line1.vertices[0];
    }

    // cut first half
    let half1Vtx = this.square.vertices.slice(0, Math.min(inter1, inter2) + 1);
    let idx1 = half1Vtx.length - 1; // index of vertex immediatly before the center
    let zeroIdx = half1Vtx.length;
    half1Vtx.push(createPoint(0, 0));
    half1Vtx.push(...this.square.vertices.slice(Math.max(inter1, inter2)));

    idx1 = (idx1 + half1Vtx.length) % half1Vtx.length;
    // register initial position of 1st side vtx
    let oldOri1 = half1Vtx[idx1].copy()
    // offset 1st side vertex around center
    let idx12 = (idx1 - 1 + half1Vtx.length) % half1Vtx.length;
    let dir1 = half1Vtx[idx1].copy().sub(half1Vtx[idx12]).normalize();
    // Project offset on side direction
    let orth1 = oldOri1.copy().normalize();
    orth1 = createVector(-orth1.y, orth1.x);
    let offset1 = orth1.dot(dir1);
    half1Vtx[idx1] = half1Vtx[idx1].copy().add(dir1.mult(gap / offset1));

    // register new side vertex pos
    let newOri1 = half1Vtx[idx1].copy();

    idx1 = (idx1 + 2) % half1Vtx.length; // index of vertex immediatly after the zero
    idx12 = (idx1 + 1) % half1Vtx.length;

    // because of how shapes are stored in Fresco, we hit the duplicate point at the end of
    // the square. To avoid this issue, we remove the duplicate point
    let shiftPrev = false;
    if (half1Vtx[idx1].x == half1Vtx[idx12].x && half1Vtx[idx1].y == half1Vtx[idx12].y) {
      idx12 = (idx12 + 1) % half1Vtx.length;
      shiftPrev = true;
    }

    // register initial position of 2nd side vtx
    let oldOri2 = half1Vtx[idx1].copy();
    // offset 2nd side vertex
    dir1 = half1Vtx[idx12].copy().sub(half1Vtx[idx1]).normalize();
    let orth1b = oldOri2.copy().normalize();
    orth1b = createVector(-orth1b.y, orth1b.x);
    let offset1b = orth1b.dot(dir1);
    half1Vtx[idx1] = half1Vtx[idx1].copy().add(dir1.mult(-gap / offset1b));

    if (shiftPrev) {
      half1Vtx[(idx1 + 1) % half1Vtx.length] = half1Vtx[idx1].copy();
    }

    // register new side vertex pos
    let newOri2 = half1Vtx[idx1].copy();

    // compute intersection of line starting at new side vtx, parallel to old sides.
    // Note that because the center point is at 0,0, the direction to a point from the center
    // is equal to the coordinate of the point
    let [t1, t2] = lineIntersection(newOri1, oldOri1, newOri2, oldOri2);

    // use interesection as new center
    half1Vtx[zeroIdx] = newOri1.add(oldOri1.mult(t1)).copy();

    // register the shape
    let half1 = new Fresco.Shape(half1Vtx);

    //////////////////////////
    // Repeat with second half
    let half2Vtx = this.square.vertices.slice(Math.min(inter1, inter2), Math.max(inter1, inter2) + 1);
    let idx2 = half2Vtx.length - 1;
    half2Vtx.push(createPoint(0, 0));

    let oldOri21 = half2Vtx[idx2].copy(); // position of the 1st side vertex before offset

    // offset vertices around center
    let idx22 = (idx2 - 1) % half2Vtx.length;
    let dir2 = half2Vtx[idx2].copy().sub(half2Vtx[idx22]).normalize();
    let orth2 = oldOri21.copy().normalize();
    orth2 = createVector(-orth2.y, orth2.x);
    let offset2 = orth2.dot(dir2);
    half2Vtx[idx2] = half2Vtx[idx2].copy().add(dir2.mult(gap / offset2));

    let newOri21 = half2Vtx[idx2].copy();

    idx2 = 0;
    idx22 = 1;
    // register initial position of 2nd side vtx
    let oldOri22 = half2Vtx[idx2].copy();
    // offset 2nd side vertex
    dir2 = half2Vtx[idx22].copy().sub(half2Vtx[idx2]).normalize();
    let orth2b = oldOri22.copy().normalize();
    orth2b = createVector(-orth2b.y, orth2b.x);
    let offset2b = orth2b.dot(dir2);
    half2Vtx[idx2] = half2Vtx[idx2].copy().add(dir2.mult(-gap / offset2b));

    let newOri22 = half2Vtx[idx2].copy();

    // compute intersection
    [t1, t2] = lineIntersection(newOri21, oldOri21, newOri22, oldOri22);
    // use interesection as new center
    half2Vtx[half2Vtx.length - 1] = newOri21.copy().add(oldOri21.copy().mult(t1)).copy();

    half2Vtx.push(half2Vtx[0]);

    let half2 = new Fresco.Shape(half2Vtx);
    buffer = [half1, half2];

    this.square.vertices.push(this.square.vertices[0]);

    return [lineBuf, buffer];
  }

  cutShape(gap) {
    this.square = subdivide(this.square, 1);
    let buffer = [this.square];

    // Sort lines such that those stopping at the center are at the end.
    // This way, granted we don't only have "center" lines, the intersection
    // with one such line can be delt with almost like a normal cut
    let lineBuf = [];
    let centerLines = []
    let allCentered = true;
    this.lines.forEach(l => {
      if (this.isCenterLine(l)) {
        centerLines.push(l);
      }
      else {
        lineBuf.push(l);
        allCentered = false;
      }
    })

    lineBuf.push(...centerLines);

    // if all centered, we must deal with the first 2 lines manually
    if (allCentered) {
      [lineBuf, buffer] = this.handleCenterCuts(lineBuf, buffer, gap);
    }

    // Cut shapes by line1
    lineBuf.forEach(l => {
      let [line1, line2] = this.offsetLine(l, gap);
      let centerCut = this.isCenterLine(l);
      let newBuffer = [];
      buffer.forEach(s => {
        newBuffer.push(...this.lineCut(line1, s, centerCut));
      });

      // Cut shapes by line2
      let newNewBuffer = [];
      newBuffer.forEach(s => {
        s.isPolygonal = true;
        newNewBuffer.push(...this.lineCut(line2, s, centerCut));
      });

      // Filter leftover shapes from the cuts
      buffer = [];
      newNewBuffer.forEach(s => {
        let throwAway = false;
        for (let i = 0; i < s.vertices.length; i++) {
          for (let j = 0; j < 2; j++) {
            if (s.vertices[i].x == l.vertices[j].x && s.vertices[i].y == l.vertices[j].y) {
              throwAway = true;
              break;
            }
          }
          if (throwAway) {
            break;
          }
        }
        if (!throwAway) {
          buffer.push(s);
        }
      })
    });

    // attach all shapes
    buffer.forEach(s => {
      s.isPolygonal = true;
      this.attach(s);
    });

    for (let i = 0; i < buffer.length; i++) {
      buffer[i].layer = i;
    }
  }
}

class OneTwoTile extends Tile {
  constructor(gap, showText, showLinesAnyway) {
    super(randomInt(1, 3), gap, showText, showLinesAnyway);
  }
}

function setup() {
  if (tileRecursive) {
    createCanvas(1000, 1000);
  }
  else {
    createA4RatioCanvas(1000);
  }
  background(colorFromHex(backgroundClr));
  setSeed(drawingSeed);
  loadFonts();

  Fresco.Futural.fontSpacing = 4;

  if (tileRecursive) {
    tiler = new RecursiveTiler(OneTwoTile, [gapThickness, false, false], minRecursiveDepth, maxRecursiveDepth, fillRecursiveTiles, recursiveMargins)
  } else {
    tiler = new Tiler(OneTwoTile, resX, resY, 0, 0, [gapThickness, showText, false]);
  }
}

// draw function which is automatically
// called in a loop
function draw() {
  tiler.draw();
  noLoop();
}