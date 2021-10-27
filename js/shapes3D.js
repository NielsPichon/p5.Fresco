// This is a port of fogleman's ln library. Go show some love on his github
// https://github.com/fogleman/ln

const EPS = 1e-9;
const INF = 1e9;

const Axis = {
    None: 'none',
    X: 'x',
    Y: 'y',
    Z: 'z'
}

/**
 * Container class describing a ray
 */
Fresco.Ray = class {
    /**
     * @constructor
     * @param {p5.Vector} ori ray origin 
     * @param {p5.Vector} dir ray direction
     */
    constructor(ori, dir) {
        this.ori = ori;
        this.dir = dir;
        this.invdir = createVector(1, 1, 1).div(dir);
        this.sign = [dir.x < 0, dir.y < 0, dir.z < 0];
    }

    /**
     * Computes the position along the ray direction which is a specified distance from the origin
     * @param {Number} t distance to the origin
     * @returns {p5.Vector} point coordinates
     */
    position(t) {
        return this.ori.copy().add(this.dir.copy().mult(t));
    }
}

/**
 * 4x4 transform matrix
 */
Fresco.Matrix = class {
    constructor(
        x00, x01, x02, x03,
        x10, x11, x12, x13,
        x20, x21, x22, x23,
        x30, x31, x32, x33,
    ) {
        this.x00 = x00; this.x01 = x01; this.x02 = x02; this.x03 = x03;
        this.x10 = x10; this.x11 = x11; this.x12 = x12; this.x13 = x13;
        this.x20 = x20; this.x21 = x21; this.x22 = x22; this.x23 = x23;
        this.x30 = x30; this.x31 = x31; this.x32 = x32; this.x33 = x33;
    }

    /**
     * Applies the transformation matrix to a vector by multiplying the 
     * matrix and the vector. Note this returns a copy, the original is unmodified.
     * @param {Fresco.Point} v Vector to transform
     * @returns {Fresco.Point} Transformed point 
     */
    apply(v) {
        let p = v.copy();
        p.x = this.x00 * v.x + this.x01 * v.y + this.x02 * v.z + this.x03;
        p.y = this.x10 * v.x + this.x11 * v.y + this.x12 * v.z + this.x13;
        p.z = this.x20 * v.x + this.x21 * v.y + this.x22 * v.z + this.x23;
        let w = this.x30 * v.x + this.x31 * v.y + this.x32 * v.z + this.x33;

        p.mult(1 / w);
        return p;
    }

    /**
     * Multiplies this (left) matrix to the other (right).
     * @param {Fresco.Matrix} b other matrix
     * @returns {Fresco.Matrix} the result of the matrix multiplication
     */
    matmul(b) {
        let a = this;
        let x00 = a.x00*b.x00 + a.x01*b.x10 + a.x02*b.x20 + a.x03*b.x30;
        let x10 = a.x10*b.x00 + a.x11*b.x10 + a.x12*b.x20 + a.x13*b.x30;
        let x20 = a.x20*b.x00 + a.x21*b.x10 + a.x22*b.x20 + a.x23*b.x30;
        let x30 = a.x30*b.x00 + a.x31*b.x10 + a.x32*b.x20 + a.x33*b.x30;
        let x01 = a.x00*b.x01 + a.x01*b.x11 + a.x02*b.x21 + a.x03*b.x31;
        let x11 = a.x10*b.x01 + a.x11*b.x11 + a.x12*b.x21 + a.x13*b.x31;
        let x21 = a.x20*b.x01 + a.x21*b.x11 + a.x22*b.x21 + a.x23*b.x31;
        let x31 = a.x30*b.x01 + a.x31*b.x11 + a.x32*b.x21 + a.x33*b.x31;
        let x02 = a.x00*b.x02 + a.x01*b.x12 + a.x02*b.x22 + a.x03*b.x32;
        let x12 = a.x10*b.x02 + a.x11*b.x12 + a.x12*b.x22 + a.x13*b.x32;
        let x22 = a.x20*b.x02 + a.x21*b.x12 + a.x22*b.x22 + a.x23*b.x32;
        let x32 = a.x30*b.x02 + a.x31*b.x12 + a.x32*b.x22 + a.x33*b.x32;
        let x03 = a.x00*b.x03 + a.x01*b.x13 + a.x02*b.x23 + a.x03*b.x33;
        let x13 = a.x10*b.x03 + a.x11*b.x13 + a.x12*b.x23 + a.x13*b.x33;
        let x23 = a.x20*b.x03 + a.x21*b.x13 + a.x22*b.x23 + a.x23*b.x33;
        let x33 = a.x30*b.x03 + a.x31*b.x13 + a.x32*b.x23 + a.x33*b.x33;
        
        return new Fresco.Matrix(
            x00, x01, x02, x03,
            x10, x11, x12, x13,
            x20, x21, x22, x23,
            x30, x31, x32, x33,
        );
    }

    /**
     * Essentially the same as the apply method except we
     * do not divide by the w coeeficient. Used to transform a position.
     * @param {Fresco.Point} v 
     *  @returns {Fresco.Point} Transformed point 
     */
    positionMul(v) {
        let p = v.copy();
        p.x = this.x00 * v.x + this.x01 * v.y + this.x02 * v.z + this.x03;
        p.y = this.x10 * v.x + this.x11 * v.y + this.x12 * v.z + this.x13;
        p.z = this.x20 * v.x + this.x21 * v.y + this.x22 * v.z + this.x23;
        return p;
    }
    

    /**
     * Apply the transformation to a direction vector.
     * @param {Fresco.Point} v Direction
     * @returns {Fresco.Point} Transformed direction
     */
    directionMul(v) {
        let p = v.copy();
        p.x = this.x00 * v.x + this.x01 * v.y + this.x02 * v.z;
        p.y = this.x10 * v.x + this.x11 * v.y + this.x12 * v.z;
        p.z = this.x20 * v.x + this.x21 * v.y + this.x22 * v.z;
        p.normalize();
        return p;        
    }
    
    /**
     * Applies the transform matrix to a ray
     * @param {Fresco.Ray} r
     */
    rayMul(r) {
        r.ori = this.positionMul(r.ori);
        r.dir = this.directionMul(r.dir);
        return r;
    }

    /**
     * Multiplies a box by this matrix
     * @param {Fresco.Box} box 
     * @returns {Fresco.Box} transformed box
     */
    boxMul(box) {
        let r = createVector(this.x00, x10, x20);
        let u = createVector(this.x01, x11, x21);
        let b = createVector(this.x02, x12, x22);
        let t = createVector(this.x03, x13, x23);

        let xa = r.copy().mult(box.min.x);
        let xb = r.copy().mult(box.max.x);
        let ya = u.copy().mult(box.min.y);
        let yb = u.copy().mult(box.max.y);
        let za = b.copy().mult(box.min.z);
        let zb = b.copy().mult(box.max.z);

        let minx = vectorMin(xa, xb);
        let maxx = vectorMax(xa, xb);
        let miny = vectorMin(ya, yb);
        let maxy = vectorMax(ya, yb);
        let minz = vectorMin(za, zb);
        let maxz = vectorMax(za, zb);
        
        let m = minx.add(miny).add(minz).add(t);
        let M = maxx.add(maxy).add(maxz).add(t);

        return new Fresco.Box(m, M);
    }

    /**
     * computes the matrix determinant
     * @returns {Number} matrix determinant
     */
    det() {
        return (
            this.x00 * this.x11 * this.x22 * this.x33 - this.x00 * this.x11 * this.x23 * this.x32 +
            this.x00 * this.x12 * this.x23 * this.x31 - this.x00 * this.x12 * this.x21 * this.x33 +
            this.x00 * this.x13 * this.x21 * this.x32 - this.x00 * this.x13 * this.x22 * this.x31 -
            this.x01 * this.x12 * this.x23 * this.x30 + this.x01 * this.x12 * this.x20 * this.x33 -
            this.x01 * this.x13 * this.x20 * this.x32 + this.x01 * this.x13 * this.x22 * this.x30 -
            this.x01 * this.x10 * this.x22 * this.x33 + this.x01 * this.x10 * this.x23 * this.x32 +
            this.x02 * this.x13 * this.x20 * this.x31 - this.x02 * this.x13 * this.x21 * this.x30 +
            this.x02 * this.x10 * this.x21 * this.x33 - this.x02 * this.x10 * this.x23 * this.x31 +
            this.x02 * this.x11 * this.x23 * this.x30 - this.x02 * this.x11 * this.x20 * this.x33 -
            this.x03 * this.x10 * this.x21 * this.x32 + this.x03 * this.x10 * this.x22 * this.x31 -
            this.x03 * this.x11 * this.x22 * this.x30 + this.x03 * this.x11 * this.x20 * this.x32 -
            this.x03 * this.x12 * this.x20 * this.x31 + this.x03 * this.x12 * this.x21 * this.x30)  
    }

    /**
     * Computes the transposed matrix
     * @returns {Fresco.Matrix} A transposed copy of this matrix
     */
    transpose() {
        return new Fresco.Matrix(
            this.x00, this.x10, this.x20, this.x30,
            this.x01, this.x11, this.x21, this.x31,
            this.x02, this.x12, this.x22, this.x32,
            this.x03, this.x13, this.x23, this.x33
        )
    }

    /**
     * Computes the inverse of this matrix. Because this class is meant as a container 
     * class for 3D transforms, there is no doubt that this matrix can be inverted safely.
     * @returns {Fresco.Matrix} The inverse of this matrix.
     */
    inverse() {
        let d = this.det();
        let a = this;
        let x00 = (a.x12*a.x23*a.x31 - a.x13*a.x22*a.x31 + a.x13*a.x21*a.x32 - a.x11*a.x23*a.x32 - a.x12*a.x21*a.x33 + a.x11*a.x22*a.x33) / d
        let x01 = (a.x03*a.x22*a.x31 - a.x02*a.x23*a.x31 - a.x03*a.x21*a.x32 + a.x01*a.x23*a.x32 + a.x02*a.x21*a.x33 - a.x01*a.x22*a.x33) / d
        let x02 = (a.x02*a.x13*a.x31 - a.x03*a.x12*a.x31 + a.x03*a.x11*a.x32 - a.x01*a.x13*a.x32 - a.x02*a.x11*a.x33 + a.x01*a.x12*a.x33) / d
        let x03 = (a.x03*a.x12*a.x21 - a.x02*a.x13*a.x21 - a.x03*a.x11*a.x22 + a.x01*a.x13*a.x22 + a.x02*a.x11*a.x23 - a.x01*a.x12*a.x23) / d
        let x10 = (a.x13*a.x22*a.x30 - a.x12*a.x23*a.x30 - a.x13*a.x20*a.x32 + a.x10*a.x23*a.x32 + a.x12*a.x20*a.x33 - a.x10*a.x22*a.x33) / d
        let x11 = (a.x02*a.x23*a.x30 - a.x03*a.x22*a.x30 + a.x03*a.x20*a.x32 - a.x00*a.x23*a.x32 - a.x02*a.x20*a.x33 + a.x00*a.x22*a.x33) / d
        let x12 = (a.x03*a.x12*a.x30 - a.x02*a.x13*a.x30 - a.x03*a.x10*a.x32 + a.x00*a.x13*a.x32 + a.x02*a.x10*a.x33 - a.x00*a.x12*a.x33) / d
        let x13 = (a.x02*a.x13*a.x20 - a.x03*a.x12*a.x20 + a.x03*a.x10*a.x22 - a.x00*a.x13*a.x22 - a.x02*a.x10*a.x23 + a.x00*a.x12*a.x23) / d
        let x20 = (a.x11*a.x23*a.x30 - a.x13*a.x21*a.x30 + a.x13*a.x20*a.x31 - a.x10*a.x23*a.x31 - a.x11*a.x20*a.x33 + a.x10*a.x21*a.x33) / d
        let x21 = (a.x03*a.x21*a.x30 - a.x01*a.x23*a.x30 - a.x03*a.x20*a.x31 + a.x00*a.x23*a.x31 + a.x01*a.x20*a.x33 - a.x00*a.x21*a.x33) / d
        let x22 = (a.x01*a.x13*a.x30 - a.x03*a.x11*a.x30 + a.x03*a.x10*a.x31 - a.x00*a.x13*a.x31 - a.x01*a.x10*a.x33 + a.x00*a.x11*a.x33) / d
        let x23 = (a.x03*a.x11*a.x20 - a.x01*a.x13*a.x20 - a.x03*a.x10*a.x21 + a.x00*a.x13*a.x21 + a.x01*a.x10*a.x23 - a.x00*a.x11*a.x23) / d
        let x30 = (a.x12*a.x21*a.x30 - a.x11*a.x22*a.x30 - a.x12*a.x20*a.x31 + a.x10*a.x22*a.x31 + a.x11*a.x20*a.x32 - a.x10*a.x21*a.x32) / d
        let x31 = (a.x01*a.x22*a.x30 - a.x02*a.x21*a.x30 + a.x02*a.x20*a.x31 - a.x00*a.x22*a.x31 - a.x01*a.x20*a.x32 + a.x00*a.x21*a.x32) / d
        let x32 = (a.x02*a.x11*a.x30 - a.x01*a.x12*a.x30 - a.x02*a.x10*a.x31 + a.x00*a.x12*a.x31 + a.x01*a.x10*a.x32 - a.x00*a.x11*a.x32) / d
        let x33 = (a.x01*a.x12*a.x20 - a.x02*a.x11*a.x20 + a.x02*a.x10*a.x21 - a.x00*a.x12*a.x21 - a.x01*a.x10*a.x22 + a.x00*a.x11*a.x22) / d
        
        return new Fresco.Matrix(
            x00, x01, x02, x03,
            x10, x11, x12, x13,
            x20, x21, x22, x23,
            x30, x31, x32, x33,
        );
    }
}

