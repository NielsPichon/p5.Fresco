/**
 * @author Niels Pichon <niels.pichon@outlook.com>
 * @fileoverview Everything needed to handle particle systems, 
 * from particle description and emitters to forces, collisions
 * and simulated time
 */

/**
 * gravity acceleration
 * */
const g = -9.81;

/**
 * Interpolation type, for use in ramps
 */
const interpolationType = {
    linear: true,
    constant: false
}


/** reverserved variable which holds the particles in the simulation */
let particles = [];
/** reverserved variable which holds the forces in the simulation */
let forces = [];
/** reverserved variable which holds the colliders in the simulation */
let colliders = [];
/** reverserved variable which holds the emitters in the simulation */
let emitters = [];


/**
 * Return a list of all particles alive
 */
function getParticles() {
    return particles;
}


/**
 * Return i-th particle alive
 * @param {number} Index of the particle to retrieve
 */
function getParticle(idx) {
    return particles[idx];
}


/**
 * Return the number of particles alive
 */
function getParticlesNum() {
    return particles.length;
}


/** simulated time */
let T = 0;


/**
 * Time interpolation along a ramp, either constant or linear for a 1D value
 * @param {number} t Current time, to use in the interpolation
 * @param {Array.<number>} time Array of time stamps at which a given value is reached
 * @param {Array.<number>} values Array of values to interpolate among
 * @param {boolean} linear Whether to use linear interpolation or not
 * @returns {number} The interpolated value
 */
