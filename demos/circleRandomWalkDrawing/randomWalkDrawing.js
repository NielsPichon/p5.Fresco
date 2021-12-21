const backgroundClr = '000';
const alpha = 255; // line opacity
const noiseFreq = 0.01; // underlying noise freq
const pointsPerFrame = 500; // number of points to draw each frame = draw speed
const radialWobble = false; // whether to apply some noise to the radial position
const compensateAngularDist = true; // whether to modify the points distances for each ring to make sure they remain constant 
const sortByDist = true; // whther to sort the points along the path by closest neighbour
const hidePoints = true; // whether to hide points once the path is drawn
const splitByDist = true; // whether to split the path if points are too far

const minDist = 100; // min distance between points along the arc
const maxDist = 500; // max distance between points along the arc
const distThresh = 50; // distance threshold beyond which the path is split, removing long lines
const radialDist = 10; // radial distance between 2 circles = Density
const trueThresh = 0.25; // noise value below which to record the points for the final path = Lacunarity
const useRidgedNoise = true; // use Ridged noise rather than perlin noise
const randomLayerColor = true; // Whether to draw each layer with a random different color
const maxLayer = 3; // if strictly positive, this is the max number of layers that can be

const drawingSeed = 9344;

const deg2rad = Math.PI / 180;
let points = [];
let truePoints = [];
let ring = radialDist;
let theta = 0;
let layerColor = [];

// sort array of points by closest neighbour
// in a greedy fashion
function greedySort(arr) {
  let last_vtx = arr.shift();
  let vtx = [last_vtx];
  while (arr.length > 0) {
    let min_d = width * width + height * height;
    let closest_idx = 0;
    for (let i = 0; i < arr.length; i++) {
      let d = distSquared(last_vtx, arr[i]);
      if (d <= min_d) {
        min_d = d;
        closest_idx = i; 
      }
    }

    last_vtx = arr.splice(closest_idx, 1)[0];
    vtx.push(last_vtx);
  }

  return vtx;
}

function setup() {
  createCanvas(1000, 1000);
  background(colorFromHex(backgroundClr));
  setSeed(drawingSeed);
  loadFonts();
  Fresco.registerShapes = false;

  points = [createPoint(-width / 2, -height / 2)]
}

// draw function which is automatically 
// called in a loop
function draw() {
  for (let i = 0; i < pointsPerFrame; i++) {
    // get noise value at last registered point
    let p = points[points.length - 1];
    let n;
    if (useRidgedNoise) {
      n = normalizedRidgedNoise((p.x + width * 0.5) * noiseFreq, (p.y + height * 0.5) * noiseFreq);
    }
    else {
      n = max(0.01, normalizedPerlin((p.x + width * 0.5) * noiseFreq, (p.y + height * 0.5) * noiseFreq));
    }

    // scale displacement with ring number to 
    // avoid increasing gaps by distance
    let M = maxDist;
    let m = minDist;
    if (compensateAngularDist) {
      M /= ring;
      m /= ring;
    }
    // increment the angular pos by the scaled noise
    new_theta = theta + (n * (M - m) + m) * deg2rad;

    // if we went a full turn, increment the ring number
    if (new_theta % (2 * Math.PI) < Math.PI && theta % (2 * Math.PI) > Math.PI) {
      ring += radialDist;
    }

    // apply radial oscillations if relevant
    theta = new_theta;
    let r = ring;
    if (radialWobble) {
      r += (n - 0.5) * radialDist;
    }

    // if still within the bounds of the canvas, draw the point
    if (r < min(height * 0.5, width * 0.5)) {
      let x = r * Math.cos(theta)
      let y = r * Math.sin(theta)
      let new_p = createPoint(x, y)
      points.push(new_p);
      // register point for final path if noise is below threshold
      if (n < trueThresh) {
        truePoints.push(new_p);
      }
      new_p.draw();
    }
    else {
      // sort points by distance
      if (sortByDist) {
        truePoints = greedySort(truePoints)
      }
      let paths = [];
      if (splitByDist) {
        let lastSplit = 0;
        let layer = 0;
        for (let i = 1 ; i < truePoints.length; i++) {
          if (distSquared(truePoints[i], truePoints[i - 1]) > distThresh * distThresh) {
            let slice = truePoints.slice(lastSplit, i);
            // create and draw path
            let path = new Fresco.Shape(slice);
            path.isPolygonal = true;
            path.layer = layer;
            let color;
            if (randomLayerColor) {
              if (maxLayer > 0 && layerColor.length > layer) {
                color = layerColor[layer]
              }
              else {
                color = [random(255), random(255), random(255), alpha];
                if (maxLayer > 0) {
                  layerColor.push(color);
                }
              }
            }
            else {
              color = colorFromHex('fff', alpha);
            }
            path.color = color;
            paths.push(path);
            lastSplit = i;
            layer ++;

            if (maxLayer > 0) {
              layer = layer % maxLayer;
            }

          }
        }
        if (lastSplit != truePoints.length - 1) {
          let slice = truePoints.slice(lastSplit, i);
          // create and draw path
          let path = new Fresco.Shape(slice);
          path.isPolygonal = true;
          path.layer = layer;
          let color;
          if (randomLayerColor) {
            color = [random(255), random(255), random(255), alpha]
          }
          else {
            color = colorFromHex('fff', alpha);
          }
          path.color = color;
          paths.push(path);
        }
      }
      else {
        // create and draw path
        let path = new Fresco.Shape(truePoints);
        path.isPolygonal = true;
        path.color = colorFromHex('fff', alpha);
        paths.push(path);
      }
      if (hidePoints){
        background(colorFromHex(backgroundClr));
      }
      paths.forEach(p => {p.draw()});
      noLoop();
      break;
    }
  }
}