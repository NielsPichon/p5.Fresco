// WARNING: to make everything consistent, the x axis goes from left to right
// and the y axis from bottom to top.
// Also, the center of the coordinate system (0,0) is in the center of the
// canvas.


// Helper function to draw a line from 2 p5.vectors
// Note that everything is shifted so that 0,0 is 
// always the center of the Canvas
function PLine(p1, p2) {
  line(p1.x + width / 2, -p1.y + height / 2,
    p2.x + width / 2, -p2.y + height / 2);
}


// Helper function to draw a point from a p5.vector
// Note that everything is shifted so that 0,0 is 
// always the center of the Canvas
function PPoint(p1) {
  point(p1.x + width / 2, -p1.y + height / 2);
}


// Helper function to add a Vertex to a curve from a p5.vector
// Note that everything is shifted so that 0,0 is 
// always the center of the Canvas
function PCurveVertex(p1) {
  curveVertex(p1.x + width / 2, -p1.y + height / 2);
}


// Helper function to add a Vertex to a curve from a p5.vector
// Note that everything is shifted so that 0,0 is 
// always the center of the Canvas
function PVertex(p1) {
  vertex(p1.x + width / 2, -p1.y + height / 2);
}

// Helper function to draw a bezier curve from some p5.vector
// Note that everything is shifted so that 0,0 is 
// always the center of the Canvas
// p1 and p4 are the anchor points, p2, and p3 the control ones
function PBezier(p1, p2, p3, p4) {
  bezier(
    p1.x + width / 2, -p1.y + height / 2,
    p2.x + width / 2, -p2.y + height / 2,
    p3.x + width / 2, -p3.y + height / 2,
    p4.x + width / 2, -p4.y + height / 2
  );
}

function PText(str, pos) {
  text(str, pos.x + width / 2, -pos.y + height / 2);
}


function PCircle(center, radius) {
  circle(center.x + width / 2, -center.y + height / 2, 2 * radius);
}

// Helper function to draw the normal to a point
// nrm is the normalized normal, pt is the point to which the normal is,
// shape is the shape to which this normal belongs
// and l is the length to draw the normal
function drawNormal(nrm, pt, s, l = 10) {
  let n = s.applyTransform(pt.position().add(
    nrm.copy()));
  n.sub(s.applyTransform(pt.position())).normalize().mult(10).add(
    s.applyTransform(pt.position()));
  return n;
}

// container class describing a Point object. A point object is a p5.Vector with a color,
// a radius, a transform and a potential owner
class Point extends p5.Vector{
  constructor(position) {
    super(position.x, position.y, position.z);
    this.rotation = 0;
    this.color = [255, 255, 255, 255];
    this.radius = 1;
    this.scale = createVector(1, 1);
    this.owner;
  }

  draw() {
    stroke(this.color);
    strokeWeight(this.radius);
    if (owner) {
      PPoint(owner.applyTransform(this.position));
    }
    else {
      PPoint(this.position);
    }
  }

  // Returns a value between 0 and 1 based on the distance to the point
  falloff(vtx, decay_power) {
    let distance = (this.position().sub(vtx)).mag();
    let r = distance / this.radius;
    return pow(r, decay_power);
  }


  // Checks whether all properties are equal. Is so, the other point
  // is considered the same as this one.
  // This ignores ownership so 2 points belonging to 2 different shapes will
  // still be detected as one and only
  equals(pt) {
    return this.position().equals(pt.position()) &&
      this.rotation == pt.rotation &&
      this.radius == pt.radius &&
      this.scale.equals(pt.scale) &&
      this.color[0] == pt.color[0] &&
      this.color[1] == pt.color[1] &&
      this.color[2] == pt.color[2] &&
      this.color[3] == pt.color[3];    
  }


  // returns a copy of the position of the point as a
  // p5.Vector
  position() {
    return createVector(this.x, this.y, this.z);
  }
  

  // set a provided p5.Vector as the new position of this
  // point
  setPosition(nu_pos) {
    this.x = nu_pos.x;
    this.y = nu_pos.y;
    this.z = nu_pos.z;
  }
  

  // returns a deepcopy of this point
  copy() {
    // ugly but avoids issues with cyclic references
    // when using JSON serialization
    let nu_pt = new Point(this.position());
    nu_pt.rotation = this.rotation;
    nu_pt.radius = this.radius;
    nu_pt.scale = this.scale.copy();
    nu_pt.owner = this.owner;
    arrayCopy(this.color, nu_pt.color);
    return nu_pt;
  }
}


// simple utility to create a point from coordinates
function createPoint(x, y, z=0) {
  return new Point(createVector(x, y, z));
}

// Container for all point based shapes
// Note that for easier handling in functions,
// the class has no understanding of closed shapes.
// To make a closed shape, simply add the first point back at the end
// of the vertices list
class Shape {
  constructor(vertices = []) {
    this.vertices = vertices; // Array of Points
    // set this shape as owner of the vertices
    for (let i = 0; i < vertices.length; i++) {
      this.vertices[i].owner = this;
    }
    
    this.isPolygonal = false; //Whether to use lines or splines to connect vertices
    this.position = createVector(0, 0);
    this.rotation = 0;
    this.scale = createVector(1, 1);
    this.color = [255, 255, 255, 255];
    this.fillColor = [255, 255, 255, 255];
    this.noStroke = false;
    this.noFill = true;
    this.strokeWeight = 1;
    this.updateBounds = true; // whether the bounding box should be recomputed
    // This contains the bounding box opposite corners, provided it has been calculated
    this.boundingBox = []; // DO NOT CALL DIRECTLY. Use boundingBox() instead.
    this.updateLengths = true; // whether the edge length should be recomputed
    this.edgeLengths = [];
  }


  // draws the shape
  draw(usePointColor = false) {
    if (this.noStroke && !usePointColor) {
      noStroke();
    } else {
      stroke(this.color);
      strokeWeight(this.strokeWeight);
    }
    
    if (this.noFill) {
      noFill();
    }
    else {
      fill(this.fillColor);
    }

    beginShape();
    if (this.isPolygonal) {
      let vtx;
      for (let i = 0; i < this.vertices.length; i++) {
        vtx = this.applyTransform(this.vertices[i]);
        if (usePointColor) {
          stroke(this.vertices[i].color);
        }
        PVertex(vtx);
      }
    } else {
      // we add the first and last vertex twice to make sure all points
      // are part of the curve. Note that if the shape is closed, we 
      // use the last but one and second points instead
      let vtx = this.applyTransform(this.vertices[0]);
      if (this.isClosed()) {
        vtx = this.applyTransform(
          this.vertices[this.vertices.length - 2]);
        if (usePointColor) {
          stroke(this.vertices[this.vertices.length - 2].color);
        }
      }
      else if (usePointColor) {
        stroke(this.vertices[0].color);
      }

      PCurveVertex(vtx);
      for (let i = 0; i < this.vertices.length; i++) {
        vtx = this.applyTransform(this.vertices[i]);
        if (usePointColor) {
          stroke(this.vertices[i].color);
        }
        PCurveVertex(vtx);
      }
      vtx = this.applyTransform(
        this.vertices[this.vertices.length - 1]);

      if (this.isClosed()) {
        vtx = this.applyTransform(
          this.vertices[1]);
        if (usePointColor) {
          stroke(this.vertices[1].color);
        }
      }
      else {
        if (usePointColor) {
         stroke(this.vertices[this.vertices.length - 1].color);
        }
      }
      PCurveVertex(vtx);
    }
    endShape();
  }