function rampInterpolation(t, time, values, linear = interpolationType.linear) {
    if (values.length == 1) {
        return values[0];
    }

    let interp = 0;
    while (interp < time.length - 1 && time[interp + 1] <= t) {
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


/**
 * Time interpolation along a ramp, either constant or linear for an array of values
 * @param {number} t Current time, to use in the interpolation
 * @param {Array.<number>} time Array of time stamps at which a given value is reached
 * @param {Array.<Array.<number>>} values Array of array values to interpolate among.
 * All arrays should have the same length
 * @param {boolean} linear Whether to use linear interpolation or not
 * @returns {number} The interpolated value
 */
function rampArrayInterpolation(t, time, values, linear = interpolationType.linear) {
    let nu_array = new Array(values[0].length);

    if (values.length == 1 || t <= 0) {
        arrayCopy(values[0], nu_array);
        return nu_array;
    }
    if (t >= time[time.length - 1]) {
        arrayCopy(values[values.length - 1], nu_array);
        return nu_array;        
    }

    let interp = 0;
    while (interp < time.length - 1 && time[interp + 1] <= t) {
        interp ++;
    }
    if (linear) {
        if (interp >= time.length - 1) {
            arrayCopy(values[interp], nu_array);
            return nu_array;
        }
        else {
            let a = (t - time[interp]) / (time[interp + 1] - time[interp]);
            for (let i = 0; i < values[0].length; i++) {
                nu_array[i] = (1 - a) * values[interp][i] + a * values[interp + 1][i];
            }
            return nu_array;
        }
    }
    else {
        arrayCopy(values[interp], nu_array);
        return nu_array;
    }
}


/**
 * Time interpolation along a ramp, either constant or linear for a p5.Vector
 * @param {number} t Current time, to use in the interpolation
 * @param {Array.<number>} time Array of time stamps at which a given value is reached
 * @param {Array.<number>} values Array of values to interpolate among
 * @param {boolean} linear Whether to use linear interpolation or not
 * @returns {number} The interpolated value
 */
function rampInterpolation2D(t, time, values, linear = interpolationType.linear) {
    if (values.length == 1) {
        return values[0];
    }
    let interp = 0;
    while (interp < time.length - 1 && time[interp + 1] <= t) {
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


/**
 * Checks whether a particle will collide with another particle
 * or a collider and resolves the collision accordingly.
 * WARNING: Not yet implemented
 * @param {Fresco.Particle} particle A particle to check the collisons for
 * @param {number} dt Timestep between frames
 */
function solveCollision(particle, dt) {
    throw "collision is not yet implemented";
}


/**
 * Utility to create a basic particle at specified position
 * @param {number} x X-coordinate of the new particle
 * @param {number} y Y-coordinate of the new particle
 * @param {number} [z] Z-coordinate of the new particle
 */
function createParticle(x, y, z = null) {
    return new Fresco.Particle(createPoint(x, y, z));
}


/**
 * Class for handling particles.
 * Particles are Points which also have a velocity, a mass,
 * a life time, and possibly varying color and transform over life.
 * Particles may be handled in a cinematic fashion or with a physics
 * system
 * @class
 */
Fresco.Particle = class extends Fresco.Point {
    /**
     * @constructor
     * @param {p5.Vector} position Position of the particle when spawned
     * @property {number} lifetime=-1 - Lifetime of the particle. If negative,
     * the particle will live forever.
     * @property {number} mass=1 - Mass of the particle, used when
     * simulating physics
     * @property {boolean} leaveTrail=false - Whether the particle
     * should leave a trail.
     * If true, the trail will contain a shape in which a new vertex
     * will be added with this
     * particle current properties, each time the particle is updated.
     * This will allow for drawing the whole
     * trajectory of the particle at once, or simply the displacement
     * since the previous position.
     * @property {number} maxTrailLength=-1 - Maximum length of the the trail
     * (in number of successive positions)
     * @property {Array.<Array.<number>>} colorOverLife Colors
     * to interpolate between during the life of the particles. Each color
     * should be an array of 4 RGBA values in the range [0, 255].
     * @property {Array.<number>} colorOverLifeTime Timestamps at
     * which the particle should reach a given color. This array should
     * have the same length as the colorOverLife array.
     * @property {boolean} colorInterpolation=linear - Color interpolation mode,
     * either `linear` or `constant`
     * @property {Array.<p5.Vector>} scaleOverLife Scales to interpolate
     * between over the life of the particle.
     * @property {Array.<number>} scaleOverLifeTime Timestamps at
     * which the particle should reach a given scale. This array should
     * have the same length as the colorOverLife array.
     * @property {boolean} scaleInterpolation=linear - Scale interpolation mode,
     * either `linear` or `constant`
     * @property {Array.<number>} rotationOverLife Rotations to interpolate
     * between over the life of the particle.
     * @property {Array.<number>} rotationOverLifeTime Timestamps at
     * which the particle should reach a given rotation. This array should
     * have the same length as the colorOverLife array.
     * @property {boolean} rotationInterpolation=linear - Rotation interpolation mode,
     * either `linear` or `constant`
     * @property {boolean} simulatePhysics=false - Whether to simulate physics or use a
     * purely cinematic approach for handling the particle motion.
     * @property {boolean} handleCollisions=false - Whether to simulate collisions.
     * WARNING: Currently not supported
     * @property {number} lastUpdate Time of last update.
     * @property {number} birthDate Time at creation of the particle
     * @property {p5.Vector} acceleration=0,0 - Current acceleration of the particles.
     * Used only if `simulatePhysics==true`
     * @property {p5.Vector} velocity=0,0 - Current velocity of the particle
     * @property {boolean} isDead=false - Whether the particle is dead. If it is it cannot be drawn,
     * will not be updated and will be removed at the end of the next simulation step. Particles should
     * not be manually deleted and this boolean should be used instead.
     * @property {boolean} stopSimulate=false - Prevents the particle from further being updated.
     * The particle will remain alive and can still be drawn.
     * @property {Fresco.Point} previousPosition=null - Position at the previous timestep.
     */
    constructor(position) {
        super(position);

        this.lifetime = -1; // a negative life time means
                            // the particle never dies
        
        this.mass = 1;
        this.leaveTrail = false; // if true, this particle will
                                 // slowly define a shape
        this.maxTrailLength = -1;
        this.trail;

        // evolve properties over time.
        // note: because the lifetime is infinite, we can just base the
        // control point over a fraction of the lifetime. Instead
        // we define a time for each control point.
        this.colorOverLife = [this.color];
        this.colorOverLifeTime = [0];
        this.colorInterpolation = interpolationType.linear;
        this.scaleOverLife = [this.scale];
        this.scaleOverLifeTime = [0];
        this.scaleInterpolation = interpolationType.linear;
        this.rotationOverLife = [this.rotation];
        this.rotationOverLifeTime = [0];
        this.rotationInterpolation = interpolationType.linear;

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

        this.stopSimulate = false; // if true the particle will not be updated anymore, and
                                   // drawLastMove will return without doing anything

        this.previousPosition; // Position at previous time step
        // register this particle in the simulation
        append(particles, this);
    }

    /**
     * Manually casts the particle to a Point
     * @returns {Fresco.Point} The particle reinterpreted (hand "casted") 
     * to a Fresco.Point
     */
    asPoint() {
        let nu_point = new Fresco.Point(this.position());
        nu_point.color = this.color;
        nu_point.rotation = this.rotation;
        nu_point.radius = this.radius;
        nu_point.scale = this.scale.copy();
        return nu_point;
    }


    /**
     * Sets a particle's color and changes colorOverLife so that the particle's
     * color stays at the specified colro
     * @param {Array.<number>} color Particle color as an array of RGBA values in the [0, 255] range 
     */
    setColor(color) {
        this.color = color;
        this.colorOverLife = [color];
        this.colorOverLifeTime = [0];
    }


    /**
     * Sets a particle's sacle and changes scaleOverLife so that the particle's
     * scale stays at the specified scale
     * @param {Array.<p5.Vector>} scale Particle scale
     */
    setScale(scale) {
        this.scale = scale;
        this.scaleOverLife = [scale];
        this.scaleOverLifeTime = [0];
    }


    /**
     * Sets a particle's rotation and changes rotationOverLife so that the particle's
     * rotation stays at the specified colro
     * @param {number} rotation Particle rotation in radians
     */
    setRotation(rotation) {
        this.rotation = rotation;
        this.rotationOverLife = [rotation];
        this.rotationOverLifeTime = [0];
    }


    /**
     * Updates the particle accelration base don the various forces and its mass.
     */
    updateAcceleration() {
        this.acceleration = createVector(0, 0);
        for (let i = 0; i < forces.length; i++) {
            this.acceleration.add(forces[i].applyForce(this));
        }
        // Only now do we update the previous position as it may be necessary to
        // know it to compute some forces / accelerations
        this.storePreviousPosition();
        this.acceleration.div(this.mass);
    }


    /**
     * Update the properties of a particle based on the current simulation time
     */
    update() {
        if (!this.stopSimulate) {
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
            this.color = rampArrayInterpolation(
                t, this.colorOverLifeTime,
                this.colorOverLife, this.colorInterpolation
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
                // buffer position before move , as previous position
                this.storePreviousPosition();
                // else move the particle based on velocity only
                this.add(this.velocity.copy().mult(dt));
            }

            // if the particle is to leave a trail, add the current 
            // position to the trail shape vertices (or create it)
            if (this.leaveTrail) {
                this.addCurrentPositionToTrail()
            }
        }
    }

    /**
     * If the particle is to leave a trail, add a copy of this particle as a `Fresco.Point`
     * to the trail `Fresco.Shape`
     */
    addCurrentPositionToTrail() {
        if (this.trail) {
            append(this.trail.vertices, this.asPoint());
            if (this.maxTrailLength > 0) {
                if (this.trail.vertices.length > this.maxTrailLength) {
                    this.trail.vertices.splice(0, 1);
                }
            }
        }
        else {
            this.trail = new Fresco.Shape([this.asPoint()]);
            this.trail.strokeWeight = this.radius;
        }
    }

    /**
     * Saves the current position as the previous position.
     * Call before applying any movement to the particle
     */
    storePreviousPosition() {
        this.previousPosition = this.asPoint();
    }

    /**
     * Draws the particle or its full trail if it is to leave a trail
     */
    draw() {
        if (this.leaveTrail) {
            if (this.trail && this.trail.vertices.length > 1) {
                this.trail.draw(true);
            }
            else {
                stroke(this.color);
                strokeWeight(this.radius);
                drawPoint(this);
            }
        }
        else {
            strokeWeight(this.radius);
            stroke(this.color);
            drawPoint(this);
        }
    }


    /**
     * Draws all the points in the trail if this particle leaves a trail, or this particle only
     */
    drawPoints() {
        if (this.leaveTrail && this.trail && this.trail.vertices.length > 1) {
            this.trail.drawPoints();
        }
        else {
            stroke(this.color);
            strokeWeight(this.radius);
            drawPoint(this);
        }
    }

    /**
     * If this particle leaves a trail, draws a line form the last but one 
     * position in the trail to the current one.
     */
    drawLastMove() {
        if (!this.stopSimulate) {
            stroke(this.color);
            strokeWeight(this.radius);

            let start = this.previousPosition;
            // account for the case where we may have stored the postion in the
            // trail instead of the previousPosition buffer 
            if (!start && this.leaveTrail) {
                start = this.trail.vertices[this.trail.vertices - 2];
            }
            if (start) {
                // Draw the line between the start point and current one
                drawLine(this, this.previousPosition);
            }
        }
    }
}


/**
 * Generic class for a force, enforcing the API
 * @class
 */
Fresco.Force = class {
    /**
     * @constructor
     * @property {boolean} isDead=false - If true, the force will not be
     * considered in the dynamic simulation anymore and will be destroyed
     * at the end of the next simulation step. Forces should not be manually
     * deleted and this boolean should be used instead.
     */
    constructor() {
        append(forces, this);
        this.isDead = false; // whether the force should be de-referenced
    }

    /**
     * Returns the force applied to a given particle
     * @param {Fresco.Particle} particle Particle to apply the force to
     */
    applyForce(particle) {
    }
}


/**
 * Gravitational force
 * @class
 * @extends Fresco.Force
 */
Fresco.Gravity = class extends Fresco.Force {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /** 
     * Returns the weight of a particle, which is to say the 
     * gravitational froce appled by the earth on this particle
     * @param {Fresco.Particle} particle Particle to apply the force to
     */
    applyForce(particle) {
        return createVector(0, 1).mult(g * particle.mass);
    }
}


/**
 * Attractor force.
 * @class
 * @extends Fresco.Force
 */
Fresco.Attractor = class extends Fresco.Force {
    /**
     * @constructor
     * @param {p5.Vector} position Center of the attractor
     * @param {number} intensity Intensity of the force
     * @param {number} cutoff Distance beyond which a particle
     * will not be affected
     * @param {number} [falloff] Power of the decay with distance.
     * Typically gravitational attraction
     * decays in `1 / distance^2` which corresponds to `falloff = -2`
     * @property {p5.Vector} position Center of the attractor
     * @property {number} intensity Intensity of the force
     * @property {number} cutoff Distance beyond which a particle
     * will not be affected
     * @property {number} falloff Power of the decay with distance.
     */
    constructor(position, intensity, cutoff, falloff = -2) {
        super();
        this.position = position; // attraction center.
        this.intensity = intensity; // force intensity
        this.cutoff = cutoff; // radius of influence. If negative, will be ignore
        this.falloff = falloff; // power of decay with distance to the enter
    }

    /**
     * Returns the attraction force on a given particle. The intensity depeds on
     * the distance of the particle to center of the attractor.
     * @param {Fresco.Particle} particle Particle to apply the force to
     */
    applyForce(particle) {
        let direction = this.position.copy().sub(particle);
        let magnitude = direction.mag();

        // if further than cutoff, ignore
        if (this.cutoff > 0 && magnitude > this.cutoff) {
            return createVector(0, 0);
        }
        
        // apply the polynomial decay to the magnitude and then multiply by the force intensity
        magnitude = Math.pow(magnitude, this.falloff) * this.intensity;

        // return the force along the normalized direction
        return direction.normalize().mult(magnitude);
    }
}


/**
 * Simulates a burst of force which can be used to simulate explosions.
 * All particles within the radius of impact will be affected.
 * The force burst will decay linearly over life.
 * @class
 * @extends Fresco.Force
 */
Fresco.Burst = class extends Fresco.Force {
    /**
     * @constructor
     * @param {p5.Vector} position Center of the blast
     * @param {number} intensity Intensity of the force
     * @param {number} radius Radius of influence
     * @param {number} [decayTime] How fast the burst decays and stops
     * @property {p5.Vector} position Center of the blast
     * @property {number} intensity Intensity of the force
     * @property {number} radius Radius of influence
     * @property {number} decayTime How fast the burst decays and stops
     */
    constructor(position, intensity, radius, decayTime=1e-3) {
        super();
        this.position = position;
        this.intensity = intensity;
        this.radius = radius;
        this.decayTime = decayTime;
    }

    /**
     * Returns the burst force appied onto a particle
     * @param {Fresco.Particle} particle Particle to apply the force to
     */
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


/**
 * Simulates kinetic drag
 * @class
 * @extends Fresco.Force
 */
Fresco.Drag = class extends Fresco.Force {
    /**
     * @constructor
     * @param {number} intensity Drag intensity multiplier
     * @property {number} intensity Drag intensity multiplier
     */
    constructor(intensity = 1) {
        super();
        this.intensity = intensity;
    }

    /**
     * Retuns the drag applied to a particle which is equal -mu.mv^2
     * @param {Fresco.Particle} particle Particle to apply the force to
     */
    applyForce(particle) {
        // - mu * v^2
        return this.velocity.copy().mult(this.velocity).mult(- this.intensity);
    }
}


Fresco.CurlForce = class extends Fresco.Force {
    constructor(intensity, noiseFreq) {
      super();
      this.intensity = intensity;
      this.noiseFreq = noiseFreq;
    }
  
    applyForce(particle) {
      return curlNoise2D(
        perlin, 0.01,
        (particle.x + width / 2) * this.noiseFreq,
        (particle.y + height / 2) * this.noiseFreq).mult(this.intensity)
    }
}
  

Fresco.VanDerWaals = class extends Fresco.Force {
constructor(intensity, radius, pushPower, pullPower, x = 0, y = 0) {
    if (pushPower > 0) {
    throw "Push power must be negative"
    }
    if (pullPower > pushPower) {
    throw "If the pull power becomes larger than the push power, the force will diverge"
    }
    super();
    this.intensity = intensity;
    this.radius = radius;
    this.position = createVector(x, y);
    this.pushPower = pushPower;
    this.pullPower = pullPower;
}

applyForce(particle) {
    let normalizedDist = particle.dist(this.position) / this.radius;
    let amplitude = this.intensity *
    (Math.pow(normalizedDist, this.pushPower) -
    Math.pow(normalizedDist, this.pullPower));
    return this.position.copy().sub(particle).normalize().mult(amplitude);
}
}


/**
 * A template emitter class, which is to say a class which will create particles over time
 * following some set properties. Each particle's oewn properties will be chosen randomly
 * whithin the ranges defined in this class.
 * @class
 */
Fresco.Emitter = class {
    /**
     * @constructor
     * @property {p5.Vector} minV=-1,-1 - Minimum velocity attributed to a particle upon spawn.
     * @property {p5.Vector} maxV=-1,-1 - Maximum velocity attributed to a particle upon spawn.
     * @property {number} minLife=-1 - Minimum lifetime attributed to a particle upon spawn.
     * @property {number} maxLife=-1 - Maximum lifetime attributed to a particle upon spawn.
     * @property {number} minMass=1 - Minimum mass attributed to a particle upon spawn.
     * @property {number} maxMass=1 - Maximum mass attributed to a particle upon spawn.
     * @property {number} radius=1 - Radius attributed to a particle upon spawn.
     * @property {Array.<Array.<number>>} colorOverLife Colors
     * to interpolate between during the life of the particles. Each color
     * should be an array of 4 RGBA values in the range [0, 255].
     * @property {Array.<number>} colorOverLifeTime Timestamps after spawn at
     * which a given particle should reach a given color. This array should
     * have the same length as the colorOverLife array.
     * @property {boolean} colorInterpolation=linear - Color interpolation mode,
     * either `linear` or `constant`
     * @property {Array.<p5.Vector>} scaleOverLife Scales to interpolate
     * between over the life of the particle.
     * @property {Array.<number>} scaleOverLifeTime Timestamps after spawn at
     * which a given particle should reach a given scale. This array should
     * have the same length as the colorOverLife array.
     * @property {boolean} scaleInterpolation=linear - Scale interpolation mode,
     * either `linear` or `constant`
     * @property {Array.<number>} rotationOverLife Rotations to interpolate
     * between over the life of the particle.
     * @property {Array.<number>} rotationOverLifeTime Timestamps after spawn at
     * which tha given particle should reach a given rotation. This array should
     * have the same length as the colorOverLife array.
     * @property {boolean} rotationInterpolation=linear - Rotation interpolation mode,
     * either `linear` or `constant`
     * @property {boolean} simulatePhysics=false - Whether the spawned particles should simulate physics
     * @property {boolean} handleCollisions=false - Whether the spawned particles should handle collisions
     * @property {boolean} leaveTrail=false - Whether the spawned particles should leave a trail
     * @property {number} maxTrailLength=-1 - If positive, specifies the particles maximum trial length
     * in number of positions
     * @property {number} spawnRate=50 - Amount of particles this emitter should try spawning on each
     * simulation step. If the emitter is to burst, this is the total amount of particles that will be spawned
     * @property {number} spawnProbability=1 - Propability for a particle to be spawned. This can be used to add
     * some variability in the number of particles spawned on each simulation step.
     * @property {boolean} burst=false If true, this emitter will only emit particles
     * on a single simulation step and then stop.
     * @property {boolean} isDead=false - If true, this emitter will be deleted at the end of the next
     * simulation step. Do not destroy this emitter manually, use this boolean instead.
     */
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

        // radius of the particles (constant for now)
        this.radius = 1;

        // Particles properties over time. These will be the same for all
        // particles, except for the scale which will be multiplied by the particle
        // overall scale
        this.colorOverLife = [[255, 255, 255, 255]];
        this.colorOverLifeTime = [0];
        this.colorInterpolation = interpolationType.linear;
        this.scaleOverLife = [createVector(1, 1)];
        this.scaleOverLifeTime = [0];
        this.scaleInterpolation = interpolationType.linear;
        this.rotationOverLife = [0];
        this.rotationOverLifeTime = [0];
        this.rotationInterpolation = interpolationType.linear;

        // Whether the particles should simulate physics and collisions,
        // as well as leave a trail
        this.simulatePhysics = false;
        this.handleCollisions = false;
        this.leaveTrail = false;
        this.maxTrailLength = -1;

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

    /**
     * Makes the required changes such that the spawned particles will have a fixed color, specified by the user
     * @param {Array.<number>} color Array of RGBA values in the [0, 255] range;
     */
    setColor(color) {
        this.colorOverLife = [color];
        this.colorOverLifeTime = [0];
    }


    /**
     * Sets spawned particle's sacle and changes scaleOverLife so that the particle's
     * scale stays at the specified scale
     * @param {Array.<p5.Vector>} scale Particle scale
     */
    setScale(scale) {
        this.scaleOverLife = [scale];
        this.scaleOverLifeTime = [0];
    }


    /**
     * Sets spawned particle's rotation  Over Life so that the particle's
     * rotation stays at the specified colro
     * @param {number} rotation Particle rotation in radians
     */
    setRotation(rotation) {
        this.rotationOverLife = [rotation];
        this.rotationOverLifeTime = [0];
    }
    /**
     * Creates some particles
     */
    spawn() {}
}


/**
 * A punctual emitter.
 * @class
 * @extends Fresco.Emitter
 */
Fresco.PointEmitter = class extends Fresco.Emitter {
    /**
     * @constructor
     * @param {p5.Vector} position Position of the emitter
     * @property {p5.Vector} position Position of the emitter
     */
    constructor(position) {
        super();
        this.position = position;
    }

    /**
     * Create particles.
     */
    spawn() {
        if (!this.isDead) {
            let t;
            for (let i = 0; i < this.spawnRate; i++) {
                if (random() <= this.spawnProbability) {
                    let nu_particle = new Fresco.Particle(this.position);

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
                    nu_particle.color = this.colorOverLife[0];
                    nu_particle.colorOverLife = this.colorOverLife;
                    nu_particle.colorOverLifeTime = this.colorOverLifeTime;
                    nu_particle.colorInterpolation = this.colorInterpolation;
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
                    nu_particle.maxTrailLength = this.maxTrailLength;

                    nu_particle.radius = this.radius;
                }
            }

            if (this.burst) {
                this.isDead = true;
            }
        }
    }
}


/**
 * Emitter which creates particles along the contour of a shape
 * @class
 * @extends Fresco.Emitter
 */
Fresco.ShapeEmitter = class extends Fresco.Emitter {
    /**
     * @constructor
     * @param {Fresco.Shape} shape Shape to emit particles from the contour of
     * @param {boolean} [normalVelocityOnly] If true, the random velocity of emitted particles 
     * will be along the shape's normal only.
     * @property {Fresco.Shape} shape Shape to emit particles from the contour of
     * @property {number} minNormalV=0.1 Minimum amount of velocity along the normal to the
     * shape at the spawn point to add to the particles velocity.
     * @property {number} maxNormalV=0.1 Minimum amount of velocity along the normal to the
     * shape at the spawn point to add to the particles velocity.
     */
    constructor(shape, normalVelocityOnly=true) {
        super();
        this.shape = shape;

        // Amount of initial velocity along
        // the normal to the shape
        this.minNormalV = 0.1;
        this.maxNormalV = 1;

        if (normalVelocityOnly) {
            this.minV = createVector(0, 0);
            this.maxV = createVector(0, 0);
        }
    }

    /**
     * Create particles
     */
    spawn() {
        if (!this.isDead) {
            let t;
            let nu_pos;
            let nrmV;
            for (let i = 0; i < this.spawnRate; i++) {
                if (random() <= this.spawnProbability) {
                    nu_pos = scatter(this.shape, 1, true);
                    let nu_particle = new Fresco.Particle(nu_pos[0]);

                    // assign random velocity in range
                    t = random();
                    nu_particle.velocity.x = (1 - t) * this.minV.x + t * this.maxV.x
                    t = random();
                    nu_particle.velocity.y = (1 - t) * this.minV.y + t * this.maxV.y

                    // add the normal velocity
                    nrmV = this.shape.normalAtPoint(this.shape.toLocalCoordinates(nu_particle), 1e-1);
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
                    nu_particle.color = this.colorOverLife[0];
                    nu_particle.colorOverLife = this.colorOverLife;
                    nu_particle.colorOverLifeTime = this.colorOverLifeTime;
                    nu_particle.colorInterpolation = this.colorInterpolation;
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
                    nu_particle.maxTrailLength = this.maxTrailLength;

                    nu_particle.radius = this.radius;
                }
            }

            if (this.burst) {
                this.isDead = true;
            }
        }
    }
}

/**
 * Simulate a single simulation step. In order, update global time, spawn particles,
 * update particles, remove dead particles, forces and emitters
 * @param {boolean} [real_time] Whether to use real time or simulated time. Using real time
 * is not recommended given the time between 2 calls to this function ay vary, and ths may
 * affect the precision of the simulation
 * @param {number} dT Timestep when using simulated time
 */
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
