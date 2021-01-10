// noise map parameters
const noiseFreq = 0.005;
const kernelSize = 1000;
const numLevels = 10;
let noiseType = 'normalizedRidged';
const distortionAmount = 1;
const colors = ['6B2D5C', 'F0386B', 'FF5376', 'F8C0C8', 'E2C290'];
const addIsoLines = true;
const isoLinesClr = 0;
const useModulo = false;
const levelNoise = false;
const noiseOctaves = 4;

function setup() {
  createCanvas(1000, 1000);
  background(0);
  strokeWeight(1);
  noiseDetail(noiseOctaves)

  // convert colors to rgba
  for (let i = 0; i < colors.length; i++) {
    colors[i] = colorFromHex(colors[i]);
  }

  switch(noiseType) {
    case 'perlin':
      noiseType = noise;
      break;
    case 'normalizedPerlin':
      noiseType = normalizedPerlin;
      break;
    case 'ridged':
      noiseType = ridgedNoise;
      break;
    case 'normalizedRidged':
      noiseType = normalizedRidgedNoise;
      break;
    case `distorted`:
      noiseType = distorted;
      break;
    default:
      noiseType = noise;
  } 
}

function draw() {
  if (frameCount * kernelSize < width * height) {
    for (i = 0; i < kernelSize; i++) {
      let y = Math.floor((kernelSize * frameCount + i) / width);
      let x = (kernelSize * frameCount + i) % width;

      let n;
      if (useModulo) {
        n = moduloNoise(noiseType, numLevels, x * noiseFreq, y * noiseFreq);
      }
      else if (levelNoise) {
        n = leveledNoise(noiseType, numLevels, x * noiseFreq, y * noiseFreq);
      }
      else {
        n = noiseType(x * noiseFreq, y * noiseFreq);
      }

      if (addIsoLines) {
        let iso = isoLine(noiseType, numLevels, noiseFreq, x * noiseFreq, y * noiseFreq);

        if (iso == 0) {
          // stroke(colorInterp(n, colors));
          stroke(255);
        }
        else {
          stroke(isoLinesClr);
        }
      }
      else {
        stroke(colorInterp(n, colors));
      }
      point(x, y);
    }
  }
  else {
    noLoop()
  }
}

function distorted(x, y) {
  return distortedNoise(normalizedPerlin, distortionAmount, x, y);
}
