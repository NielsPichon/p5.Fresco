const backgroundClr = '000';

let tiler;

class Tile extends Fresco.Collection {
  constructor(lineNumber = 2) {
    super();
    this.lineCombination = [];
    this.square = new Fresco.Square(100);
    this.attach(this.square);
    this.throughCenter = false;
    this.stopAtCenter = false;
    this.lines = [];
    this.name = '';
    
    for (let i = 0; i < lineNumber; i++) {
      let nuLine = this.generateLine(i == lineNumber - 1);
      if (nuLine == null) {
        break;
      }
      this.attach(nuLine);
      this.lines.push(nuLine);
    }

    let textShapes = Fresco.Futural.drawText(this.name, 4, createVector(0, -75), true, false);
    textShapes.forEach(s => {
      this.attach(s);
    })
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
}

class Tiler {
  constructor(tileClass, num_x, num_y, margin_x, margin_y, classParams) {
    this.tiles = [];
    let incX = (width - 2 * margin_x) / num_x;
    let incY = (height - 2 * margin_y) / num_y;
    let X = -width / 2 + margin_x + incX / 2;
    for (let i = 0; i < num_x; i++) {
      let Y = -height / 2 + margin_y + incY / 2;
      for (let j = 0; j < num_y; j++) {
        let nuTile = new tileClass(...classParams);
        nuTile.setPosition(createVector(X, Y));
        this.tiles.push(nuTile);
        Y += incY;
      }
      X += incX;
    }
  }

  draw() {
    this.tiles.forEach(t => t.draw());
  }
}

function setup() {
  createSVGCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();

  Fresco.Futural.fontSpacing = 4;

  tiler = new Tiler(Tile, 4, 4, 0, 0, [2]);
}

// draw function which is automatically 
// called in a loop
function draw() {
  tiler.draw();
  noLoop();
}