const Identity = new Fresco.Matrix(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
);

/**
 * Creates a translation matrix
 * @param {Fresco.Point} translation Translation vector
 * @returns {Fresco.Matrix} Translation Matrix
 */
const TranslationMatrix = (translation) => new Fresco.Matrix(
    1, 0, 0, translation.x,
    0, 1, 0, translation.y,
    0, 0, 1, translation.z,
    0, 0, 0, 1    
);

/**
 * Creates a scale matrix
 * @param {Fresco.Point} scale Scale vector
 * @returns {Fresco.Matrix} Scale matrix
 */
const ScaleMatrix = (scale) => new Fresco.Matrix(
    scale.x, 0,       0,       0,
    0,       scale.y, 0,       0,
    0,       0,       scale.z, 0,
    0,       0,       0,       1
);

/**
 * Creates a rotation matrix
 * @param {Fresco.Point} axis Rotation axis 
 * @param {Number} angle Angle
 * @returns {Fresco.Matrix} Rotation Matrix
 */
const RotationMatrix = (axis, angle) => {
    let v = axis.copy().normalize();
    let s = Math.sin(angle);
    let c = Math.cos(angle);
    let m = 1 - c; 
    return new Fresco.Matrix (
        m * v.x * v.x + c,       m * v.x * v.y + v.z * s, m * v.z * v.x - v.y * s, 0,
        m * v.x * v.y - v.z * s, m * v.y * v.y + c,       m * v.y * v.z + v.x * s, 0,
        m * v.z * v.x + v.y * s, m * v.y * v.z - v.x * s, m * v.z * v.z + c,       0,
        0,                       0,                       0,                       1
    );
};

