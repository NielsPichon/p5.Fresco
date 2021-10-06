/**
 * Constructs a quadtree. This is useful for making collision detection much faster by concentrating on shapes and vertices that are in the same region of space
 */
Fresco.Quadtree = class {
    /**
     * @constructor
     * @param {Number} depth current depth. Max depth is reached if depth == 1 (depth decreases at each new branching) 
     * @param {p5.Vector} start region of space which is described by the branch, as described by its top left corner
     * @param {p5.Vector} size size of the region of space which is described by this branch
     * @param {Number} index Index of the branch. Branches are indexed from 0 to 4, row first starting at the bottom left corner
     */
    constructor(depth, start, size, index=0) {
        this.depth = depth;
        this.branches = [];
        this.leaves = [];
        this.start = start;
        this.size = size;
        this.center = this.start.copy().add(this.size.copy().mult(0.5));
        this.index = index;
    }

    /**
     * Check whether a point is colliding with this branch
     * @param {p5.Vector} vtx point to check the collisions with 
     * @returns {Array<*>} Array of colliding leaf objects
     */
    getColliders(vtx) {
        // check if vertex in this region of space
        if (this.contains(vtx)) {
            // if this is a leaf node,
            // return the list of possible colliding objects
            if (this.depth == 1) {
                return this.leaves;
            }
            else {
                let collisions = [];
                // otherwise, query branches
                for (let i = 0; i < this.branches.length; i++) {
                    collisions = this.branches[i].getColliders(vtx);
                    if (collisions.length > 0) {
                        return collisions;
                    }
                }
                return collisions;
            }
        }
        else {
            return [];
        }
    }

    /**
     * Checks whether a point is contained in this branch
     * @param {p5.Vector} vtx 
     * @returns {Boolean}
     */
    contains(vtx) {
        return vtx.x >= this.start.x && vtx.x < this.start.x + this.size.x && 
            vtx.y >= this.start.y && vtx.y < this.start.y + this.size.y
    }

    /**
     * Registers an object in the appropriate branch
     * @param {p5.Vector} pos position of the object 
     * @param {*} object object to register
     * @returns {Boolean} Returns true if the object was registered in this branch
     */
    register(pos, object) {
        // if the position is inside this branch, register the corresponding object
        if (this.contains(pos)) {
            if (this.depth == 1) {
                this.leaves.push(object);
            }
            else 
            {
                let isContained = false;
                // register in relevant branch
                for (let i = 0; i < this.branches.length; i++) {
                    if (this.branches[i].register(pos, object)) {
                        isContained = true;
                        break;
                    }
                }
                // if no branch contains it, then it is time to create a new branch for it
                if (!isContained) {
                    let nuStart = this.start.copy();
                    let idx = 0;
                    if (vtx.x > nuStart.x) {
                        nuStart.x += this.size.x / 2;
                        idx ++;
                    }
                    if (vtx.y > nuStart.y) {
                        nuStart.y += this.size.y / 2;
                        idx += 2;
                    }

                    this.branches.push(
                        new Fresco.Quadtree(this.depth - 1, nuStart, createVector(this.size.x / 2, this.size.y / 2), idx)
                    );

                    this.branches[this.branches.length - 1].register(pos, object);
                }
            }
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Registers a shape. Contrary to point-like objects, shapes can span multiple branche at once.
     * @param {Fresco.Shape} shape
     * @param {Boolean} approx=true Uses approximate overlap detection
     */
    registerShape(shape, approx=true) {
        // if the branch's center is inside the shape, register
        if (isInside(this.center, shape, approx) || this.contains(shape.position)) {
            if (this.depth == 1) {
                this.leaves.push(shape);
            }
            else 
            {
                // register in relevant branch
                for (let i = 0; i < this.branches.length; i++) {
                    this.branches[i].registerShape(shape);
                }

                // if there are missing branches create them if they also are overlapped by the shape
                if (this.branches.length < 4) {
                    this.getMissingBranches().forEach(b => {
                        let nuStart = this.start.copy();
                        nuStart.x += this.size.x * (b % 2);
                        nuStart.y += this.size.y * Math.floor(b / 2);

                        let nuSize = createVector(this.size.x / 2, this.size.y / 2);

                        if (
                            isInside(createVector(nuStart.x + nuSize.x, nuStart.y + nuSize.y), shape, approx) || 
                            (
                                shape.position.x >= nuStart.x && shape.position.x < nuStart.x + nuSize.x && 
                                shape.position.y >= nuStart.y && shape.position.y < nuStart.y + nuSize.y
                            )
                        ) {
                            this.branches.push(
                                new Fresco.Quadtree(this.depth - 1, nuStart, createVector(this.size.x / 2, this.size.y / 2), b)
                            );
                            this.branches[this.branches.length - 1].registerShape(shape, approx);
                        }
                    })
                }
            }
        }
    }

    /**
     * Returns a list of missing branches
     * @returns {Array<Number>} missing branches indices
     */
    getMissingBranches() {
        let indices = [0, 1, 2, 3];
        this.branches.forEach(b => {
            indices.splice(b.index, 1);
        })
        return indices;
    }

    /**
     * Unregister the object from the branch. Sub-branches left empty will be pruned
     * @param {p5.Vector} pos position of the object to unregister 
     * @param {*} object 
     * @returns {Boolean} Returns true if the object was unregistered from this branch
     */
    unregister(pos, object) {
        // if position is contained in branche, unregister the object
        if (this.contains(pos)) {
            // if depth is 1, remove from leaves, if object is in there
            if (this.depth == 1){
                let idx = this.leaves.indexOf(object);
                if (idx >= 0) {
                    this.leaves.splice(idx, 1);
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                // otherwise, unregister from branches
                for (let i = 0; i < this.branches.length; i++) {
                    if (this.branches[i].unregister(pos, object)) {
                        isContained = true;
                        // if the object was unregistered from a branch and the
                        // branch is now empty, prune it
                        if (this.branches[i].isEmpty()) {
                            this.branches.splice(i, 1);
                        }
                        return true;
                    }
                }
                return false;
            }
        }
        else {
            return false;
        }
    }

    /**
     * Unregisters a shape. Any formerly overlaped region which is left empty will be pruned
     * @param {Fresco.Shape} shape 
     * @returns {Boolean} whether the branch contained the shape in the first place
     */
    unregisterShape(shape) {
        if (this.depth == 1) {
            let idx = this.leaves.indexOf(shape);
            if (idx >= 0) {
                this.leaves.splice(idx, 1);
            }
            return true;
        }
        else {
            let isContained = false;
            for (let i = 0; i < this.branches.length; i++) {
                let subContained = this.branches[i].unregisterShape(shape);
                if (subContained) {
                    isContained = true;
                    if (this.branches[i].isEmpty()) {
                        this.branches.splice(i, 1);
                        i--;
                    }
                }
            }
            return isContained;
        }
    }

    /**
     * Checks whether a branch is empty, which is to say whether is has neither leaves nor sub branches
     * @returns {Boolean}
     */
    isEmpty() {
        return this.branches.length == 0 && this.leaves.length == 0;
    }

    draw() {
        if (this.depth == 1) {
            drawLine(this.start, createVector(this.start.x, this.start.y + this.size.y));
            drawLine(this.start, createVector(this.start.x + this.size.x, this.start.y));
            drawLine(createVector(this.start.x + this.size.x, this.start.y), createVector(this.start.x + this.size.x, this.start.y + this.size.y));
            drawLine(createVector(this.start.x, this.start.y + this.size.y), createVector(this.start.x + this.size.x, this.start.y + this.size.y));
        }
        else {
            this.branches.forEach(b => b.draw());
        }
    }
}