  // draws only the vertices of the shape
  drawPoints() {
    stroke(this.color);
    strokeWeight(this.strokeWeight + 2);

    for (let i = 0; i < this.vertices.length; i++) {
      stroke(this.vertices[i].color);
      PPoint(this.applyTransform(this.vertices[i]));
    }
  }


  // draw scattered points along contour.
  // diffusivity defines how far from the original
  // line points may be moved
  drawScattered(num_points = 1000, diffusivity = 5, minWeight = .5, maxWeight = 2) {
    stroke(this.color);
    let p = scatter(this, num_points);

    let theta = 0;
    let r = 0;
    for (let i = 0; i < p.length; i++) {
      r = random(0, diffusivity);
      theta = random(0, 2 * Math.PI);
      p[i].x += r * Math.cos(theta);
      p[i].y += r * Math.sin(theta);

      strokeWeight(random(minWeight, maxWeight));
      PPoint(p[i]);
    }
  }


  // draws multiple lines on top of one another
  // with a bit of noise. 
  drawNoisy(num_lines=5, diffusivity = 5, line_opacity = 128, close = true) {
    let tmp_s = this.copy();
    tmp_s.color[3] = line_opacity;
    let j;
    let r;
    let theta;
    for (let i = 0; i < num_lines; i++) {
      for (j = 0; j < tmp_s.vertices.length; j++) {
        r = random(0, diffusivity);
        theta = random(0, 2 * Math.PI);
        tmp_s.vertices[j].x = this.vertices[j].x + r * Math.cos(theta);
        tmp_s.vertices[j].y = this.vertices[j].y + r * Math.sin(theta);
      }
      if (this.isClosed() && close) {
        tmp_s.vertices[tmp_s.vertices.length - 1] = tmp_s.vertices[0];
      }

      tmp_s.draw();
    }
  }

  // defines the scale of the shape. If only x is specified,
  // a uniform scale witll be used
  setScale(x, y = null) {
    if (y) {
      this.scale = createVector(x, y);
    }
    else {
      this.scale = createVector(x, x);
    }
  }

  numberVertices() {
    let nrm = this.normals();
    for (let i = 0; i < this.vertices.length - 1; i++) {
      PText(i, this.applyTransform(
        this.vertices[i].position().add(
          nrm[i].copy().mult(10))));
    }

    if(! this.vertices[0].equals(
      this.vertices[this.vertices.length - 1])) {
      PText(i, this.applyTransform(
        this.vertices[this.vertices.length - 1].position().add(
        nrm[this.vertices.length - 1].copy().mult(20))));
    }
  }


  // returns the world position of points
  applyTransform(vtx) {
    let nu_vtx = vtx.copy();
    nu_vtx.x = cos(this.rotation) * vtx.x + sin(this.rotation) * vtx.y;
    nu_vtx.y = -sin(this.rotation) * vtx.x + cos(this.rotation) * vtx.y;
    nu_vtx.mult(this.scale);
    nu_vtx.add(this.position);
    
    return nu_vtx;
  }