/**
 * Returns the Frustrum projection matrix
 * @param {Number} l The x coordinate of the left side of the near projection plane in view space.
 * @param {Number} r The x coordinate of the right side of the near projection plane in view space.
 * @param {Number} b The y coordinate of the bottom side of the near projection plane in view space.
 * @param {Number} t The y coordinate of the top side of the near projection plane in view space.
 * @param {Number} n z distance to the near plane from the origin in view space.
 * @param {Number} f z distance to the far plane from the origin in view space.
 * @returns {Fresco.Matrix} Frustrum projection matrix
 */
const FrustrumProjection = (l, r, b, t, n, f) => {
    let t1 = 2 * n;
    let t2 = r - l;
    let t3 = t - b;
    let t4 = f - n;
    return new Fresco.Matrix(
        t1 / t2, 0,       (r + l) / t2,  0,
        0,       t1 / t3, (t + b) / t3,  0,
        0,       0,       (-f - n) / t4, (-t1 * f) / t4,
        0,       0,       -1,            0
    );
};

/**
 * Returns the Orthographic projection matrix
 * @param {Number} l The x coordinate of the left side of the near projection plane in view space.
 * @param {Number} r The x coordinate of the right side of the near projection plane in view space.
 * @param {Number} b The y coordinate of the bottom side of the near projection plane in view space.
 * @param {Number} t The y coordinate of the top side of the near projection plane in view space.
 * @param {Number} n z distance to the near plane from the origin in view space.
 * @param {Number} f z distance to the far plane from the origin in view space.
 * @returns {Fresco.Matrix} Orthographic projection matrix
 */
const OrthographicProjection = (l, r, b, t, n, f) => {
	return new Fresco.Matrix(
		2 / (r - l), 0,           0,            -(r + l) / (r - l),
		0,           2 / (t - b), 0,            -(t + b) / (t - b),
		0,           0,           -2 / (f - n), -(f + n) / (f - n),
		0,           0,           0,            1
    );
};

/**
 * Creates a Frustrum Projection matrix, defined from the aspect ratio
 * of the image and field of view rather than the plane bounds.
 * @param {Number} fovy Vertical field of view angle in Radians 
 * @param {Number} aspectRatio Camera aspect ratio width / height
 * @param {Number} near z distance to the near plane from the origin in view space.
 * @param {Number} far z distance to the far plane from the origin in view space.
 * @returns {Fresco.Matrix} Frustrum projection matrix
 */
