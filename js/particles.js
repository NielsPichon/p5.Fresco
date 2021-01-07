const g = -9.81; // gravity acceleration
const linear = true; // linear interpolation type
const constant = false; // constant interpolation type


// reverserved variables which hold the objects of the simulations
let particles = [];
let forces = [];
let colliders = [];
let emitters = [];


// simulated time
let T = 0;


// interpolation along a ramp, either constant or linear
function rampInterpolation(t, time, values, linear = true) {
    let interp = 0;
    while (interp < time.length - 1 && time[interp + 1] > t) {
        interp ++;
    }
    if (linear) {
        if (interp >= time.length - 1) {
            return values[interp];
        }
        else {
            let a = (t - time[interp]) / (time[interp + 1] - time[interp]);
            return (1 - a) * values[interp] + a * values[interp + 1];
        }
    }
    else {
        return values[interp];
    }
}


// interpolation along a ramp, either constant or linear
function rampInterpolation2D(t, time, values, linear = true) {
    let interp = 0;
    while (interp < time.length - 1 && time[interp + 1] > t) {
        interp ++;
    }
    if (linear) {
        if (interp >= time.length - 1) {
            return values[interp];
        }
        else {
            let a = (t - time[interp]) / (time[interp + 1] - time[interp]);
            return values[interp].copy().mult(1 - a).add(
                values[interp + 1].copy().mult(a));
        }
    }
    else {
        return values[interp];
    }
}


// Checks whether a particle will collide with another particle
// or a collider and resolves the collision accordingly
function solveCollision(particle, dt) {
    throw "collision is not yet implemented";
}


// utility to create a basic particle at specified position
function createParticle(x, y, z = null) {
    return new Particle(createPoint(x, y));
}

// class for handling particles. 
// particles are Points which also have a velocity, a mass,
// a life time, and possibly varying color and transform over life.
// Particles may be handled in a cinematic fashion or with a physics
// system
class Particle extends Point {
    constructor(position) {
        super(position);

        this.lifetime = -1; // a negative life time means
                            // the particle never dies
        
        this.mass = 1;
        this.leaveTrail = false; // if true, this particle will
                                 // slowly define a shape
        this.trail;

        // evolve properties over time.
        // note: because the lifetime is infinite, we can just base the
        // control point over a fraction of the lifetime. Instead
        // we define a time for each control point.
        this.colorOverLife = [this.color, this.color];
        this.colorOverLifeTime = [0, 10];
        this.colorInterolation = linear;
        this.scaleOverLife = [this.scale, this.scale];
        this.scaleOverLifeTime = [0, 10];
        this.scaleInterpolation = linear;
        this.rotationOverLife = [this.rotation, this.rotation];
        this.rotationOverLifeTime = [0, 10];
        this.rotationInterpolation = linear;

        this.simulatePhysics = false; // whether to simulate physics or not
        this.handleCollisions = false; // whether to collide or not.
                                       // The radius of the Point will be used
                                       // for collision computation

        this.lastUpdate = T; // time of last update
        this.birthDate = T; // time of spawn                                       
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);

        this.isDead = false; // Because we will iterate on all particles in a loop
                             // we cannot simply kill a particle upon update. Instead
                             // we flag it as dead and will remove it before drawing 

