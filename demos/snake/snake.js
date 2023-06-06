const gridSize = 10
const WIDTH = 200
const HEIGHT = 200

let game;


function warp_around_value(val, size) {
    if (abs(val) > size / 2){
        if (val > 0) val -= size
        else val += size
    }

    return val
}

function warp_around(pos) {
    pos.x = warp_around_value(pos.x, WIDTH);
    pos.y = warp_around_value(pos.y, HEIGHT);
    return pos
}

function keyReleased()  {
    if (keyCode === UP_ARROW) {
        if (game.snake.direction != createVector(0, -gridSize)) {
            game.snake.direction = createVector(0, gridSize)
        }
    } else if (keyCode === DOWN_ARROW) {
        if (game.snake.direction != createVector(0, gridSize)) {
            game.snake.direction = createVector(0, -gridSize)
        }
    } else if (keyCode === RIGHT_ARROW) {
        if (game.snake.direction != createVector(-gridSize, 0)) {
            game.snake.direction = createVector(gridSize, 0)
        }
    } else if (keyCode === LEFT_ARROW) {
        if (game.snake.direction != createVector(gridSize, 0)) {
            game.snake.direction = createVector(-gridSize, 0)
        }
    }
}

class Snake{
    constructor() {
        this.body = new Fresco.Shape([
            createPoint(-2 * gridSize, 0),
            createPoint(-1 * gridSize, 0),
            createPoint(0, 0),
        ]);
        this.direction = createVector(gridSize, 0);
    }
    update(){
        let head = warp_around(
            this.body.vertices.at(-1).copy().add(this.direction))

        this.body.vertices.splice(0, 1)
        this.body.vertices.push(head)
    }

    isInBody(pos) {
        for (let i = 0; i < this.body.vertices.length - 1; i++) {
            if (pos == this.body.vertices[i]) {
                return true;
            }
        }
        return false;
    }
}


function randomPos() {
    return createVector(
        random() * WIDTH - WIDTH / 2,
        random() * HEIGHT - HEIGHT / 2
    );
}


class Pray{
    constructor(snake){
        this.pos = randomPos()
        while (snake.body.vertices.indexOf(this.pos) > -1) {
            this.pos = randomPos()
        }

        this.body = new Fresco.Point(this.pos);
        this.body.radius = gridSize / 2
    }

    overlap(pos) {
        return this.pos.x == pos.x && this.pos.y == pos.y
    }

    draw() {
        this.body.draw()
    }
}


class Game {

    constructor(){
        this.snake = new Snake()
        this.pray = new Pray(this.snake)
    }

    update() {
        this.snake.update()
        this.draw()
        if (this.pray.overlap(this.snake.body.vertices.at(-1))) {
            this.snake.body.insert(0, []) // eat
        }
        else if (this.snake.isInBody(this.snake.body.vertices.at(-1))) {
            print('You dead')
            exit()
        }
    }

    draw() {
        background(colorFromHex(backgroundClr));
        this.snake.body.draw();
        this.pray.draw();
    }
}

const backgroundClr = '000';

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(colorFromHex(backgroundClr));
  setSeed();
  loadFonts();
  Fresco.registerShapes = false;

  this.game = new Game()
}

// draw function which is automatically
// called in a loop
function draw() {
    this.game.update()
}