const PerspectiveProjection = (fovy, aspectRatio, near, far) => {
    let ymax = near * Math.tan(fovy / 2);
    let xmax = ymax * aspectRatio;
    return FrustrumProjection(-xmax, xmax, -ymax, ymax, near, far);
}

/**
 * Creates a transform matrix corresponding at 
 * @param {Fresco.Point} eye Eye position
 * @param {Fresco.Point} center Point to look at
 * @param {Fresco.Point} up Up direction
 * @returns {Fresco.Matrix} The LookAt transfrom matrix
 */
const LookAtTransform = (eye, center, up) => {
    let up_normed = up.copy().normalize();
    let f = center.copy().sub(eye).normalize();
    let s = f.cross(up_normed).copy().normalize();
    let u = s.cross(f).copy().normalize();

    let m = new Fresco.Matrix(
        s.x, u.x, -f.x, eye.x,
		s.y, u.y, -f.y, eye.y,
		s.z, u.z, -f.z, eye.z,
		0, 0, 0, 1,
    );

    return m.inverse();
};

/**
 * Rotate vector around specified axis. Note this returns a copy, the original is unmodified.
 * @param {Fresco.Point} axis Rotation axis 
 * @param {Number} angle 
 * @param {Fresco.Point} v 
 */
function rotateVector(axis, angle, v) {
    return RotationMatrix(axis, angle).apply(v);
}

/**
 * Scale a vector along all 3 axes. Note this returns a copy, the original is unmodified.
 * @param {Fresco.Point} v Vector to scale
 * @param {Fresco.Point} scale Scale vector
 * @returns The modified vector
 */
function scaleVector(v, scale) {
    let p = v.copy();
    p.x *= scale.x;
    p.y *= scale.y;
    p.z *= scale.z;

    return p;
}

/**
 * Translate a vector along all 3 axes. Note this returns a copy, the original is unmodified.
 * @param {Fresco.Point} v Vector to scale
 * @param {Fresco.Point} translation Scale vector
 * @returns {Fresco.Point} The modified vector
 */
function translateVector(v, translation) {
    let p = v.copy();
    p.x += translation.x;
    p.y += translation.y;
    p.z += translation.z;

    return p;
}

 
/**
 * Container describing a ray hit
 */
Fresco.Hit = class {
    /**
     * @constructor
     * @param {Fresco.Shape} shape Hit shape
     * @param {Number} distance Distance from the camera of the hit 
     */
    constructor(shape, distance) {
        this.shape = shape;
        this.distance = distance
    }

    OK() {
        return hit.distance < INF;
    }

    Min(otherHit) {
        if (otherHit.distance <= this.distance) {
            return otherHit;
        }
        else {
            return this;
        }
    }

    Max(otherHit) {
        if (otherHit.distance < this.distance) {
            return this;
        }
        else {
            return otherHit;
        }        
    }
}

const NoHit = new Fresco.Hit(null, INF);

Fresco.Shape3D = class {
    getBoundingBox() {return null};
    computeRayIntersection(r) {return NoHit};
    toShapes() {return []};
    contains() {return false};
}

/**
 * Class describing a 3D Axis Aligned Bbox
 */
 Fresco.Box = class extends Fresco.Shape3D {
    /**
     * @constructor
     * @param {p5.Vector} m position of the closest bottom left corner
     * @param {p5.Vector} M position of the furthest top right corner 
     */
    constructor(m, M) {
        super()
        this.min = m;
        this.max = M;
    }

    /**
     * Computes the size of the box
     * @returns {p5.Vector} Box size along each axis
     */
    size() {
        return this.max.copy().sub(this.min);
    }

    /**
     * Returns the absolute position of an anchor point
     * @param {p5.Vector} v Position of an anchor point in local coordinates 
     */
    anchor(v) {
        return this.min.copy().add(this.size().mult(v));
    }

    /**
     * Computes the center of the box
     * @returns {p5.Vector} Position of the center of the box
     */
    center() {
       return this.anchor(createVector(0.5, 0.5, 0.5))
    }

    /**
     * Checks whether this box contains a point
     * @param {p5.Vector} v point 
     * @returns {Boolean} Whether the point is contained
     */
    contains(v) {
        return (
            this.min.x <= v.x && this.max.x >= v.x &&
		    this.min.y <= v.y && this.max.y >= v.y &&
		    this.min.z <= v.z && this.max.z >= v.z
        )
    }

    /**
     * Translates this box
     * @param {p5.Vector} translation 
     */
    translate(translation) {
        this.min.add(translation);
        this.max.add(translation);
    }

    /**
     * Scale this box
     * @param {p5.Vector} scaleVector
     */
    scale(scaleVector) {
        // Center the shape on zero
        let c = this.center();
        this.min.sub(c);
        this.max.sub(c);

        // scale each corner by half the transform
        scaleVector.mult(0.5);
        this.min.mult(scaleVector);
        this.max.mult(scaleVector);

        // move back the shape in place
        this.min.add(c);
        this.max.add(c);
    }

    /**
     * Extends this box to also contain the other box
     * @param {Fresco.Box} b other box 
     * @returns {Fresco.Box} Encompassing box
     */
    extend(b) {
        return new Fresco.Box(vectorMin(this.min, b.min), vectorMax(this.max, b.max));
    }

    /**
     * Computes whether a point is outside the box along a certain axis
     * @param {Number} value Coordinate of the point along the specified axis 
     * @param {String} axis Axis along which to check the partition 
     * @returns {Boolean} Whether the coordinate is outside the box
     */
    partition(value, axis) {
        let left = false;
        let right = false;
        switch (axis) {
            case Axis.X:
                left = this.min.x <= value
                right = this.max.x >= value
                break;
            case Axis.Y:
                left = this.min.y <= value
                right = this.max.y >= value
                break;
            case Axis.Z:
                left = this.min.z <= value
                right = this.max.z >= value
                break;
            default:
                console.log('Partition method expects a defined axis');
                break;
        }

        return [left, right];
    }

    getBoundingBox() {
        return this;
    }

    /**
     * Computes the intersection of a ray with this box. Note: This method is weird.
     * @param {Fresco.Ray} r Ray 
     * @returns {Fresco.Hit} Hit
     */
     computeRayIntersection(r) {
        let m = this.min.copy().sub(r.ori).div(r.dir);
        let M = this.max.copy().sub(r.ori).div(r.dir);

        // flip coordinates such that m contains the closest points and M the farthest
        if (m.x > M.x) {
            let buf = m.x;
            m.x = M.x;
            M.x = buf;
        } 
        if (m.y > M.y) {
            let buf = m.y;
            m.y = M.y;
            M.y = buf;
        }
        if (m.z > M.z) {
            let buf = m.z;
            m.z = M.z;
            M.z = buf;
        }

        let tmin = Math.max(Math.max(m.x, m.y), m.z);
        let tmax = Math.min(Math.min(M.x, M.y), M.z);

        if (tmin < 1e-3 && tmax > 1e-3) {
            return [new Fresco.Hit(this, tmax), tmin, tmax];
        }
        else if (tmin >= 1e-3 && tmin <= tmax) {
            return [new Fresco.Hit(this, tmin), tmin, tmax];
        }
        return [NoHit, tmin, tmax];
    }

    toShapes(){return []};
}