        // register this particle in the simulation
        append(particles, this);
    }

    asPoint() {
        let nu_point = new Point(this.position());
        nu_point.color = this.color;
        nu_point.rotation = this.rotation;
        nu_point.radius = this.radius;
        nu_point.scale = this.scale.copy();
        return nu_point;
    }

    // reads the forces buffer and computes the acceleration accordingly
    updateAcceleration() {
        this.acceleration = createVector(0, 0);
        for (let i = 0; i < forces.length; i++) {
            this.acceleration.add(forces[i].applyForce(this));
        }
        this.acceleration.div(this.mass);
    }


    update() {
        // time since last update
        const dt = T - this.lastUpdate;
        // time since birth
        const t = T - this.birthDate;

        // If the particle has lived too long, destroy
        if (this.lifetime > 0 &&  t > this.lifetime) {
            this.isDead = true;
            return;
        }

        // update color and transform
        this.color = rampInterpolation(
            t, this.colorOverLifeTime,
            this.colorOverLife, this.colorInterolation
        );
        this.scale = rampInterpolation2D(
            t, this.scaleOverLifeTime,
            this.scaleOverLife, this.scaleInterpolation
        );
        this.rotation = rampInterpolation(
            t, this.rotationOverLifeTime,
            this.rotationOverLife, this.rotationInterpolation
        );

        // resolve position
        if (this.simulatePhysics) {
            // update the acceleration
            this.updateAcceleration();
            // update position based on the acceleration
            this.velocity.add(this.acceleration.copy().mult(dt));

            // solve for collisions if relevant
            if (this.handleCollisions) {
                solveCollision(this, dt);
            }
            else {
                // else move the particle based on velocity
                this.add(this.velocity.copy().mult(dt));
            }
            
        }
        else {
            // else move the particle based on velocity only
            this.add(this.velocity.copy().mult(dt));
        }

        // if the particle is to leave a trail, add the current 
        // position to the trail shape vertices (or create it)
        if (this.leaveTrail) {
            addCurrentPositionToTrail()
        }
    }

    addCurrentPositionToTrail() {
        if (this.trail) {
            append(this.trail.vertices, this.asPoint());
        }
        else {
            this.trail = new Shape([this.asPoint()]);
        }
    }

    draw() {
        if (this.leaveTrail) {
            if (this.trail && this.trail.vertices.length > 1) {
                this.trail.draw(true);
            }
            else {
                stroke(this.color);
                PPoint(this);
            }
        }
        else {
            stroke(this.color);
            PPoint(this);
        }
    }


    drawPoints() {
        if (this.leaveTrail) {
            this.trail.drawPoints();
        }
        else {
            stroke(this.color);
            PPoint(this);
        }
    }

    drawLastMove() {
        if (this.trail) {
            if (this.trail.vertices.length > 1) {
                stroke(this.color);
                print(this.color);
                PLine(
                    this.trail.vertices[this.trail.vertices.length - 1],
                    this.trail.vertices[this.trail.vertices.length - 2]
                );
            }
        }
    }
}


// generic class for a force
class Force {
    constructor() {
        append(forces, this);
        this.isDead = false; // whether the force should be de-referenced
    }

    applyForce(particle) {
    }
}


// gravitational force
class Gravity extends Force {
    constructor() {
        super();
    }

    applyForce(particle) {
        return createVector(0, 1).mult(g * particle.mass);
    }
}


// attractor
class Attractor extends Force {
    constructor(position, intensity, cutoff, falloff = -2) {
        super();
        this.position = position; // attraction center.
        this.intensity = intensity; // force intensity
        this.cutoff = cutoff; // radius of influence. If negative, will be ignore
        this.falloff = falloff; // power of decay with distance to the enter
    }

    applyForce(particle) {
        let direction = this.position.sub(particle);
        let magnitude = direction.mag();

        // if further than cutoff, ignore
        if (this.cutoff > 0 && magnitude >= this.cutoff) {
            return createVector(0, 0);
        }
        
        // apply the polynomial decay to the magnitude and then multiply by the force intensity
        magnitude = Math.pow(magnitude, this.falloff) * this.intensity;

        // return the force along the normalized direction
        return direction.normalize().mult(magnitude);
    }
}


// Simulates a burst of force which can be used to simulate explosions.
// All particles within the radius of impact will be affected.
// The force burst will decay linearly over life
class Burst extends Force {
    constructor(position, intensity, radius, decayTime=1e-3) {
        super();
        this.position = position;
        this.intensity = intensity;
        this.radius = radius;
        this.decayTime = decayTime;
    }