  // Freeze the transform of the shape into its vertices
  freezeTransform() {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = 
        this.applyTransform(this.vertices[i]);
      this.vertices[i].rotation += this.rotation;
    }
    this.rotation = 0;
    this.position = createVector(0, 0);
    this.scale = createVector(0, 0);
    this.updateLengths = true;
    this.updateBounds = true;
  }


  // Returns the bounding box (defined as the bottom
  // left and top right corner points position in world coordinates). It will recompute it only if needed.
  getBoundingBox() {
    if (this.updateBounds) {
      let xs = [];
      let ys = [];
      for (let i = 0; i < this.vertices.length; i++) {
        append(xs, this.vertices[i].x);
        append(ys, this.vertices[i].y);
      }
      this.boundingBox = [createVector(min(xs), min(ys)), createVector(max(xs), max(ys))]
    }

    let pt1 = 
      this.boundingBox[0].copy().mult(
        this.scale).add(this.position);
    let pt2 = this.boundingBox[1].copy().mult(
      this.scale).add(this.position);
    return [pt1, pt2];
  }


  // returns true if the last point is the same as 
  // the first point, which means the shape is closed
  isClosed() {
    return this.vertices[0].equals(
      this.vertices[this.vertices.length - 1]);
  }

  
  // returns the control point for an edge starting 
  controlPoints(idx) {
    if (this.isPolygonal) {
      let p0 = this.vertices[idx];
      let p1;
      if (idx  + 1 > this.vertices.length - 1) {
        throw "Cannot provide control points for an edge starting from last vertex of a polygonal shape";
      }
      else {
        p1 = this.vertices[idx + 1];
      }
      return [p0, p1, createVector(0, 0), createVector(0, 0)];
    }
    else {
      let p1 = this.vertices[idx];
      if (idx + 1 > this.vertices.length - 1) {
        throw "Cannot provide spline control points starting from last vertex";
      }
      let p2 = this.vertices[idx + 1];
      let p0;
      // if first vertex and shape is closed, return last but one vertex
      // else return starting point
      if (idx - 1 < 0) {
        if (this.isClosed()) {
          p0 = this.vertices[this.vertices.length - 2];
        }
        else {
          p0 = this.vertices[0];
        }
      }
      else {
        p0 = this.vertices[idx - 1];
      }
      let p3;
      if (idx + 2 > this.vertices.length - 1) {
        if (this.isClosed()) {
          p3 = this.vertices[1];
        }
        else {
          p3 = this.vertices[this.vertices.length - 1];
        }
      }
      else {
        p3 = this.vertices[idx + 2];
      }
      return [p0, p1, p2, p3];
    }
  }


  // Returns the length of an edge. If the index passed is the last one,
  // it will return the distance of the hypothetic edge to the first vertex,
  // no matter if the shape is closed or not.
  // Note that the length is in world units (meaning  all transforms have been applied)
  edgeLength(start_idx, resolution = 100) {
    if (this.isPolygonal) {
      let [p0, p1, p2, p3] = this.controlPoints(start_idx);
      return p1.copy().sub(p0).mag();
    } 
    else {
      let [p0, p1, p2, p3] = this.controlPoints(start_idx);
      let [a, b, c, d] = catmullRom(this.applyTransform(p0),
                                    this.applyTransform(p1),
                                    this.applyTransform(p2),
                                    this.applyTransform(p3));
      const dt = 1 / resolution;
      let t = 0;
      let l = 0;

      // We discretize the integration by taking resolution points along
      // the spline and drawing lines between them
      let a2 = d;
      let a1;
      for (let i = 0; i < resolution; i++) {
        a1 = a2.copy();
        // compute next point
        t += dt;
        a2 = a.copy().mult(t * t * t).add(
          b.copy().mult(t * t)).add(
          c.copy().mult(t)).add(d);
        l += (a1.copy().sub(a2)).mag();
      }
      return l;
    }
  }


  // computes the total length of the shape contour
  // in world scale
  contourLength() {
    if (this.updateLengths) {
      this.edgeLengths = [];
      for (let i = 0; i < this.vertices.length - 1; i++) {
        append(this.edgeLengths, this.edgeLength(i));
      }
      this.updateLengths = false;
    }
    let l = 0;
    for (let i = 0; i < this.vertices.length - 1; i++) {
      l += this.edgeLengths[i];
    }

    return l;
  }


  // returns the position of a point at specified interpolant on a given edge
  // in world coordinates if world == true or in local coordnates otherwise
  edgeInterpolation(interp, edge_idx, resolution = 100,
                     approx = false, world = true) {
    if (edge_idx > this.vertices.length - 1) {
      throw "Cannot interpolate edge starting at last point (or more) of shape";
    }
    
    if (this.isPolygonal) {
      // simple linear interpolation
      let l = edge_idx + 1;
      if (l > this.vertices.length - 1) {
        if (this.isClosed()) {
          l = 0;
        }
        else {
          throw "Cannot interpolate from last vertex in open shape";
        }
      }
      
      let pt = this.vertices[edge_idx].position().mult(1 - interp).add(
        this.vertices[l].position().mult(interp));
      if (world) {
        return this.applyTransform(pt);
      }
      else {
        return pt;
      }
    } 
    else {
      //for a spline there is no exact expression. Instead we integrate the
      // edge length until we reach the desired value
      let [p0, p1, p2, p3] = this.controlPoints(edge_idx);
      
      // For non uniform scales, deducing the transformed spline edge length
      // from the local one is non trivial. We compute everything in world
      // lengths and transform the point back to local coordinates if required
      p0 = this.applyTransform(p0);
      p1 = this.applyTransform(p1);
      p2 = this.applyTransform(p2);
      p3 = this.applyTransform(p3);

      let [a, b, c, d] = catmullRom(p0, p1, p2, p3);
      
      if (!approx) {
        let dt = 1 / resolution;
        let l = 0;

        // We discretize the integration by taking resolution points along
        // the spline and drawing lines between them
        let a2 = d;
        let a1;
        for (let  t = 0; t < 1; t += dt) {
          a1 = a2.copy();
          // compute next point
          a2 = a.copy().mult(t * t * t).add(
            b.copy().mult(t * t)).add(
            c.copy().mult(t)).add(d);
          l += (a1.copy().sub(a2)).mag();
          if (l / this.edgeLengths[edge_idx] >= interp) {
            break;
          }
        }
        
        if (world) {        
          return a2;
        }
        else {
          return this.toLocalCoordinates(a2);
        }
      }
      else {
        let pt = a.copy().mult(interp * interp * interp).add(
            b.copy().mult(interp * interp)).add(
            c.copy().mult(interp)).add(d);
        if (world) {
          return pt;
        }
        else {
          return this.toLocalCoordinates(pt);
        }
      }
    }
  }


  // convertes a point coordinates (in vector form) 
  // to the local coordinates system
  toLocalCoordinates(pt) {
    let nu_pt = pt.copy();
    // un-rotate
    nu_pt.x = pt.x * cos(-this.rotation) + pt.y * 
      sin(-this.rotation);
    nu_pt.y = pt.y * cos(-this.rotation) - pt.x * 
      sin(-this.rotation);
    
    // unscale
    nu_pt.x /= this.scale.x;
    nu_pt.y /= this.scale.y;
    
    //translate
    nu_pt = nu_pt.copy().sub(this.position);
    
    return nu_pt;
  }


  // set the center of rotation as the center of the boundingBox
  setOriginToGeometricCenter() {
    // make sure the bounding box has been computed
    this.getBoundingBox()
    // retrieve the center of the bounding box in local referential
    let center = (this.boundingBox[0] + this.boundingBox[1]) * 0.5;

    // offset all points to center the AABB to 0,0 in local referential
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].sub(center);
    }

    this.boundingBox = createVector(0, 0);
    this.position.add(center);
  }


  // Retrieve the normal at a given point
  // For the non-polygonal case, each edge will be split in `resolution` segments
  // and each point checked against the supplied point 
  normalAtPoint(pt, epsilon = 1e-8, resolution = 128) {
    if (this.isPolygonal) {
      let c;
      let vec;
      let l;
      let edge;
      // first retrieve which edge the point belongs to 
      for (let i = 0; i < this.vertices.length - 1; i++) {
        // compute the cross product of the vector from the first vertex
        // to the point with the edges vector.
        vec = pt.copy().sub(this.vertices[i]);
        edge = this.vertices[i + 1].position().sub(this.vertices[i]);
        c = p5.Vector.cross(vec, edge);
        // if c is the zero vector, this means the 2 vectors are 
        // colinear and thus the point may belong to the edge
        // Note: we compare the magnitude to some espilon to avoid 
        // false negatives, e.g. the point near misses
        // because of numerical issues.
        if (c.magSq() < epsilon) {
          l = vec.dot(edge);
          // if 0 < AC.AB < AB.AB wher A and B are the edges ends and C the point to test,
          // this means the point belongs to the vector
          if (l >= 0 && l <= edge.magSq()) {
            edge = edge.normalize();
            // the normal is the orthogonal vector to the edge, which orientation depends
            // on whether the shape is described clockwise or anticlockwise
            if (this.isClockwise()) {
              return createVector(-edge.y, edge.x);
            }
            else {
              return createVector(edge.y, -edge.x);
            }
          }
        }
      }
      console.log("[in getNormalAtPoint] Some error may have " +
        "occured as the specified point was not found to belong to the shape");
    }
    else {
      let a, b, c, d;
      let j;
      let t0;
      let t00;
      let t01;
      let t1;
      let p1, p2;
      const incr = 1 / (resolution - 1);
      let vertex;
      for (let i = 0; i < this.vertices.length - 1; i++) {
        // retrieve the edge spline equation coefficients
        [a, b, c, d] = catmullRom(...this.controlPoints(i));

        t0 = 0;
        t1 = 1;
        // we proced by simple dichotomy. We stop early if one the points is already within the tolerance threshold
        for (j = 1; Math.pow(2, j) <= resolution; j++) {
          // compute the position of the first and 2nd thirds of the sub spline
          t00 = t0 + (t1 - t0) / 3;
          t01 = t0 + 2 * (t1 - t0) / 3;
          p1 = a.copy().mult(t00 * t00 * t00).add(b.copy().mult(
            t00 * t00)).add(c.copy().mult(t00)).add(d);
          p2 = a.copy().mult(t01 * t01 * t01).add(b.copy().mult(
            t01 * t01)).add(c.copy().mult(t01)).add(d);

          // move the bounds such that we restrict the spline to the closest half
          if(distSq(pt, p1) <= distSq(pt, p2)) {
            t1 = (t1 + t0) * 0.5;
            // if the closest half is already at less than epsilon, return
            if (distSq(pt, p1) <= epsilon) {
              let tangent = a.mult(3 * t00 * t00).add(
                b.mult(2 * t00)).add(c).normalize();
              // return the orthogonal to the tangent, with the orientation chosen based
              // on whether the shape is discribed in a clockwise fashion
              if (this.isClockwise()) {
                return createVector(-tangent.y, tangent.x);
              }
              else {
                return createVector(tangent.y, -tangent.x);
              }
            }            
          }
          else {
            t0 = (t1 + t0) * 0.5;
            // if the closest half is already at less than epsilon, return
            if (distSq(pt, p2) <= epsilon) {
              let tangent = a.mult(3 * t01 * t01).add(
                b.mult(2 * t01)).add(c).normalize();
              // return the orthogonal to the tangent, with the orientation chosen based
              // on whether the shape is discribed in a clockwise fashion
              if (this.isClockwise()) {
                return createVector(-tangent.y, tangent.x);
              }
              else {
                return createVector(tangent.y, -tangent.x);
              }
            }     
          }
        }
      }
      console.log("[in getNormalAtPoint] Some error may have " +
        "occured as the specified point was not found to belong to the shape");
    }
  }

  // returns normals to points in local coordinates.
  // If the shape is open, the first and last points will use the only
  // connected edge to compute the normal
  normals() {
    let nrm = [];
    let l = this.vertices.length;
    let tangent;
    let p0;
    let p1;
    let p2;
    let p3;
    let nu_nrm;
    let a;
    let b; 
    let c;
    let d;
    for (let i = 0; i < l - 1; i++) {
      p0 = this.vertices[max([i - 1, 0])];
      p1 = this.vertices[i + 1];
      
      // if closed shape, last but one point is the one precedeing the
      // first point
      if(i == 0 && this.isClosed()) {
        p0 = this.vertices[l - 2];
      }

      if (this.isPolygonal) {
        // direction from previous point to next is direction of tangent
        // at point(or more precisely the average of the tangent from 
        // the left edge and the right edge)
        tangent = p1.copy().sub(p0);
      }
      else {
        p2 = p1.copy();
        p1 = this.vertices[i];
        p3 = this.vertices[min([i + 2, l - 1])];
        // If the mesh is closed, the last and first vertex 
        // are the same.
        // Hence we retrieve the  second point;
        if (i + 2 >= l && this.isClosed()) {
          p3 = this.vertices[1];
        }

        // retrieve curve starting from point
        [a, b, c, d] = catmullRom(p0, p1, p2, p3);

        // we assume that the derivative is continuous at the point,
        // that is the tangent is the derivative for t = 0;
        tangent = c;
      }
      // orthogonal vector
      nu_nrm = createVector(0,0);
      nu_nrm.x = tangent.y;
      nu_nrm.y = -tangent.x;

      // normalize it
      append(nrm, nu_nrm.normalize());
    }

    if (this.isClosed()) {
      append(nrm, nrm[0].copy());
    }
    else {
      p0 = this.vertices[l - 2];
      p1 = this.vertices[l - 1];

      if (this.isPolygon) {
        // direction from previous point to next
        tangent = p1.copy().sub(p0);
      }
      else {
        p0 = this.vertices[l - 3];
        p1 = this.vertices[l - 2];
        p2 = this.vertices[l - 1];
        p3 = this.vertices[l - 1];

        // retrieve curve ending at point
        [a, b, c, d] = catmullRom(p0, p1, p2, p3);

        // we assume that the derivative is continuous at the point
        // that is the tangent is the derivative for t = 1;
        tangent = a.mult(3).add(b.mult(2)).add(c);            
      }

      // orthogonal vector to tangent is the normal
      let nu_nrm = createVector(0, 0);
      nu_nrm.x = tangent.y;
      nu_nrm.y = -tangent.x;

      // normalize it
      append(nrm, nu_nrm.normalize());
    }
    
    // Shapes may be numbered clockwise or anticlockwise.
    // if the shape is clockwise we reverse the normals
    if (this.isClockwise()) {
      for (let i = 0; i < nrm.length; i++) {
        nrm[i].mult(-1);
      }
    }
    return nrm;
  }
  

  // returns true if the the shape is clockwise
  isClockwise() {
    this.getBoundingBox();
    let center = this.boundingBox[0].copy().add(this.boundingBox[1]).mult(0.5);
    let winding_nb = windingNumber(center, this.vertices)
    // wounding_nb is positive when the shae is counter clockwise
    return winding_nb < 0;
  }


  // return a deep copy of the shape
  copy() {
    // ugly but avoids cyclic references with JSON deserialization
    let vertexCopy = [];
    for (let i = 0; i < this.vertices.length; i++) {
      append(vertexCopy, this.vertices[i].copy());
    }
    let nu_shape = new Shape(vertexCopy);
    nu_shape.isPolygonal = this.isPolygonal;
    nu_shape.position = this.position.copy();
    nu_shape.rotation = this.rotation;
    nu_shape.scale = this.scale.copy();
    arrayCopy(this.color, nu_shape.color);
    arrayCopy(this.fillColor, nu_shape.fillColor);
    nu_shape.noStroke = this.noStroke;
    nu_shape.noFill = this.noFill;
    nu_shape.strokeWeight = this.strokeWeight;

    return nu_shape;
  }
}