/**
 * Constructs a 3D triangle, which is the basic 
 * building bloc of triangular meshes.
 */
Fresco.Tri3D = class extends Fresco.Shape3D {
    /**
     * @constructor
     * @param {Fresco.Point} v1 
     * @param {Fresco.Point} v2 
     * @param {Fresco.Point} v3 
     */
    constructor(v1, v2, v3) {
        super();
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.aabb;
        this.updateBoundingBox();
    }

    /**
     * Recomputes the bounding box of this triangle
     */
    updateBoundingBox() {
        let m = vectorMin(vectorMin(this.v1, this.v2), this.v3);
        let M = vectorMax(vectorMax(this.v1, this.v2), this.v3);
        this.aabb = new Fresco.Box(m, M);
    }

    /**
     * Returns the bounding box of this triangle
     * @returns {Fresco.Box} The Axis Aligned Bounding Box
     */
    getBoundingBox() {
        return this.aabb;
    }

    contains(v) {
        return false;
    }

    /**
     * Compute the intersection of a ray with the triangle
     * @param {Fresco.Ray} r Intersecting ray
     * @returns {Fresco.Hit} Hit object corresonding to the ray hit
     */
    computeRayIntersection(r) {
        let ori = r.ori;
        let dir = r.dir;

        let edge_1 = this.v2.position().sub(this.v1);
        let edge_2 = this.v3.position().sub(this.v2);

        let cross_prod = dir.cross(edge_2);
        let det = edge_1.dot(cross_prod);

        if (Math.abs(det) < EPS) {
            return NoHit;
        }

        let inv = 1 / det;
        let t = ori.copy().sub(this.v1);
        let u = inv * t.dot(cross_prod);

        if (u < 0 || u > 1) {
            return NoHit;
        }

        let q = t.cross(edge_1);
        let v = inv * q.dot(dir);

        if (v < 0 || u + v > 1) {
            return NoHit;
        }

        let dist = edge_2.dot(q) * inv;

        if (d < EPS) {
            return NoHit;
        }

        return new Fresco.Hit(this, dist);
    }

    /**
     * Returns the Fresco.Shape associated to this triangle.
     * @returns {Array<Fresco.Shape>} Array containing the Fresco.Shape corresponding to the shape
     */
    toShapes() {
        let tri = new Fresco.Shape([this.v1.copy(), this.v2.copy(), this.v3.copy()]);
        tri.isPolygonal = true;
        return [tri];
    }
}

Fresco.Cube = class extends Fresco.Box {
    getBoundingBox() {
        return new Fresco.Box(this.min, this.max)
    }

    /**
     * Checks whether a point is more or less contained in the cube, with some tolerance
     * @param {Fresco.Point} v point 
     * @param {Number} tolerance Tolerance
     * @returns {Boolean} Whether the point is approximately contained in the cube
     */
    approximatelyContains(v, tolerance) {
        let plus = createVector(tolerance, tolerance, tolerance);
        let b = new Fresco.Box(this.min.copy().sub(plus), this.max.copy().add(plus))
        return b.contains(v);
    }

    computeRayIntersection(r) {
        let [hit, tmin, tmax] = super.computeRayIntersection(r);
        return hit;
    }

    /**
     * Returns a number of lines to hatch fill the specified face 
     * @param {Number} angle hatch angle
     * @param {Number} spacing hatch lines spacing
     * @param {String} face hatch face specified as e.g. "+xy" where + or - specify it is the face on
     * the max or min corner side and the 2 letters indicate the plane (xy, yz, xz)
     */
    hatchFace(angle, spacing, face) {
        let l;
        let r;

        switch (face.substring(1)) {
            case 'xy':
                l = createPoint(this.min.x, this.min.y);
                r = createPoint(this.max.x, this.max.y);
                break;
            case 'yz':
                l = createPoint(this.min.y, this.min.z);
                r = createPoint(this.max.y, this.max.z);
                break;
            case 'xz':
                l = createPoint(this.min.x, this.min.z);
                r = createPoint(this.max.x, this.max.z);
                break;   
        }

        let square = new Fresco.Shape([l, createPoint(l.x, r.y), r, createPoint(r.x, l.y), l]);
        square.isPolygonal = true;

        let lines = square.hatchFill(angle, spacing);

        let p;
        if (face.substring(0, 1) === '+') {
            p = this.max;
        }
        else {
            p = this.min;
        }

        switch (face.substring(1)) {
            case 'xy':
                lines.forEach(l => {
                    l.vertices.forEach(v => {
                        v.z = p.z;
                    })
                })
                break;
            case 'yz':
                lines.forEach(l => {
                    l.vertices.forEach(v => {
                        v.z = v.y;
                        v.y = v.x;
                        v.x = p.x;
                    })
                })
                break;
            case 'xz':
                lines.forEach(l => {
                    l.vertices.forEach(v => {
                        v.z = v.y;
                        v.x = v.x;
                        v.y = p.y;
                    })
                })
                break;   
        }

        return lines;
    }

    toShapes() {
        let m = this.min;
        let M = this.max;
        return [
            new Fresco.Line(createVector(m.x, m.y, m.z), createVector(m.x, m.y, M.z)),
            new Fresco.Line(createVector(m.x, m.y, m.z), createVector(m.x, M.y, m.z)),
            new Fresco.Line(createVector(m.x, m.y, m.z), createVector(M.x, m.y, m.z)),
            new Fresco.Line(createVector(m.x, m.y, M.z), createVector(m.x, M.y, M.z)),
            new Fresco.Line(createVector(m.x, m.y, M.z), createVector(M.x, m.y, M.z)),
            new Fresco.Line(createVector(m.x, M.y, m.z), createVector(m.x, M.y, M.z)),
            new Fresco.Line(createVector(m.x, M.y, m.z), createVector(M.x, M.y, m.z)),
            new Fresco.Line(createVector(m.x, M.y, M.z), createVector(M.x, M.y, M.z)),
            new Fresco.Line(createVector(M.x, m.y, m.z), createVector(M.x, M.y, m.z)),
            new Fresco.Line(createVector(M.x, m.y, m.z), createVector(M.x, m.y, M.z)),
            new Fresco.Line(createVector(M.x, m.y, M.z), createVector(M.x, M.y, M.z)),
            new Fresco.Line(createVector(M.x, M.y, m.z), createVector(M.x, M.y, M.z)),
        ];
    }
}