    applyForce(particle) {
        if (T > this.decayTime) {
            this.isDead = true;
            return createVector(0, 0);
        }

        // linear interpolent
        const t = T / this.decayTime;

        // direction from burst center to point
        let direction = particle.sub(this.position);

        // If the point is out of the radius of influence,
        // don't apply force
        if (direction.mag() >= this.radius) {
            return createVector(0, 0);
        }

        return direction.normalize().mult(this.intensity * t);
    }
}


class Drag extends Force {
    constructor(intensity) {
        super();
        this.intensity = intensity;
    }

    applyForce(particle) {
        // - mu * v^2
        return this.velocity.copy().mult(this.velocity).mult(- this.intensity);
    }
}


class Emitter {
    constructor() {
        // particles will be spawned with a random initial velocity
        // where x and y are randomly selected independentyl between
        // minV and maxV
        this.minV = createVector(-1, -1);
        this.maxV = createVector(1, 1);

        // same thing with the particle life expectancy
        this.minLife = -1;
        this.maxLife = -1;

        // same with mass
        this.minMass = 1;
        this.maxMass = 1;

        // same thing with its scale (except it will be uniform)
        this.minScale = createVector(.1, .1);
        this.maxScale = createVector(1, 1);

        // Particles properties over time. These will be the same for all
        // particles, except for the scale which will be multiplied by the particle
        // overall scale
        this.colorOverLife = [[255, 255, 255, 255], [255, 255, 255, 255]];
        this.colorOverLifeTime = [0, 10];
        this.colorInterolation = linear;
        this.scaleOverLife = [createVector(1, 1), createVector(1, 1)];
        this.scaleOverLifeTime = [0, 10];
        this.scaleInterpolation = linear;
        this.rotationOverLife = [0, 0];
        this.rotationOverLifeTime = [0, 10];
        this.rotationInterpolation = linear;

        // Whether the particles should simulate physics and collisions,
        // as well as leave a trail
        this.simulatePhysics = false;
        this.handleCollisions = false;
        this.leaveTrail = false;

        // each spawn call, this is how many particles will
        // try to spawn
        this.spawnRate = 50;

        // Probability to spawn a given particle
        this.spawnProbability = 1;

        // whether to only spawn particles once
        this.burst = false;

        this.isDead = false;

        // register emitter
        append(emitters, this);
    }

    spawn() {}
}


class PointEmitter extends Emitter {
    constructor(position) {
        super();
        this.position = position;
    }

    spawn() {
        let t;
        for (let i = 0; i < this.spawnRate; i++) {
            if (random() <= this.spawnProbability) {
                let nu_particle = new Particle(this.position);

                // assign random velocity in range
                t = random();
                nu_particle.velocity.x = (1 - t) * this.minV.x + t * this.maxV.x
                t = random();
                nu_particle.velocity.y = (1 - t) * this.minV.y + t * this.maxV.y

                // assign random life expectancy in range
                t = random();
                nu_particle.lifetime = (1 - t) * this.minLife + t * this.maxLife;

                // assign random mass in range
                t = random();
                nu_particle.mass = (1 - t) * this.minMass + t * this.maxMass;
                
                // assign random scale
                t = random();
                nu_particle.scale = this.minScale.copy().mult(1 - t).add(this.maxScale.copy().mult(t));

                // apply uniform properties
                nu_particle.colorOverLife = this.colorOverLife;
                nu_particle.colorOverLifeTime = this.colorOverLifeTime;
                nu_particle.colorInterolation = this.colorInterolation;
                nu_particle.scaleOverLife = this.scaleOverLife;
                nu_particle.scaleOverLifeTime = this.scaleOverLifeTime;
                nu_particle.scaleInterpolation = this.scaleInterpolation;
                nu_particle.rotationOverLife = this.rotationOverLife;
                nu_particle.rotationOverLifeTime = this.rotationOverLifeTime;
                nu_particle.rotationInterpolation = this.rotationInterpolation;

                // apply particle overall scale to its scale over life
                for (let j = 0; j < nu_particle.scaleOverLife.length; j++) {
                    nu_particle.scaleOverLife[j].mult(nu_particle.scale);
                }

                nu_particle.simulatePhysics = this.simulatePhysics;
                nu_particle.handleCollisions = this.handleCollisions;
                nu_particle.leaveTrail = this.leaveTrail;
            }
        }

        if (this.burst) {
            this.isDead = true;
        }
    }
}