class Geometry {
  constructor() {
    this.scale = createVector(1, 1);
    this.rotation = 0;
    this.position = createVector(0, 0);
    this.objects = [];
    this.objectsRotation = []; //stores the initial rotation of the objects
    this.objectsScale = []; //stores the initial scale of the objects
    this.objectsPosition = []; //stores the initial position of the objects
  }

  // draw all objects
  draw() {
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].draw();
    }
  }


  setPosition(position) {
    this.position = position;
    this.setobjectsTransform();
  }

  setRotation(rotation) {
    this.rotation = rotation;
    this.setobjectsTransform();
  }

  setScale(scale) {
    this.scale = scale;
    this.setobjectsTransform();
  }

  // applies this geometry instance transform to its objects
  setobjectsTransform() {
    for (let i = 0; i < this.objects.length; i++) {
      // set rotation
      this.objects[i].rotation = this.objectsRotation[i] + this.rotation;
      // set scale
      this.objects[i].scale = this.objectsScale[i].copy().mult(this.scale);
      // set position using this scale, rotation and position
      this.objects[i].position =
        this.objectsPosition[i].copy().mult(this.scale); //scale
      this.objects[i].position.rotate(this.rotation); // rotate
      this.objects[i].position.add(this.position); // offset
    }
  }

  // attaches a new object to this geometry.
  // This will also automatically compute the
  // transform of the new object relative to this
  // Geometry and store it.
  attach(object) {
    this.objects.push(object);
    let relativeScale = object.scale.copy();
    relativeScale.x /= this.scale.x;
    relativeScale.y /= this.scale.y;
    this.objectsScale.push(relativeScale);
    this.objectsRotation.push(object.rotation - this.rotation);
    // apply this geometry inverse transform to the object position
    // to retrieve its relative position 
    let relativePosition = object.position.copy();
    relativePosition.rotate(-this.rotation);
    relativePosition.x /= this.scale.x;
    relativePosition.y /= this.scale.y;
    this.objectsPosition.push(relativePosition);
  }

  // simply remove all references to the object and return it
  detach(objectIdx) {
    // remove the original transform references
    this.objectsPosition.splice(objectIdx, 1);
    this.objectsScale.splice(objectIdx, 1);
    this.objectsRotation.splice(objectIdx, 1);

    // remove the object from this geometry and return it
    return this.objects.splice(objectIdx, 1);
  }
}


function deepcopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}


// Polygonal sphere
class sCircle extends Shape {
  constructor(resolution = 24, radius = 50) {
    super();
    this.radius = radius;
    this.resetResolution(resolution);
  }

  // allows to change the sphere resolution on the fly.
  // WARNING: this will reset point positions
  resetResolution(resolution) {
    const angleIncr = 2 * PI / resolution;
    let angle = 0;
    for (let i = 0; i < resolution; i++) {
      append(this.vertices,
        createPoint(this.radius * cos(angle), this.radius * sin(angle)));
      angle += angleIncr;
    }
    append(this.vertices, new Point(
      createVector(this.radius, 0)));
    this.updateLengths = true;
    this.updateBounds = true;
  }
}


class sArc extends Shape {
  constructor(angle = Math.PI, radius = 50, resolution = 12, close = false) {
    super([]);
    this.radius = radius;
    const angleIncr = angle / (resolution - 1);
    let theta = - angle * 0.5 - PI / 2; //center the arc on the bottom vertical
    for (let i = 0; i < resolution; i++) {
      append(this.vertices,
        createPoint(radius * cos(theta), radius * sin(theta)));
      theta += angleIncr;
    }
    if (close) {
      this.vertices.push(this.vertices[0]);
    }
  }
}


// Rectangle
class sRect extends Shape {
  constructor(w = 100, h = 50) {
    let vertices = [];
    append(vertices, new Point(createVector(-w / 2, -h / 2)));
    append(vertices, new Point(createVector(-w / 2, h / 2)));
    append(vertices, new Point(createVector(w / 2, h / 2)));
    append(vertices, new Point(createVector(w / 2, -h / 2)));
    append(vertices, new Point(createVector(-w / 2, -h / 2)));

    super(vertices);

    this.isPolygonal = true;
  }
}


