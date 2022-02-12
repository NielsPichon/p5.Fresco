/**
 * A regular grid tiler
 */
class Tiler extends Fresco.Collection{
    constructor(tileClass, classParams, num_x, num_y, margin_x, margin_y) {
        super();
        this.tiles = [];
        let incX = (width - 2 * margin_x) / num_x;
        let incY = (height - 2 * margin_y) / num_y;
        let X = -width / 2 + margin_x + incX / 2;
        for (let i = 0; i < num_x; i++) {
            let Y = -height / 2 + margin_y + incY / 2;
            for (let j = 0; j < num_y; j++) {
                let nuTile = new tileClass(...classParams);
                nuTile.setPosition(createVector(X, Y));
                this.attach(nuTile);
                Y += incY;
            }
            X += incX;
        }
    }

    toShapes() {
        let shapes = [];
        this.tiles.forEach(t => {
            shapes.push(...t.toShapes());
        })
        return shapes;
    }
}

/**
 * A quad-tree like tiler
 */
class RecursiveTiler {
    constructor(tileClass, classParams, minDepth=2, maxDepth = 4, fillCell = false, margin = 0) {
        let doneTiles = [];
        let tileBuffer = [
            [-width / 4, -width / 4, 1],
            [-width / 4, width / 4, 1],
            [width / 4, -width / 4, 1],
            [width / 4, width / 4, 1],
        ];

        // recursively create all the tiles
        while (tileBuffer.length > 0) {
            let [x, y, depth] = tileBuffer.pop();

            if (depth >= minDepth && (random() > 0.5 || depth == maxDepth)) {
                doneTiles.push([x, y, depth]);
            } else {
                let w = width / Math.pow(2, depth);
                tileBuffer.push(...[
                    [x - w / 4, y - w / 4, depth + 1],
                    [x - w / 4, y + w / 4, depth + 1],
                    [x + w / 4, y - w / 4, depth + 1],
                    [x + w / 4, y + w / 4, depth + 1],
                ]);
            }
        }

        // spawn actual tiles
        this.tiles = [];
        doneTiles.forEach(t => {
            let [x, y, depth] = t;
            let nuTile = new tileClass(...classParams);
            nuTile.setPosition(createVector(x, y));
            let scale = 1 / Math.pow(2, depth);
            if (fillCell) {
                scale = width * scale / 100 - 2 * margin / 100;
            }
            nuTile.setScale(createVector(scale, scale));
            this.tiles.push(nuTile);
        })
    }

    draw() {
        this.tiles.forEach(t => t.draw());
    }
}


/**
 * A tiler which randomly spawns instances using a Poisson disc sampling technique.
 */
class PoissonSampler extends Fresco.Collection {
    constructor(object, args, w, h, spacing, maxTrials) {
        super();
        // https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
        this.w = w;
        this.h = h;
        this.k = maxTrials;
        this.r = spacing;
        this.spacingSq = spacing * spacing;
        this.objectClass = object;
        this.classArgs = args;

        this.cellSize = spacing / sqrt(2);
        this.numCellsX = Math.ceil(this.w / this.cellSize);
        this.numCellsY = Math.ceil(this.h / this.cellSize);
        // create an array of cells which contains the index of a sample. -1 means no sample
        this.grid = Array(this.numCellsX * this.numCellsY).fill(-1, 0);

        // create initial sample randomly on the grid and store its position in the grid
        let x = random(this.w);
        let y = random(this.h);
        this.grid[this.getCell(x, y)] = 0;
        let sample = new this.objectClass(...args);
        sample.setPosition(createVector(x, y));
        this.attach(sample);
        this.activeSamples = [sample];

        while (this.activeSamples.length > 0) {
            this.sampleStep();
        }

        // offset everything in order to center everything
        this.setPosition(createVector(-w / 2, -h / 2));
        this.freezeTransform();
    }

    sampleStep() {
        // create k new samples
        let newPos = Array(this.k);
        for (let i = 0; i < this.k; i++) {
            // random position in the anulus around the last active sample
            // between radius maxTrial and 2 * maxTrial
            let r = random(this.r, 2 * this.r);
            newPos[i] = p5.Vector.fromAngle(2 * random(Math.PI)).mult(r).add(this.activeSamples[0].position);
        }

        // for each new sample, check if the position is free and then add to the active list
        newPos.forEach(p => {
            if (this.canSpawn(p.x, p.y)) {
                this.grid[this.getCell(p.x, p.y)] = this.objects.length;
                let sample = new this.objectClass(...this.classArgs);
                sample.setPosition(p);
                this.attach(sample);
                this.activeSamples.push(sample);
            }
        });

        this.activeSamples.shift();
    }

    canSpawn(x, y) {
        if (x > this.w || x < 0 || y > this.h || y < 0) {
            return false;
        }

        let cell = this.getCell(x, y);
        let cellX = Math.floor(x / this.cellSize);
        let cellY = Math.floor(y / this.cellSize);
        for (let i = -1; i < 2; i++) {
            if (cellX + i >= 0 && cellX + i < this.numCellsX) {
                for (let j = -1; j < 2; j++) {
                    if (cellY + j >= 0 && cellY + i < this.numCellsY) {
                        // get neighbour cell
                        let neighbour = cell + i * this.numCellsY + j;
                        // if the cell isn't empty
                        if (this.grid[neighbour] >= 0) {
                            // check distance to neighbour. If too close don't spawn.
                            if (
                            distSquared(
                                createVector(x, y),
                                this.objects[this.grid[neighbour]].position
                            ) < this.spacingSq) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    getCell(x, y) {
        let X = Math.floor(x / this.cellSize);
        let Y = Math.floor(y / this.cellSize);

        return X * this.numCellsY + Y;
    }
}