const boolType = {
    intersection: 'inter',
    difference: 'diff'
}

Fresco.BooleanShape = class extends Fresco.Shape3D {
    /**
     * @constructor
     * @param {Fresco.Shape3D} A 
     * @param {Fresco.Shape3D} B 
     * @param {String} type 
     */
    constructor(A, B, type) {
        super();
        this.A = A;
        this.B = B;
        this.type = type;
        this.aabb = this.A.getBoundingBox().extend(this.B.getBoundingBox());
    }

    getBoundingBox() {
        return this.aabb;
    }

    contains(v) {
        switch (this.type) {
            case boolType.intersection:
                return this.A.contains(v) && this.B.contains(v);
                break;
            case boolType.difference:
                return this.A.contains(v) && !this.B.contains(v);
        }
    }

    computeRayIntersection(r) {
        let h1 = this.A.computeRayIntersection(r);
        let h2 = this.B.computeRayIntersection(r);

        let h;
        if (h1.distance <= h2.distance) {
            h = h1;
        }
        else {
            h = h2;
        }

        let v = r.position(h.distance);

        // If there is no hit, return. 
        // If there is a hit and it is contained in the resulting boolean, return the hit.
        if (!h.OK() || this.contains(v)) {
            return h;
        }
        // otherwise, trace a new ray from the hit point (offset by a tiny amount).
        else {
            return s.computeRayIntersection(new Ray(r.position(h.distance + 0.001), r.dir))
        }
    }

    toShapes() {
        // Note that we return both shapes in their entirety but their
        // vertices will be pruned upon ray tracing which is much simpler
        return [...this.A.toShapes(), ...this.B.toShapes()];
    }
}

/**
 * Converts a basic 2D shape into an occluding 3D shape
 */
Fresco.ArbitraryShape = class extends Fresco.Shape3D {
    /**
     * @constructor
     * @param {Fresco.Shape} shape 
     */
    constructor(shape) {
        super();
        if (this.isPolygonal) {
            console.log('Warning! Shapes3D does not support non polygonal shapes.' +
                'End result may look weird.')
        }
        this.shape = shape;
        this.tris = [];
    }

    contains(v) {
        return isInside(v, this.shape, true);
    }

    getBoundingBox() {
        return new Fresco.Box(...this.shape.getBoundingBox());
    }

    /**
     * Converts this shape to triangles
     */
    triangulate() {
        if (!this.shape.isClosed()) {
            return;
        }

        let n = this.shape.vertices.length - 2;
        let s = 0;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            if (i % 2 == 0) {
                this.tris.push(new Fresco.Tri3D(
                    this.shape.vertices[s].copy(),
                    this.shape.vertices[s + 1].copy(),
                    this.shape.vertices[n].copy()
                ));
                s ++;
            }
            else {
                this.tris.push(new Fresco.Tri3D(
                    this.shape.vertices[s].copy(),
                    this.shape.vertices[n].copy(),
                    this.shape.vertices[n - 1].copy()
                ));
                n--;
            }
            if (s == n - 1) {
                break;
            }
        }
    }

    computeRayIntersection(r) {
        let h = NoHit;
        this.tris.forEach(t => {
            let h1 = t.computeRayIntersection(r);
            if (h1.distance < h.distance) {
                h = h1;
            }
        })
        return h;
    }

    toShapes() {
        return [this.shape];
    }
}

/**
 * Planar quadrilateral mesh
 */
Fresco.Quad = class extends Fresco.ArbitraryShape {
    /**
     * @constructor
     * @param {p5.Vector} v1 vertex 
     * @param {p5.Vector} v2 vertex 
     * @param {p5.Vector} v3 vertex 
     * @param {p5.Vector} v4 vertex 
     */
    constructor(v1, v2, v3, v4) {
        let quad = new Fresco.Shape([v1, v2, v3, v4]);
        quad.isPolygonal = true;
        super(quad);
    }
}

/**
 * Polygonal mesh made of triangles and quads
 */