// Square
class sSquare extends sRect {
  constructor(size = 100) {
    super(size, size);
  }
}


// Regular polygon
class sPolygon extends sCircle {
  constructor(resolution = 24, radius = 50) {
    super(resolution, radius);
    this.isPolygonal = true;
  }
}


// computes the winding number of a curve around a point
// pt is a vector, vertices is a list of Points 
function windingNumber(pt, vertices) {
  let winding_nb = 0;
  let a = (vertices[0].position().sub(pt)).normalize();
  let b = a.copy();
  for (let i = 0; i < vertices.length - 1; i++) {
    a = b.copy();
    b = (vertices[i + 1].position().sub(pt)).normalize();
    
    winding_nb += a.angleBetween(b);
  }

  winding_nb /= 2 * PI;

  return winding_nb;
}


// Returns the catmull rom centripetal spline eq coefficients given 4 points position
// This is usefull as the vertexCurve in p5 uses Catmull-Rom
function catmullRom(p0, p1, p2, p3) {
  a = p1.copy().mult(3).sub(p0).add(
    p2.copy().mult(-3)).add(p3).mult(0.5); //0.5 * (-p0 + 3 * p1 - 3 * p2 + p3)
  b = p0.copy().mult(2).add(p1.copy().mult(-5)).add(
    p2.copy().mult(4)).sub(p3).mult(0.5); // alpha * (2 * p0 - 5 * p1 + 4 * p2 - p3)
  c = p2.copy().sub(p0).mult(0.5); // alpha * (-p0 + p2)
  d = p1.copy().mult(0.5 * 2); // alpha * (2 *p1)
  return [a, b, c, d];
}


// returns the roots of a 2nd degree polynomial if they are real
function parabolicRoots(a, b, c) {
  let roots = [];
  if (a == 0) {
    if (b == 0) {
      throw "Polynomial is of degree 0. Cannot solve for roots";
    }
    append(roots, - c / b);
  }
  else {
    delta = b * b - 4 * a * c;
    if (delta < 0) {
      return [];
    }
    else if (delta == 0) {
      append(roots, - b / 2 / a);
    }
    else {
      append(roots, (- b + sqrt(delta)) / 2 / a);
      append(roots, (- b - sqrt(delta)) / 2 / a);
    }
  }
  
  return roots;
}


// returns the roots of a 3rd degree polynomial if they are real
function cubicRoots(a, b, c, d) {
  let roots = [];

  // if a is 0, this means the polynomial is actually of 2nd degree
  if (a == 0) {
    return parabolicRoots(b, c, d);
  }

  // from ax3 + bx2 + cx +d, reduce to the form y^3 + ay + b
  // for which the roots can be derived analytically
  // see http://web.cs.iastate.edu/~cs577/handouts/polyroots.pdf
  let p = b / a;
  let q = c / a;
  let r = d / a;
  let a2 = (3 * q - p * p) / 3;
  let b2 = (2 * p * p * p - 9 * p * q + 27 * r) / 27;

  let delta = b2 * b2 / 4 + a2 * a2 * a2 / 27;


  if (delta >= 0) {
    let A = -b2 / 2 + sqrt(delta);
    let B = -b2 / 2 - sqrt(delta);
    
    if (delta == 0) {
      if (b2 < 0) {
        A = - pow(-A, 1 / 3);
      }
      else {
        A = pow(A, 1 / 3);
      }
      append(roots, 2 * A);
      append(roots, -A);
    }
    else {
      if (A < 0) {
        A = - pow(-A, 1 / 3);
      }
      else {
        A = pow(A, 1 / 3);
      }
      if (B < 0) {
        B = - pow(-B, 1 / 3);
      }
      else {
        B = pow(B, 1 / 3);
      }
      append(roots, A + B);
    }
  }
  else {  
      let phi = acos(sqrt(b2 * b2 / 4 / (-a2 * a2 * a2 / 27)));
      if (b2 > 0) phi += PI;
      for (let k = 0; k < 3; k++) {
        append(roots, 2 * sqrt(-a2 / 3) * cos((phi + 2 * k * PI) / 3));
      }
  }
  
  // convert back the roots of y^3 + ay + b to the form in x
  for (let i = 0; i < roots.length; i++) {
    roots[i] -= p / 3;
  }

  return roots;
}


// computes the intersection of 2 lines of the form 
// p = origin + direction * t. 
// Returns false if
// the 2 lines are parallel, 
// else returns the value of t for which the
// 2 lines intersect
// Note: the directions should be normalized 
function lineIntersection(pt1, dir1, pt2, dir2) {
  if (dir1.x == 0) {
    if (dir2.x == 0) {
      return [false, false];
    }
    else {
      const t2 = (pt1.x - pt2.x) / dir2.x;
      const t1 = ((pt2.y - pt1.y) + dir2.y * t2) / dir1.y;
      return [t1, t2];
    }
  }
  else if (dir2.y == dir1.y * dir2.x / dir1.x) {
    return [false, false];
  }
  else {
    const v1 = pt1.copy().sub(pt2);
    const v3 = createVector(-dir1.y, dir1.x);
    // let t1 = (dir2.cross(v1)).mag() / dir2.dot(v3);
    const t2 = v1.dot(v3) / dir2.dot(v3);
    const t1 = ((pt2.x - pt1.x) + dir2.x * t2) / dir1.x;
    return [t1, t2]; 
  }
}


// computes the intersection of 2 segments defined by there extremities
// if the 2 segments don't intersect return false, else return the intersection
// coordinates
function segmentIntersection(p0, p1, p2, p3) {
  let dir1 = p1.copy().sub(p0);
  let dir2 = p3.copy().sub(p2);
  
  let [t1, t2] = lineIntersection(p0, dir1, p2, dir2);
  
  // if lines intersect, check that intersection is within the
  // segment extremities
  if(t1) {
    if (t1 > 1 || t1 < 0) {
      return false;
    }
    if (t2 > 1 || t2 < 0) {
      return false;
    }

    return p0.copy().add(dir1.copy().mult(t1));
  }
  else {
    return false;
  }
}


// Check if a ray intersects a segment.
// Inputs are 4 vectors representing the ray origin,
// its direction and the 2 extremities of the segment
// Returns [false, false] if the ray does not intersect, otherwise returs
// [intersectionPoint, edge interpolent]
function raySegmentIntersection(rayOrigin, rayDir, p0, p1) {
  let dir2 = p1.position().sub(p0);

  let [t1, t2] = lineIntersection(rayOrigin, rayDir, p0, dir2);
  // if lines intersect, check that intersection is within the
  // segment extremities and on the positive direction of the ray
  if(t1) {
    if (t1 < 0) {
      return [false, false];
    }
    if (t2 > 1 || t2 < 0) {
      return [false, false];
    }
    return [rayOrigin.copy().add(rayDir.copy().mult(t1)), t2];
  }
  else {
    return [false, false];
  }
}