class ShapeEmitter extends Emitter {
    constructor(shape) {
        super();
        this.shape = shape;

        // Amount of initial velocity along
        // the normal to the shape
        this.minNormalV = 0.1;
        this.maxNormalV = 1;
    }

    spawn() {
        let t;
        let nu_pos;
        let nrmV;
        for (let i = 0; i < this.spawnRate; i++) {
            if (random() > this.spawnProbability) {
                nu_pos = scatter(this.shape, 1, true);
                let nu_particle = new Particle(nu_pos[0]);

                // assign random velocity in range
                t = random();
                nu_particle.velocity.x = (1 - t) * this.minV.x + t * this.maxV.x
                t = random();
                nu_particle.velocity.y = (1 - t) * this.minV.y + t * this.maxV.y

                // add the normal velocity
                nrmV = this.shape.normalAtPoint(nu_pos);
                t = random();
                nrmV.mult((1 - t) * this.minNormalV + t * this.maxNormalV);
                nu_particle.velocity.add(nrmV);

                // assign random life expectancy in range
                t = random();
                nu_particle.lifetime = (1 - t) * this.minLife + t * this.maxLife;

                // assign random mass in range
                t = random();
                nu_particle.mass = (1 - t) * this.minMass + t * this.maxMass;
                
                // assign random scale
                t = random();
                nu_particle.scale = this.minScale.copy().mult(1 - t).add(this.maxScale.copy().mult(t));

                // apply uniform properties
                nu_particle.colorOverLife = this.colorOverLife;
                nu_particle.colorOverLifeTime = this.colorOverLifeTime;
                nu_particle.colorInterolation = this.colorInterolation;
                nu_particle.scaleOverLife = this.scaleOverLife;
                nu_particle.scaleOverLifeTime = this.scaleOverLifeTime;
                nu_particle.scaleInterpolation = this.scaleInterpolation;
                nu_particle.rotationOverLife = this.rotationOverLife;
                nu_particle.rotationOverLifeTime = this.rotationOverLifeTime;
                nu_particle.rotationInterpolation = this.rotationInterpolation;

                // apply particle overall scale to its scale over life
                for (let j = 0; j < nu_particle.scaleOverLife.length; j++) {
                    nu_particle.scaleOverLife[j].mult(nu_particle.scale);
                }

                nu_particle.simulatePhysics = this.simulatePhysics;
                nu_particle.handleCollisions = this.handleCollisions;
                nu_particle.leaveTrail = this.leaveTrail;
            }
        }

        if (this.burst) {
            this.isDead = true;
        }
    }
}

// simulates a single step
function simulationStep(real_time = false, dT = 0.01) {
    // update current simulation time, either using real time
    // (may lead to reproducibility issues), or a set time step
    if (real_time) {
        T = millis();
    }
    else {
        T += dT;
    }

    // spawn new particles
    for (let i = 0; i < emitters.length; i++) {
        emitters[i].spawn();
    }

    // update particles position
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }

    // clean up dead particles and inactive forces, and empty emitters
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].isDead) {
            particles.splice(i, 1);
        }
    }
    for (let i = forces.length - 1; i >= 0; i--) {
        if (forces[i].isDead) {
            forces.splice(i, 1);
        }
    }
    for (let i = emitters.length - 1; i >= 0; i--) {
        if (emitters[i].isDead) {
            emitters.splice(i, 1);
        }
    }
}
