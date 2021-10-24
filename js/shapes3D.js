// This is a port of fogleman's ln library. Go show some love on his github
// https://github.com/fogleman/ln

const EPS = 1e-9;
const INF = 1e9;

const Axis = {
    None = 'none',
    X = 'x',
    Y = 'y',
    Z = 'z'
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
        p.x = x00 * v.x + x01 * v.y + x02 * v.z + this.x03;
        p.y = x10 * v.x + x11 * v.y + x12 * v.z + this.x13;
        p.z = x20 * v.x + x21 * v.y + x22 * v.z + this.x23;
        let w = x30 * v.x + x31 * v.y + x32 * v.z + this.x33;

        if (Math.abs(w) < EPS) {
            p.x = INF;
            p.y = INF;
            p.z = INF;
            return p;
        }
        else {
            p.mult(1 / w);
            return p;
        }
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
        p.x = x00 * v.x + x01 * v.y + x02 * v.z + this.x03;
        p.y = x10 * v.x + x11 * v.y + x12 * v.z + this.x13;
        p.z = x20 * v.x + x21 * v.y + x22 * v.z + this.x23;
        return p;
    }
    

    /**
     * Apply the transformation to a direction vector.
     * @param {Fresco.Point} v Direction
     * @returns {Fresco.Point} Transformed direction
     */
    directionMul(v) {
        let p = v.copy();
        p.x = x00 * v.x + x01 * v.y + x02 * v.z;
        p.y = x10 * v.x + x11 * v.y + x12 * v.z;
        p.z = x20 * v.x + x21 * v.y + x22 * v.z;
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
        x00 = (a.x12*a.x23*a.x31 - a.x13*a.x22*a.x31 + a.x13*a.x21*a.x32 - a.x11*a.x23*a.x32 - a.x12*a.x21*a.x33 + a.x11*a.x22*a.x33) / d
        x01 = (a.x03*a.x22*a.x31 - a.x02*a.x23*a.x31 - a.x03*a.x21*a.x32 + a.x01*a.x23*a.x32 + a.x02*a.x21*a.x33 - a.x01*a.x22*a.x33) / d
        x02 = (a.x02*a.x13*a.x31 - a.x03*a.x12*a.x31 + a.x03*a.x11*a.x32 - a.x01*a.x13*a.x32 - a.x02*a.x11*a.x33 + a.x01*a.x12*a.x33) / d
        x03 = (a.x03*a.x12*a.x21 - a.x02*a.x13*a.x21 - a.x03*a.x11*a.x22 + a.x01*a.x13*a.x22 + a.x02*a.x11*a.x23 - a.x01*a.x12*a.x23) / d
        x10 = (a.x13*a.x22*a.x30 - a.x12*a.x23*a.x30 - a.x13*a.x20*a.x32 + a.x10*a.x23*a.x32 + a.x12*a.x20*a.x33 - a.x10*a.x22*a.x33) / d
        x11 = (a.x02*a.x23*a.x30 - a.x03*a.x22*a.x30 + a.x03*a.x20*a.x32 - a.x00*a.x23*a.x32 - a.x02*a.x20*a.x33 + a.x00*a.x22*a.x33) / d
        x12 = (a.x03*a.x12*a.x30 - a.x02*a.x13*a.x30 - a.x03*a.x10*a.x32 + a.x00*a.x13*a.x32 + a.x02*a.x10*a.x33 - a.x00*a.x12*a.x33) / d
        x13 = (a.x02*a.x13*a.x20 - a.x03*a.x12*a.x20 + a.x03*a.x10*a.x22 - a.x00*a.x13*a.x22 - a.x02*a.x10*a.x23 + a.x00*a.x12*a.x23) / d
        x20 = (a.x11*a.x23*a.x30 - a.x13*a.x21*a.x30 + a.x13*a.x20*a.x31 - a.x10*a.x23*a.x31 - a.x11*a.x20*a.x33 + a.x10*a.x21*a.x33) / d
        x21 = (a.x03*a.x21*a.x30 - a.x01*a.x23*a.x30 - a.x03*a.x20*a.x31 + a.x00*a.x23*a.x31 + a.x01*a.x20*a.x33 - a.x00*a.x21*a.x33) / d
        x22 = (a.x01*a.x13*a.x30 - a.x03*a.x11*a.x30 + a.x03*a.x10*a.x31 - a.x00*a.x13*a.x31 - a.x01*a.x10*a.x33 + a.x00*a.x11*a.x33) / d
        x23 = (a.x03*a.x11*a.x20 - a.x01*a.x13*a.x20 - a.x03*a.x10*a.x21 + a.x00*a.x13*a.x21 + a.x01*a.x10*a.x23 - a.x00*a.x11*a.x23) / d
        x30 = (a.x12*a.x21*a.x30 - a.x11*a.x22*a.x30 - a.x12*a.x20*a.x31 + a.x10*a.x22*a.x31 + a.x11*a.x20*a.x32 - a.x10*a.x21*a.x32) / d
        x31 = (a.x01*a.x22*a.x30 - a.x02*a.x21*a.x30 + a.x02*a.x20*a.x31 - a.x00*a.x22*a.x31 - a.x01*a.x20*a.x32 + a.x00*a.x21*a.x32) / d
        x32 = (a.x02*a.x11*a.x30 - a.x01*a.x12*a.x30 - a.x02*a.x10*a.x31 + a.x00*a.x12*a.x31 + a.x01*a.x10*a.x32 - a.x00*a.x11*a.x32) / d
        x33 = (a.x01*a.x12*a.x20 - a.x02*a.x11*a.x20 + a.x02*a.x10*a.x21 - a.x00*a.x12*a.x21 - a.x01*a.x10*a.x22 + a.x00*a.x11*a.x22) / d
        
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
    let v = p5.Vector.normalize(axis);
    let s = Math.sin(angle);
    let c = Math.cos(angle);
    let m = 1 - c; 
    return new Fresco.Matrix (
        m * v.X * v.X + c,       m * v.X * v.Y + v.Z * s, m * v.Z * v.X - v.Y * s, 0,
        m * v.X * v.Y - v.Z * s, m * v.Y * v.Y + c,       m * v.Y * v.Z + v.X * s, 0,
        m * v.Z * v.X + v.Y * s, m * v.Y * v.Z - v.X * s, m * v.Z * v.Z + c,       0,
        0,                       0,                       0,                       1
    );
};