// computes the intersection of 2 lines of the form p = origin + direction * t. Returns false if
// the 2 lines are parallel, else returns the value of t for which the 2 lines intersect
// Note: the directions should be normalized 
function lineSplineIntersection(pt, dir, p0, p1, p2, p3) {
  // retrieve the line equation as x + by + c = 0
  let a1 = 1;
  let b1;
  let c1;
  if (dir.y != 0) { 
    b1 = -dir.x / dir.y;
    c1 = -pt.x - b1 * pt.y;
  }
  else
  {
    a1 = 0;
    b1 = 1;
    c1 = -pt.y;
  }

  // retrieve the spline equation at^3 + bt^2 + ct + d
  let [a2, b2, c2, d2] = catmullRom(p0, p1, p2, p3);

  // Essentially we solve for a 3rd order polynomial roots. The polynomial
  // is obtained from substituting x and y in the line equation by their values
  // computed from t in the spline equation
  let A = a1 * a2.x + b1 * a2.y;
  let B = a1 * b2.x + b1 * b2.y;
  let C = a1 * c2.x + b1 * c2.y;
  let D = a1 * d2.x + b1 * d2.y + c1;
  
  let intersections = cubicRoots(A, B, C, D);
  
  
  // we derive the line interpolent t_line such that 
  // pt + t_line * dir = intersection
  let t = []
  
  let ti;
  let interp;
  let X;
  let Y;
  for (let i = 0; i < intersections.length; i++) {
    ti = intersections[i];
    if (dir.x != 0) {
      X = a2.x * ti * ti * ti + b2.x * ti * ti + c2.x * ti + d2.x;
      interp = (X - pt.x) / dir.x;
    }
    else {
      Y = a2.y * ti * ti * ti + b2.y * ti * ti + c2.y * ti + d2.y;
      interp = (Y - pt.y) / dir.y;
    }
    append(t, [ti, interp]);
  }
  
  return t;
}


// Check if a ray intersects a spline
// Inputs are 6 vectors representing the ray origin,
// its direction and the 4 control points
// Returns [false, false, false] if the ray does not intersect, otherwise returns
// [intersectionPoint, edge interpolent1, edge interpolent2]
function raySplineIntersection(rayOri, rayDir, p0, p1, p2, p3) {
  let t = lineSplineIntersection(rayOri, rayDir, p0, p1, p2, p3);
  
  let t2 = [];
  for (let i = 0; i < t.length; i++) {
    if (t[i][0] >= 0 && t[i][0] <=1 && t[i][1] >= 0) {
      append(t2, [true, t[i][0], t[i][1]]);
    }
    else {
      append(t2, [false, false, false]);
    }
  }

  return t2;
}


// uses the even-odd rule to check whether a point is inside a shape.
// if approx is set to true, the polygonal mesh will be used even if 
// the mesh normally uses splines.
function isInside(vtx, shape, approx = true) {
  let isIn = false;
  let l = shape.vertices.length;
  // cast a horizontal ray and count the number of
  // intersections with a contour. This assumes the contour does not 
  // self intersect
  let inter;
  let t;
  let p0;
  let p1;
  let p2;
  let p3;
  let intersections;
  let k;
  let xVec = createVector(0, 1);
  for (let i = 0; i < l - 1; i++) {
    // for a polygonal mesh a ray hits a contour line if the 2 points
    // are on opposite sides of the point in x.
    if (shape.isPolygonal || approx) {
      [inter, t] = raySegmentIntersection(
        vtx, xVec, shape.applyTransform(
        shape.vertices[i]), shape.applyTransform(
        shape.vertices[i + 1]));
      if (inter) {
        isIn = !isIn;
        // If we cut at the a vertex, skip the next edge
        // to avoid counting the intersection twice
        if (t == 1) {
          i++;
        }
        // if the shape is closed and we intersect at the 
        // first vertex,
        // don't test the last edge to avoid counting 
        // twice the intersection at the closing point
        if (t == 0 && i == 0 && shape.isClosed()) {
          l--;
        }
      }
    }
    else {
      // for the spline case we solve for the roots 
      // of the intersection
      // or the horizontal line with each spline
      [p0, p1, p2, p3] = shape.controlPoints(i)
      
      p0 = shape.applyTransform(p0);
      p1 = shape.applyTransform(p1);
      p2 = shape.applyTransform(p2);
      p3 = shape.applyTransform(p3);

      intersections = raySplineIntersection(
        vtx, xVec, p0, p1, p2, p3)
      
      for (k = 0; k < intersections.length; k++) {
        if (intersections[k][0]) {
          isIn = !isIn;
          // If we cut at the a vertex, skip the next edge
          // to avoid counting the intersection twice
          if (intersections[k][1] == 1) {
            i++;
          }
          // if the shape is closed and we intersect at 
          // the first vertex,
          // don't test the last edge to avoid counting 
          // twice the intersection
          // at the closing point
          if (intersections[k][1] == 0 && i == 0 &&
              shape.isClosed()) {
            l--;
          }
        }
      }
    }
  }
  return isIn;
}


// resamples a shape's contour to make sure all points are evenly spread on the 
// curve.
// If num_points is larger than 0, the specified number of points will be spread.
// Else, the existing number of points will be redistributed.
// Warning: This may change the look of the shape (-> smoothing).
// Note: because this function spreads the points evenly on the existing contour,
// the resulting shape may have edges of varying lengths: equidistqnce on the
// contour, does not means equidistance in space. Thus some shape distortion may
// appear.
// To try and avoid the shape being skewed towards the first vertex, if offset is
// true and the shape is closed, the first vertex will be moved on the contour
// by a half increment
// For polygonal shapes, for even less distortion a good method 
// is converting to spline first and only then resample. 
// The spline_resample option enables that. It is recommended 
// to always have it on.
function resample(shape, num_points = 0, offset=true, approx=false,
                   spline_resample = true) {
  if (shape.vertices.length <= 1) {
    return shape.copy();
  }
  
  let isPolygonal = shape.isPolygonal;
  if (spline_resample) {
    shape.isPolygonal = false;
  }

  if (num_points == 0 || num_points == shape.vertices.length) {
    num_points = shape.vertices.length;
    offset = false;
  }
  
  let vtx = [];
  
  let totalLength = shape.contourLength();
  let incr = totalLength / (num_points - 1);
  let l = 0;
  let j = -1;
  let start = 0;
  let shift = incr * 0.5;
  if (!offset || !shape.isClosed()) {
    append(vtx, shape.vertices[0].copy());
    start = 1;
    shift = 0;
  }
  
  let tgt;
  let pt;
  let t;
  let k;
  for (let i = start; i < num_points - 1; i++) {
    // retrieve fraction of the contour
    tgt = i * incr + shift;
    
    // find segment which corresponds to the generated distance
    if (l < tgt) {
      j++;
      for (j; j < shape.vertices.length; j++) {
        l += shape.edgeLengths[j];
        if (l >= tgt) {
          break;
        }
      }
    }

    // deduce percentage of edge where the point lands
    t = l - tgt;
    t /= shape.edgeLengths[j];
    t = 1 - t;
    
    pt = new Point(
      shape.edgeInterpolation(t, j, 100,
                     approx, false));
    
    pt.rotation = shape.vertices[j].rotation * (1 - t) +
      shape.vertices[j + 1].rotation * t;
    for (k = 0; k < shape.vertices[j].color.length; k++) {
      pt.color[k] = shape.vertices[j].color[k] * (1 - t) +
        shape.vertices[j + 1].color[k] * t;
    }
    pt.radius = shape.vertices[j].radius * (1 - t) +
      shape.vertices[j + 1].radius * t;
    pt.scale = shape.vertices[j].scale.copy().mult(1 - t).add(
      shape.vertices[j + 1].scale.copy().mult(t));

    append(vtx, pt); 
  }
  
  if (offset && shape.isClosed()) {
    append(vtx, vtx[0]);
  }
  else {
    append(vtx, shape.vertices[shape.vertices.length - 1].copy());
  }

  let nu_shape = shape.copy();
  nu_shape.vertices = vtx
  nu_shape.updateLengths = true;
  nu_shape.updateBounds = true;
  nu_shape.isPolygonal = isPolygonal;

  return nu_shape;
}