Fresco.Polymesh = class extends Fresco.Shape3D {
    constructor(vertices, faces) {
        this.vertices = vertices;
        this.faces = faces;
        this.shapes = [];
        this.edges = [];
        faces.forEach(f => {
            if (f.length > 4 || f.length <= 2) {
                console.log('Polymesh only suports tris and quads');
            }
            else {
                if (f.length == 3) {
                    this.shapes.push(new Fresco.Tri3D(...f));
                }
                else {
                    this.shapes.push(new Fresco.Quad(...f));
                }
                // add edges. We sort the indices such that they are always in increasing order.
                // In a regular ray tracing app this would mess up with the orientation of the face but here we don't care.
                // The reason we do that is that then there are no cases of flipped edges instances in the array, only true duplictes (if any).
                f.sort();
                for (let i = 0; i < f.length - 1; i++) {
                    this.edges.push([f[i], f[i + 1]]);
                }
            }
        })

        // remove duplicate edges
        this.edges = [...new Set(this.edges)];

        this.aabb = new Fresco.Box(createVector(0,0,0), createVector(0,0,0));
        this.shapes.forEach(s => this.aabb = this.aabb.extend(s.getBoundingBox()));
    }

    contains(v) {
        return false;
    }

    getBoundingBox() {
        return this.aabb;
    }

    computeRayIntersection(r) {
        let h = NoHit;
        this.shapes.forEach(s => {
            let h1 = s.computeRayIntersection(r);
            if (h1.distance < h.distance) {
                h = h1;
            }
        })
        return h;
    }

    toShapes() {
        let shapes = [];
        this.edges.forEach(e => shapes.push(new Fresco.Line(...e)));
        return shapes;
    }
}

/**
 * Node of tree acceleration structure
 */
Fresco.Node = class {
    /**
     * @constructor
     * @param {Array<Fresco.Shape3D>} shapes 
     */
    constructor(shapes, point) {
        this.shapes = shapes;
        this.axis = Axis.None;
        this.left;
        this.right;
        this.point = point;
    }

    /**
     * Computes the number of shapes on each side of the partition
     * @param {String} axis 
     * @param {Number} point 
     */
    partitionScore(axis, point) {
        let left, right = 0;
        this.shapes.forEach(s => {
            let box = s.getBoundingBox();
            let [l, r] = box.partition(axis, point);
            if (l) {
                left ++;
            }
            if (r) {
                right ++;
            }

            if (left >= right) {
                return left;
            }
            else {
                return right;
            }
        });
    }


    partition(axis, point) {
        let left, right = [];
        this.shapes.forEach(s => {
            let box = s.getBoundingBox();
            let [l, r] = box.partition(axis, point);
            if (l) {
                left.push(s);
            }
            if (r) {
                right.push(s);
            }
        });
        return [left, right];
    }   

    /**
     * Splits the node into 2 sub nodes at the median,
     * along the axis which best separates the node shapes
     */
    split() {
        if (this.shapes.length < 8) {
            return
        }
        
        let xs = [];
        let ys = [];
        let zs = [];
        this.shapes.forEach(s => {
            let aabb = s.getBoundingBox();
            xs.push(aabb.min.x);
            ys.push(aabb.min.y);
            zs.push(aabb.min.z);
            xs.push(aabb.max.x);
            ys.push(aabb.max.y);
            zs.push(aabb.max.z);
        });

        xs.sort();
        ys.sort();
        zs.sort();

        let median = (arr) => {
            let n = arr.length;
            if (n == 0) {
                return 0;
            }
            else if (n % 2 == 1) {
                return arr[(n + 1) / 2];
            }
            else {
                return 0.5 * (arr[n / 2] + arr[n / 2 - 1]);
            }
        }

        let mx = median(xs);
        let my = median(ys);
        let mz = median(zs);

        let best = Math.floor(this.shapes.length * 0.85);
        let bestAxis = Axis.None;
        let bestPoint = 0.0;

        let sx = this.partitionScore(Axis.X, mx);
        let sy = this.partitionScore(Axis.Y, my);
        let sz = this.partitionScore(Axis.Z, mz);
        if (sx < best) {
            best = sx;
            bestAxis = Axis.X;
            bestPoint = mx;
        }
        if (sy < best) {
            best = sy;
            bestAxis = Axis.Y;
            bestPoint = my;
        }
        if (sz < best) {
            best = sz;
            bestAxis = Axis.Z;
            bestPoint = mz;
        }
        if (bestAxis === Axis.None) {
            return
        }

        let [l, r] = this.partition(bestAxis, bestPoint);
        this.axis = bestAxis;
        this.point = bestPoint;
        this.left = new Fresco.Node(l, bestPoint);
        this.right = new Fresco.Node(r, bestPoint);
        l.split();
        r.split();
        this.shapes = []; // only leaf nodes have shapes
    }

    /**
     * Computes the ray intersection with the shapes in this node
     * @param {Fresco.Ray} r ray
     * @param {Number} t0 min distance to the ray origin
     * @param {Number} t1 max distance to the ray origin
     * @returns {Fresco.Hit} ray hit
     */
    computeRayIntersection(r, t0, t1) {
        let tsplit, leftFirst;
        switch (this.axis) {
            // if the axis is None, this is a leaf node so we hit the shapes
            case Axis.None:
                let hit = NoHit;
                this.shapes.forEach(s => {
                    let h = s.computeRayIntersection(r);
                    if (h.distance < hit.distance) {
                        hit = h;
                    }
                });
                return hit;
                break;
            // otherwise we retrieve hit the 2 children nodes
            case Axis.X:
                tsplit = (this.point - r.ori.x) / r.dir.x;
                leftFirst = r.ori.x < this.point || (r.ori.x == this.point && r.dir.x <= 0);
                break;
            case Axis.Y:
                tsplit = (this.point - r.ori.y) / r.dir.y;
                leftFirst = r.ori.y < this.point || (r.ori.y == this.point && r.dir.y <= 0);
                break;
            case Axis.Z:
                tsplit = (this.point - r.ori.z) / r.dir.z;
                leftFirst = r.ori.z < this.point || (r.ori.z == this.point && r.dir.z <= 0);
                break;
        }

        let n1, n2;
        if (leftFirst) {
            n1 = this.left;
            n2 = this.right;
        }
        else {
            n1 = this.right;
            n2 = this.left;
        }

        if (tsplit > t1 || tsplit <= 0) {
            return n1.computeRayIntersection(r, t0, t1)
        }
        else if (tsplit < t0) {
            return n2.computeRayIntersection(r, t0, t1);
        }
        else {
            let h1 = n1.computeRayIntersection(r, t0, t1);
            if (h1.distance <= tsplit) {
                return h1;
            }
            let h2 = n2.computeRayIntersection(r, t0, t1);
            if (h1.distance <= h2.distance) {
                return h1;
            }
            else {
                return h2;
            }
        }
    }
}

