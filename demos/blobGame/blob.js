class RubberShape extends Fresco.Shape {
    constructor(
        vertices,
        stiffness,
        tortionStiffness,
        damping,
        substep,
        cutoff,
        pinIdx = []
    ) {
        super(vertices);

        this.timestep = substep;
        this.k = stiffness;
        this.k_t = tortionStiffness;
        this.damping = damping;
        this.pin = pinIdx;
        this.cutoff = cutoff * cutoff;

        this.isClosedShape = this.isClosed();

        this.pos_buf = [];
        this.vertices.forEach(vtx => {this.pos_buf.push(vtx.copy())});

        let edges_0 = new Array(vertices.length - 1);
        this.lengths_0 = new Array(vertices.length - 1);
        this.angles_0 = new Array(vertices.length - 2);
        for (let i = 0; i < this.vertices.length - 1; i++) {
            let edge = this.pos_buf[i + 1].copy().sub(this.pos_buf[i]);
            this.lengths_0[i] = edge.mag();
            edges_0[i] = edge.div(this.lengths_0[i]);
        }
        for (let i = 0; i < this.vertices.length - 2; i++) {
            this.angles_0[i] = this.vertexAngle(i + 1);
        }
        if (this.isClosedShape) {
            // add angle at first vtx at the end of the array
            let vecA = this.vertices[0].copy().sub(
                this.vertices[this.vertices.length - 2]);
            let vecB = this.vertices[0].copy().sub(this.vertices[1]);
            this.angles_0.push(vecA.angleBetween(vecB));
        }

        this.volume = this.computeVolume(edges_0)
        this.isPolygonal = true;
    }

    vertexAngle(idx) {
        let vecA = this.vertices[idx].copy().sub(this.vertices[idx - 1]);
        let vecB = this.vertices[idx].copy().sub(this.vertices[idx + 1]);
        return vecA.angleBetween(vecB);
    }

    computeForces(idx, lengths, edges, angles, pressure) {
        let forces = createPoint(0, 0);

        //damping
        let v = this.pos_buf[idx].copy().sub(this.vertices[idx]);
       forces.add(v.mult(-this.damping));
        // spring left
        if (idx > 0 || this.isClosedShape) {
            let lookup = idx - 1;
            if (idx == 0) lookup = this.vertices.length - 2;
            let elongation = lengths[lookup] - this.lengths_0[lookup];
           forces.add(edges[lookup].copy().mult(-elongation));
        }
        //spring right
        if (idx < this.vertices.length - 1) {
            let elongation = lengths[idx] - this.lengths_0[idx];
           forces.add(edges[idx].copy().mult(elongation));
        }
        //torsion
        if ((idx > 0 & idx < this.vertices.length - 1)) {
            let dir = this.pos_buf[idx + 1].copy().add(
                this.pos_buf[idx - 1]).mult(0.5).sub(
                    this.pos_buf[idx]).normalize();
           forces.add(
                dir.mult(angles[idx - 1] - this.angles_0[idx - 1]));
        }
        // extra torsion for the closing vertex
        if (idx == 0 && this.isClosedShape) {
            let dir = this.pos_buf[1].copy().add(
                this.pos_buf[this.pos_buf.length - 2]).mult(0.5).sub(
                    this.pos_buf[idx]).normalize();
           forces.add(
                dir.mult(angles.at(-1) - this.angles_0.at(-1)));
        }
        //pressure
        if (idx < this.vertices.length - 1) {
            let dir = edges[idx].copy().rotate(-HALF_PI);
            forces.add(dir.mult(pressure * lengths[idx] / 10));
        }

        return forces
    }

    computeDeviations() {
        let lengths = new Array(this.vertices.length - 1);
        let edges = new Array(this.vertices.length - 1);
        let angles = new Array(this.vertices.length - 2);

        for (let i = 0; i < this.vertices.length - 1; i++) {
            let edge = this.pos_buf[i + 1].copy().sub(this.pos_buf[i]);
            lengths[i] = edge.mag();
            edges[i] = edge.div(lengths[i]);
        }
        for (let i = 0; i < this.vertices.length - 2; i++) {
            angles[i] = this.vertexAngle(i + 1);
        }

        if (this.isClosedShape) {
            // add angle at first vtx at the end of the array
            let vecA = this.vertices[0].copy().sub(
                this.vertices[this.vertices.length - 2]);
            let vecB = this.vertices[0].copy().sub(this.vertices[1]);
            angles.push(vecA.angleBetween(vecB));
        }

        return [lengths, edges, angles]
    }

    computeVolume(edges) {
        if (!this.isClosedShape) return 0;
        // get the lowest point
        let min_y = Math.min(...this.pos_buf.map(vtx => vtx.y));

        // for each edge compute the area below it and either add or remove it
        let volume = 0;
        for (let i = 0; i < edges.length; i++) {
            if (edges[i].x != 0) {
                // signed area below the curve
                volume += edges[i].x * (
                    Math.abs(edges[i].y) * 0.5 + (this.pos_buf[i].y - min_y));
            }
        };

        return Math.abs(volume);
    }

    collide(colliders = []) {
        if (colliders.lenght == 0) return;

        //move each point to the closest surface if inside the collider
        colliders.forEach(collider => {
            collider.freezeTransform();
            for(let i = 0; i < this.pos_buf.length; i++){
                if (isInside(this.pos_buf[i], collider)) {
                    let [proj, a, b, c] = collider.projectOnShape(
                        this.pos_buf[i]);
                    this.pos_buf[i] = proj;
                    this.vertices[i] = proj;
                }
            }
        })
    }

    step(colliders = []) {
        let [lengths, edges, angles] = this.computeDeviations();
        let volume = this.computeVolume(edges);
        let tot_length = lengths.reduce(
            (total, len) => {return total + len}, 0);

        let pressure = (this.volume - volume) / tot_length;

        let end = this.vertices.length;
        if (this.isClosedShape) {
            end--;
        }

        for (let i = 0; i < end; i++) {
            if (this.pin.includes(i)) continue;

            let forces = this.computeForces(
                i, lengths, edges, angles, pressure);

            let x = this.pos_buf[i].copy().mult(2).sub(
                this.vertices[i]).add(
                    forces.copy().mult(this.timestep));
            this.vertices[i] = this.pos_buf[i];
            this.pos_buf[i] = x;
            if (
                distSquared(
                    this.pos_buf[i], this.vertices[i]
                ) < this.cutoff
            ) {
                this.pos_buf[i] = this.vertices[i].copy();
            }
        }

        if (this.isClosedShape) {
            this.vertices[this.vertices.length - 1] = this.vertices[0].copy();
            this.pos_buf[this.vertices.length - 1] = this.pos_buf[0].copy();
        }

        this.collide(colliders);
    }
}

class Blob extends RubberShape {
    constructor(
        radius,
        resolution,
        stiffness,
        tortionStiffness,
        damping,
        substep,
        cutoff,
    ) {
        let vertices = [];
        for (let i = 0; i < resolution; i++) {
            vertices.push(
                createPoint(
                    radius * Math.cos(i * 2 * Math.PI / resolution),
                    radius * Math.sin(i * 2 * Math.PI / resolution)
                )
            );
        }
        vertices.push(vertices[0].copy());

        // fits are locked and always about half the width of the circle appart

        let pinIdx = [
            Math.floor(5/8 * (resolution + 1)),
            Math.ceil(7/8 * (resolution + 1))
        ];

        super(
            vertices,
            stiffness,
            tortionStiffness,
            damping,
            substep,
            cutoff,
            pinIdx
        );
    }
}