// Subdivides each edge of a mesh in equal sub edges
function divide(shape, num_division, approx=false) {
  let nu_shape = shape.copy();
  let nu_vtx = [];
  let vtx;
  let interp;
  let k;
  let t;
  let j;
  for (let i = 0; i < nu_shape.vertices.length - 1; i++) {
    append(nu_vtx, nu_shape.vertices[i].copy());
    vtx = nu_shape.vertices[i].copy();
    interp = 1 / (num_division + 1);
    for (k = 1; k <= num_division; k++) {
      t = k * interp;
      // interpolate position and all other point properties
      if (!shape.isPolygonal) {
        shape.contourLength();
      }
      vtx.setPosition(
        shape.edgeInterpolation(t, i, 100, 
                                approx, false));
      
      vtx.rotation = nu_shape.vertices[i].rotation * (1 - t) +
        nu_shape.vertices[i + 1].rotation * t;
      
      for (j = 0; j < nu_shape.vertices[i].color.length; j++) {
        vtx.color[j] = nu_shape.vertices[i].color[j] * (1 - t) +
          nu_shape.vertices[i + 1].color[j] * t;
      }
      
      vtx.radius = nu_shape.vertices[i].radius * (1 - t) +
        nu_shape.vertices[i + 1].radius * t;
      
      vtx.scale = nu_shape.vertices[i].scale.copy().mult(1 -t).add(
        nu_shape.vertices[i + 1].scale.copy().mult(t));
      append(nu_vtx, vtx.copy());
    }
  }
  append(nu_vtx, nu_shape.vertices[nu_shape.vertices.length - 1].copy());

  nu_shape.vertices = nu_vtx;
  nu_shape.updateLengths = true;
  return nu_shape;
}


// randomly scatters points over a shape's contour or inner region
function scatter(shape, num_points = 100,
  contour = true, approx = true, safety = 10000) {
  let vtx = [];
  if (contour) {
    // longer contours should have more chance of getting points
    let totalLength = shape.contourLength();
    let t;
    let l;
    let j;
    for (let i = 0; i < num_points; i++) {
      // generate random fraction of the contour
      t = random(0, totalLength);
      l = 0; // length accumulator
      // find segment which corresponds to the generated distance
      for (j = 0; j < shape.vertices.length; j++) {
        l += shape.edgeLengths[j];
        if (l >= t) {
          break;
        }
      }

      // deduce percentage of edge where the point lands
      l -= t;
      l /= shape.edgeLengths[j];
      l = 1 - l;
      append(vtx, shape.edgeInterpolation(l, j, 100, approx)); 
    }
  }
  else {
    if (!shape.isClosed()) {
      throw "Points can not be scattered within an open shape." + 
        " Consider adding the first point again as last point " + 
        "to close the shape."
    }
    // Retrieve the bounding box
    boundingBox = shape.getBoundingBox();
    // spawn points within the bounding box and only keep those
    // that are within the actual shape
    let roll;
    let nu_vtx;
    let itr;
    for (let i = 0; i < num_points; i++) {
      roll = true;
      itr = 0;
      while (roll) {
        nu_vtx = createVector(random(boundingBox[0].x,
            boundingBox[1].x),
          random(boundingBox[0].y,
            boundingBox[1].y));
        roll  = !isInside(nu_vtx, shape, approx);
        itr ++;
        if (itr > safety && safety > 0) {
          throw "Could not find place for scattered point in shape";
        }
      }
      append(vtx, nu_vtx);
    }
  }

  let pts = [];
  for (let i = 0; i < vtx.length; i++) {
    append(pts, new Point(vtx[i]));
  }

  return pts;
}


// Relaxes points towards a position which minimizes points overlap based on 
// their radii. This is based on Lloyd's algorithm, but using a weighted 
// voronoi diagram, where the weights are the radii
// https://en.wikipedia.org/wiki/Lloyd%27s_algorithm
// For the Voroinoi diagram computation, we use a monte carlo simulation,
// scattering samples in the canvas randomly. We add the samples to each
// point's cell centroid estimate, if and only if the said point is the 
// closest to the sample, and the sample is at less than point.radius away.
// Once this is done, we move each point to the computed centroids. 
// Rinse and repeat. The resolution determines how many samples we take. The more samples the more precise it is but the slowest it is to compute. Note that as an optimization, we only sample
// inside the current boundingBox extended by the max radius in each direction
function relax(points, 
                iterations = 1, totSamples = 1000,
                shape = [],
                minX = -width/2, minY = -height / 2,
                maxX = width / 2, maxY = height / 2) {
  // we find the max radius
  let  r = 0;
  for (let i = 0; i < points.length; i++) {
    if (points[i].radius > r) {
      r = points[i].radius;
    }
  }
  
  let num_pts = points.length;
  // if a shape is closed, ignore last point
  if(points[points.length - 1].equals(points[0])) {
    num_pts --;
  }

  let cells;
  let sampleCount;
  let mx; 
  let Mx;
  let my;
  let My;
  let j;
  let p;
  let m;
  let idx;
  let isCell;
  let k;
  let dist;
  let pt;
  for (let i = 0; i < iterations; i++) {
    cells = new Array(num_pts).fill(createVector(0, 0));
    sampleCount = new Array(num_pts).fill(0);
    
    // we evaluate the bounding box
    mx = width;
    Mx = -width;
    my = height;
    My = -height;
    for (j = 0; j < points.length; j++) {
      if (points[j].x > Mx) {
        Mx = points[j].x
      }
      else if (points[j].x < mx) {
        mx = points[j].x
      }
      if (points[j].y > My) {
        My = points[j].y
      }
      else if (points[j].y < my) {
        my = points[j].y
      }      
    }
    // we extend the bounding box by the max radius
    mx = max([mx - r, minX]);
    my = max([my - r, minY]);
    Mx = min([Mx + r, maxX]);
    My = min([My + r, maxY]);
    
    // we generate totSample random samples and update the centroid
    // of the closest point's voronoi cell
    for (j = 0; j < totSamples; j++) {
      p = createVector(random(mx, Mx), random(my, My));
    
      // find closest point's idx
      m = width * width + height * height;
      idx = 0;
      isCell = false;
      for (k = 0; k < points.length; k++) {
        pt = points[k].position();
        if (shape) {
          pt = shape.applyTransform(points[k]).position();
        }
        dist = pt.sub(p).mag()
        if (dist < m && dist <= points[k].radius) {
          m = dist;
          idx = k;
          isCell = true;
        }
      }
      
      // add the new points position to the centroid
      if (isCell) {
        cells[idx] = cells[idx].copy().add(p.copy());
        sampleCount[idx]++;
      }
    }
    
    // for each cell divide the centroid by the sample count
    for (j = 0; j < num_pts; j++) {
      if (sampleCount[j] != 0) {
        cells[j].div(sampleCount[j]);
      }
    }

    // move points to the centroids of there respective cells
    for (j = 0; j < num_pts; j++) {
      if (sampleCount[j] != 0) {
        points[j].setPosition(cells[j]);
      }
    }
    
    if (num_pts == points.length - 1) {
      points[points.length - 1] = points[0].copy();
    }
  }

  return points;
}