/**
 * Tree structure for making ray tracing fast
 */
Fresco.Tree = class {
    /**
     * @constructor
     * @param {Array<Fresco.Shape3D>} shapes 
     */
    constructor(shapes) {
        // compute bounding box of the scene
        this.aabb = new Fresco.Box(createVector(0, 0, 0), createVector(0, 0, 0));
        shapes.forEach(s => this.aabb = this.aabb.extend(s.getBoundingBox()));

        this.root = new Fresco.Node(shapes, 0);
        this.root.split();
    }

    /**
     * Computes the ray intersection with the shapes in this tree
     * @param {Fresco.Ray} r ray
     * @returns {Fresco.Hit} ray hit
     */
    computeRayIntersection(r) {
        let [hit, tmin, tmax] = this.aabb.computeRayIntersection(r);
        if (hit.distance < NoHit.distance) {
            return this.root.computeRayIntersection(r, tmin, tmax);
        }
        else {
            return NoHit;
        }
    }
}

Fresco.Scene3D = class {
    /**
     * @constructor
     * @property {Array<Fresco.Shape3D>} shapes
     * @property {Array<Fresco.Shape2D>} extraShapes
     * @property {Fresco.Tree} tree
     */
    constructor() {
        this.shapes = [];
        this.tree;
        this.isBuilt = false;
        this.extraShapes = [];
    }

    /**
     * Registers a shape in the scene
     * @param {Fresco.Shape3D} shape The shape to add to the scene 
     */
    registerShape3D(shape) {
        this.shapes.push(shape);
        this.isBuilt = false;
    }

    /**
     * Registers a Freco.Shape. These shapes are not really 
     * 3D and as such it will not occlude anything but can be occluded.
     * @param {Fresco.Shape} shape 
     */
    registerShape2D(shape) {
        this.extraShapes.push(shape);
    }

    /**
     * Builds the tree descriptor of the scene
     */
    buildScene() {
        this.tree = new Fresco.Tree(this.shapes);
        this.isBuilt = true;
    }

    /**
     * 
     */
    computeRayIntersection(r) {
        if (!this.isBuilt) {
            this.buildScene();
        }

        return this.tree.computeRayIntersection(r);
    }

    /**
     * Checks whether a point is visible or occluded by the scene
     * @param {p5.Vector} eye position of the eye 
     * @param {p5.Vector} v position of the point
     * @returns {Boolean} Whether the point is visible
     */
    isVisible(eye, v) {
        let dist = eye.copy().sub(v);
        let r = new Fresco.Ray(v.copy(), dist.copy().normalize());
        let hit = this.computeRayIntersection(r);
        return hit.distance * hit.distance >= dist.magSq();
    }

    /**
     * 
     * @param {p5.Vector} eye Position of the eye/camera
     * @param {p5.Vector} center Point to look at
     * @param {p5.Vector} up Up vector
     * @param {Number} width width of the image
     * @param {Number} height height of the image
     * @param {Number} fovy vertical field of view in Radians
     * @param {Number} near z distance to the near plane from the origin in view space.
     * @param {Number} far z distance to the far plane from the origin in view space.
     * @param {Number} step 
     * @returns {Array<Fresco.Shape>} Rendered shapes
     */
    render(eye, center, up, width, height, fovy, near, far, step) {
        let aspectRatio = width / height;
        let cameraTransform = LookAtTransform(eye, center, up);
        cameraTransform = PerspectiveProjection(fovy, aspectRatio, near, far).matmul(cameraTransform);
        return this.renderWithTransform(cameraTransform, eye, width, height, step);
    }

    renderWithTransform(transform, eye, width, height, subdivisionStep) {
        if (!this.isBuilt) {
            this.buildScene();
        }
        
        let paths = [];
        this.shapes.forEach(s => paths.push(...s.toShapes()));
        paths.push(...this.extraShapes);

        if (subdivisionStep > 0) {
            // subdivide paths
            paths.forEach(p => {
                let buf = []
                for (let i = 0; i < p.vertices.length - 1; i++) {
                    let edge = p.vertices[i + 1].copy().sub(p.vertices[i]);
                    let l = edge.mag();
                    if (i == 0) {
                        buf.push(p.vertices[i].copy());
                    }
                    let d = subdivisionStep;
                    while (d < l) {
                        buf.push(p.vertices[i].copy().add(edge.copy().mult(d / l)));
                        d += subdivisionStep;
                    }

                    buf.push(p.vertices[i + 1]);
                }
                p.vertices = buf;
            });
        }

        let clipBox = new Fresco.Box(createVector(-1, -1, -1), createVector(1, 1, 1));

        // create occlusion filter
        let filter = (v) => {
            let w = transform.apply(v);
            if (!this.isVisible(eye, v)) {
                return [w, false];
            }

            if (!clipBox.contains(w)) {
                return [w, false];
            }

            return [w, true];
        };

        // filter out occluded vertices
        let pathBuf = [];
        paths.forEach(p => {
            let vtxBuf = [];
            p.vertices.forEach(v => {
                let [nuVtx, ok] = filter(v);
                if (ok) {
                    vtxBuf.push(nuVtx);
                }
                else if (vtxBuf.length > 0) {
                    let nuPath = p.copy();
                    nuPath.vertices = vtxBuf;
                    pathBuf.push(nuPath);
                    vtxBuf = [];
                }
            });
            if (vtxBuf.length > 1) {
                let nuPath = p.copy();
                nuPath.vertices = vtxBuf;
                pathBuf.push(nuPath);
            }
        });

        paths = pathBuf;

        //transform all paths
        let scale = createVector(-width / 2, - height / 2, 0);
        paths.forEach(p => {
            p.vertices.forEach(v => {
                v.mult(scale);
            });
        });
        return paths;
    }
}