/**
 * Returns the Frustrum projection matrix
 * @param {Number} l The X coordinate of the left side of the near projection plane in view space.
 * @param {Number} r The X coordinate of the right side of the near projection plane in view space.
 * @param {Number} b The Y coordinate of the bottom side of the near projection plane in view space.
 * @param {Number} t The Y coordinate of the top side of the near projection plane in view space.
 * @param {Number} n Z distance to the near plane from the origin in view space.
 * @param {Number} f Z distance to the far plane from the origin in view space.
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
 * @param {Number} l The X coordinate of the left side of the near projection plane in view space.
 * @param {Number} r The X coordinate of the right side of the near projection plane in view space.
 * @param {Number} b The Y coordinate of the bottom side of the near projection plane in view space.
 * @param {Number} t The Y coordinate of the top side of the near projection plane in view space.
 * @param {Number} n Z distance to the near plane from the origin in view space.
 * @param {Number} f Z distance to the far plane from the origin in view space.
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
 * @param {Number} near Z distance to the near plane from the origin in view space.
 * @param {Number} far Z distance to the far plane from the origin in view space.
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
    let u = p5.Vector.normalize(up);
    let f = p5.Vector.normalize(center.copy().sub(eye));
    let s = p5.Vector.normalize(f.cross(u));
    u = p5.Vector.normalize(a.cross(f));

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

const NoHit = Fresco.Hit(null, INF);

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
        this.min = m;
        this.max = M;
    }

    /**
     * Computes the size of the box
     * @returns {p5.Vector} Box size along each axis
     */
    size() {
        return this.max.copy().sub(this.max);
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
        return this.min.X <= v.X && this.max.X >= v.X &&
		this.min.Y <= v.Y && this.max.Y >= v.Y &&
		this.min.Z <= v.Z && this.max.Z >= v.Z
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
     * TODO: Come back and improve if used. There is a risk of division by 0 right now...
     * @param {Fresco.Ray} r Ray 
     * @returns {Array<Number>} candidate positions
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

        let t1 = Math.max(Math.max(m.x, m.y), m.z);
        let t2 = Math.min(Math.min(M.x, M.y), M.z);

        return [t1, t2];
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

/**
 * Triangle based mesh
 */
Fresco.TriMesh = class extends Fresco.Shape3D {
    /**
     * @constructor
     * @param {Fresco.Tri3D} tris tirangles 
     */
    constructor(tris) {
        this.tris = tris;
        this.aabb = tris[0].getBoundingBox();
        this.tris.forEach(t => this.aabb = this.aabb.extend(t.getBoundingBox()));
    }

    /**
     * Returnes the Bounding Box of the mesh
     * @returns {Fresco.Box} the axis aligned bounding box
     */
    getBoundingBox() {
        return this.aabb;
    }

    /**
     * Compute a ray intersection with this mesh
     * @param {Fresco.Ray} r 
     * @returns 
     */
    computeRayIntersection(r) {
        let h = NoHit;
        this.tris.forEach(t => {
            let h1 = t.computeRayIntersection(r);
            if (h1.distance < h) {
                h = h1;
            }
        })
        return h;
    }

    // TODO: Implement me some day
    contains(v) {
        return false;
    }

    /**
     * Convert his shape 3D to an array of Fresco.Shapes
     * @returns {Array<Fresco.Shape>}
     */
    toShapes() {
        let shapes = [];
        this.tris.forEach(t => shapes.push(...t.toShapes()));
        return shapes;
    }
}

Fresco.Cube = class extends Fresco.Box {
    getBoundingBox() {
        return new Box(this.min, this.max)
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
        let [t0, t1] = super.computeRayIntersection(r);
        if (t0 < EPS && t1 > EPS) {
            return new Fresco.Hit(this, t1);
        }
        else if (t0 >= EPS && t0 <= t1) {
            return new Fresco.Hit(this, t0);
        }
        return NoHit;
    }

    toShapes() {
        let m = c.min;
        let M = c.Max;
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
        this.shape = shape;
        this.tris = [];
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
                return arr[n / 2];
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
        this.right = l;
        this.right = r;
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
            case this.axis.Node:
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

        this.root = new Node(shapes, 0);
        this.root.split();
    }

    /**
     * Computes the ray intersection with the shapes in this tree
     * @param {Fresco.Ray} r ray
     * @returns {Fresco.Hit} ray hit
     */
    computeRayIntersection(r) {
        let [t0, t1] = this.aabb.computeRayIntersection(r);
        if (t1 < t0 || t1 <= 0) {
            return NoHit;
        }
        else {
            return this.root.computeRayIntersection(r, t0, t1);
        }
    }
}

Fresco.Scene3D = class {
    constructor() {
        this.shapes = [];
        this.tree;
        this.isBuilt = false;
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
        let r = Fresco.Ray(v, p5.Vector.normalize(dist));
        let hit = this.computeRayIntersection(r);
        return hit.distance * hit.distance >= dist.mag();
    }

    /**
     * 
     * @param {p5.Vector} eye Position of the eye/camera
     * @param {p5.Vector} center Center of the projection plane
     * @param {p5.Vector} up Up vector
     * @param {Number} width width of the image
     * @param {Number} height height of the image
     * @param {Number} fovy vertical field of view in Radians
     * @param {Number} near Z distance to the near plane from the origin in view space.
     * @param {Number} far Z distance to the far plane from the origin in view space.
     * @param {Number} step 
     * @returns {Array<Fresco.Shape>} Rendered shapes
     */
    render(eye, center, up, width, height, fovy, near, far, step) {
        let aspectRatio = width / height;
        let cameraTransform = LookAtTransform(eye, center, up);
        cameraTransform = cameraTransform.matmul(PerspectiveProjection(fovy, aspectRatio, near, far));
        return renderWithTransform(cameraTransform, eye, width, height, step);
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
                        buf.push(p.vertices[i]);
                    }
                    let d = subdivisionStep;
                    while (d < l) {
                        buf.push(p.vertices[i].copy().add(edge.copy().mult(d / l)));
                        d += subdivisionStep;
                    }

                    buf.push(p.vertices[i + 1]);
                }
                p.vertices = buf;
            })
        }

        let clipBox = new Fresco.Box(createVector(-1, -1, -1), createVector(1, 1, 1));

        // create occlusion filter
        let filter = (v) => {
            let w = transform.positionMul(v);
            if (!this.isVisible(eye, w)) {
                return w, false;
            }

            if (!clipBox.contains(w)) {
                return w, false;
            }

            return w, true;
        };

        // filter out occluded vertices
        let pathBuf = [];
        paths.forEach(p => {
            let vtxBuf = [];
            p.vertices.forEach(v => {
                let nuVtx, ok = filter(v);
                if (ok) {
                    vtxBuf.push(nuVtx);
                }
                else if (vtxBuf.length > 0) {
                    let nuPath = p.copy();
                    nuPath.vertices = vtxBuf;
                    pathBuf.push(new Fresco.Shape(nuPath));
                }
            });
            if (vtxBuf.length > 0) {
                let nuPath = p.copy();
                nuPath.vertices = vtxBuf;
                pathBuf.push(new Fresco.Shape(nuPath));
            }
        });


        //transform all paths
        let translation = createVector(1, 1, 0);
        let scale = createVector(width / 2, height / 2, 0);
        paths.forEach(p => {
            p.vertices.forEach(v => {
                v = scaleVector(translateVector(v, translation), scale)
            });
        })

        return paths;
    }
}