// copies a shape at specified points
// the new shape will inheritate the points color,
// it's shape will be that of the original shape times the that of the point,
// and it's velocity will be a composition of the velocity of the points,
// and the shape owning the points
function copyToPoints(shape, points) {
  shapes = [];
  let nu_shape;
  for (let i = 0; i < points.length; i++) {
    nu_shape = shape.copy();
    // if point has owner, apply transform to point and add rotation to shape
    if (points[i].owner) {
      nu_shape.position = points[i].owner.applyTransform(
        points[i]);
      nu_shape.rotation += points[i].owner.rotation;
    }
    else {
      nu_shape.position = points[i].position();
    }
    nu_shape.stroke = points[i].color;
    nu_shape.fillColor = points[i].color;
    nu_shape.scale.mult(points[i].scale);
    nu_shape.updateBounds = true;
    nu_shape.updateLengths = true;
    append(shapes, nu_shape.copy());
  }

  return shapes;
}


// returns an intermediary shape between 2 shapes that have the same number of vertices.
// A boolean allows to keep the appearance of shape A or B
// If this function is to be called multiple times in a raw, for animation purposes
// for instance, one can specify the point pairs using point_match to save the computation time
// of finding the best vertex matching (and keep it consistant throughout the interpolation),
// should one of the 2 shapes be switched for the interpolated one on subsequent itterations.
// The point_match input consist only of the index of the matching vertex in shape B
// to vertex 0 in A. All other pairs can then be deduced using a circular buffer.
function sInterpolate(A, B, interp, keepA = true, point_match = -1, match_dir = 1) {
  if (A.vertices.length != B.vertices.length) {
    throw "sInterpolate can only interpolate between 2 shapes with the same number of vertices. Consider using resample first";
  }

  let C = A.copy();
  if (!keepA) {
    C = B.copy();
  }
  
  // reset transform of object, as well as velocity because we
  // interpolate between world coordinates of points
  C.scale = createVector(1, 1);
  C.position = createVector(0, 0);
  C.rotation = 0;

  // if no point pair has been provided.
  // This is done by minimizing the average distance between point pairs
  if (point_match < 0) {
    point_match = 0;
    // brute force (see SO question https://preview.tinyurl.com/y26xsngd)
    let m = Number.MAX_VALUE;
    let d;
    let d1;
    let i;
    for (let k = 0; k < A.vertices.length; k++) {
      d = 0;
      d1 = 0;
      for (i = 0; i < A.vertices.length; i++) {
        d += (A.applyTransform(A.vertices[i]).sub(
          B.applyTransform(
            B.vertices[(i + k) % A.vertices.length]))).mag();    
        d1 += (A.applyTransform(A.vertices[i]).sub(
          B.applyTransform(
            B.vertices[(-i - k + 2 * A.vertices.length) % 
                       A.vertices.length]))).mag();
      }

      if (d < m) {
        m = d;
        point_match = k;
        match_dir = 1;
      }
      if (d1 < m) {
        m = d;
        point_match = k;
        match_dir = -1;
      }
    }
    // let sum;
    // [point_match, sum] = matchPoints(A.vertices, B.vertices);
  }

  for (let i = 0; i < C.vertices.length; i++) {
    C.vertices[i].setPosition(
      A.applyTransform(A.vertices[i]).mult(
      1 - interp).add(
      B.applyTransform(
        B.vertices[(match_dir * i + match_dir * point_match) %
        A.vertices.length]).mult(interp)));
  }

  return C;
}


// returns the offset between 2 sets of points to minimize
// average pair-wise distance
function matchPoints(A, B) {
  // if the length of the list is 2, manually sort it
  if (A.length == 2) {
    let s0 = 0;
    let s1 = 0;
    for (let i = 0; i < A.length; i++) {
      s0 += (A[i].position().sub(B[(i + 1) % A.length])).mag();
      s1 += (A[i].position().sub(B[(i) % A.length])).mag();
    }
    
    if (s0 < s1) {
      return 
    }
  }
  else {
    // Else, compute middle of each point pair and retrieve it's best match.
    // Then check one rotation forward or backward
    let midA = [];
    let midB = [];
    let a;
    let b;
    for (let i = 0; i < A.length - 1; i+=2) {
      a = A[i + 1].copy();
      a.add(A[i]).mult(0.5);
      b = B[i + 1].copy();
      b.add(B[i]).mult(0.5);
      append(midA, a);
      append(midB, b);
    }
    let k;
    let sum;
    [k, sum] = matchPoints(midA, midB);
    k *= 2;

    let s0 = 0;
    let s1 = 0;
    for (let i = 0; i < A.length; i++) {
      s0 += (A[i].position().sub(B[(i + k + 1) % A.length])).mag();
      s1 += (A[i].position().sub(B[(i + k - 1) % A.length])).mag();
    }
    
    let k0 = k;
    if (s0 < sum) {
      sum = s0;
      k0 = k + 1;
    }
    if (s1 < sum) {
      sum = s1;
      k0 = k - 1;
    }

    return [k0, sum];
  }
}


// given a function and a set of coordinates, this function returns the
// displaced coordinates following the gradient of the function which takes
// x and y coordinates as input and returns a value in the [0, 1] range
// The function also takes as argument the amplitude of the deformation,
// as well as the derivative step
function gradDistort(point, func, amplitude, step = 1) {
  // compute the gradient
  let grad = createVector(
    func(point.x + step, point.y), func(point.x, point.y + step)).sub(
      createVector(
        func(point.x - step, point.y), func(point.x, point.y - step)
      )
    ).div(2 * step);
  // move the point in the opposite direction to the gradient by the
  // specified amplitude
  return point.copy().add(grad.mult(-amplitude));
}


// distorts an image using some simulated depth.
// This works by stretching the uv coordinates to wrap around the simulated
// geometry, assuming white means an elevation of "amplitude" and black means 0
function distort(point, func, amplitude, step) {
  // compute the original uv coordinates of the point
  let uv = createVector(point.x / width + 0.5, point.y / height + 0.5);

  // compute the new "length" along the X and Y directions
  let lenX = 0;
  let lenY = 0;
  let buffer = func(-width / 2, point.y);
  let depth;
  for (let i = - width / 2 + step; i < width / 2; i += step) {
    depth = func(i, point.y);
    lenX += createVector(step, (depth - buffer) * amplitude).mag();
    buffer = depth;
  }
  buffer = func(point.x, -height / 2);
  for (let i = - height / 2 + step; i < height / 2; i += step) {
    depth = func(point.x, i);
    lenY += createVector(step, (depth - buffer) * amplitude).mag();
    buffer = depth;
  }

  let nu_pt = point.copy()
  // find the point in x which corresponds to the u coordinate
  // and same thing with y and v
  let u = 0;
  let v = 0;
  buffer = func(-width / 2, point.y);
  for (let i = - width / 2 + step; i < width / 2; i += step) {
    depth = func(i, point.y);
    u += createVector(step, (depth - buffer) * amplitude).mag();
    buffer = depth;
    if (u / lenX >= uv.x) {
      nu_pt.x = i;
      break; 
    }
  }
  buffer = func(point.x, -height / 2);
  for (let i = - height / 2 + step; i < height / 2; i += step) {
    depth = func(point.x, i);
    v += createVector(step, (depth - buffer) * amplitude).mag();
    buffer = depth;
    if (v / lenY >= uv.y) {
      nu_pt.y = i;
      break; 
    }
  }

  return nu_pt;
}


// Boolean operation which returns the union of B from A.
// If either A or B is not closed, the last point will be
// considered as connected to the first.
// The resulting shape is closed no matter what.
// If A and B don't intersect this operation will fail and return A.
function sUnion(A, B) {

}


// Boolean operation which returns the intersection of A and B.
// If either A or B is not closed, the last point will be
// considered as connected to the first.
// The resulting shape is closed no matter what.
function sIntersection(A, B) {

}


// Boolean operation which sutracts B from A.
// If either A or B is not closed, the last point will be
// considered as connected to the first.
// The resulting shape is closed no matter what.
function sSubtract(A, B) {

}
