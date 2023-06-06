/**
 * @author Niels Pichon <niels.pichon@outlook.com>
 * @fileoverview This file contains classes and methods to better
 * handle 2D shape and points based procedures.
 */

/**
 * Defines the namespace for all classes of the p5.Fresco library
 * @namespace
 */
let Fresco = {};

/**
 * Buffer of shapes in which each and every shape that is drawn to the canvas will be registered.
 */
Fresco.shapeBuffer = [];

/**
 * Toggle shape registration on and off
 */
Fresco.registerShapes = true;

/**
 * Registers a reference to a shape
 * @param {Fresco.Shape} shape shape to register
 */
function registerDrawnShape(shape) {
  if (Fresco.registerShapes) {
    if (shape.vertices.length > 1) {
      let idx = Fresco.shapeBuffer.indexOf(shape);
      if (idx == -1) {
        Fresco.shapeBuffer.push(shape);
      }
    }
  }
}


/**
 * Set the background's color. Any registred shape will be removed.
 * @param {Array<Number>} color rgba array
 */
function setBackgroundColor(color) {
  Fresco.shapeBuffer = [];
  background(color);
}

/**
 * Type of shadows that can be used when drawing the shadow of a shape
 */
const shadowType = {
  hatching: 1,
  stippling: 2,
  full: 3,
  vanishing: 4
}


/**
 * Helper function to draw a line from 2 p5.vectors.
 * Note that everything is shifted so that 0,0 is
 * always the center of the Canvas and the y axis is
 * pointing upwards
 * @param {p5.Vector} p1 first line extremity
 * @param {p5.Vector} p2 second line extremity
 */
function drawLine(p1, p2) {
  line(p1.x + width / 2, -p1.y + height / 2,
    p2.x + width / 2, -p2.y + height / 2);
}


/**
 * Helper function to draw a point from a p5.vector
 * Note that everything is shifted so that 0,0 is
 * always the center of the Canvas and the y axis is
 * pointing upwards
 * @param {p5.Vector} p1 Point to draw
 */
function drawPoint(p1) {
  point(p1.x + width / 2, -p1.y + height / 2);
}


/**
 * Helper function to add a Vertex to a curve from a p5.vector.
 * Note that everything is shifted so that 0,0 is
 * always the center of the Canvas and the y axis is
 * pointing upwards
 * @param {p5.Vector} p1 Vertex position
 * @param {p5.Graphics} buffer Optional buffer to draw to instead of the actual canvas
 */
function drawCurveVertex(p1, buffer = null) {
  let [x, y] = [p1.x + width / 2, -p1.y + height / 2];
  if (!buffer) {
    curveVertex(x, y);
  }
  else {
    buffer.curveVertex(x, y);
  }
}


/**
 * Helper function to add a Vertex to a curve from a p5.vector.
 * Note that everything is shifted so that 0,0 is
 * always the center of the Canvas and the y axis is
 * pointing upwards
 * @param {p5.Vector} p1 Vertex position
 * @param {p5.Graphics} buffer Optional buffer to draw to instead of the actual canvas
 */
function drawVertex(p1, buffer = null) {
  let [x, y] = [p1.x + width / 2, -p1.y + height / 2];
  if (!buffer) {
    vertex(x, y);
  }
  else {
    buffer.vertex(x, y);
  }
}


/**
 * Helper function to draw a bezier curve from some p5.vector
 * Note that everything is shifted so that 0,0 is
 * always the center of the Canvas and the y axis is
 * pointing upwards
 * @param {p5.Vector} p1 First anchor point
 * @param {p5.Vector} p2 First control point
 * @param {p5.Vector} p3 Second control point
 * @param {p5.Vector} p4 Second anchor point
 */
function drawBezier(p1, p2, p3, p4) {
  bezier(
    p1.x + width / 2, -p1.y + height / 2,
    p2.x + width / 2, -p2.y + height / 2,
    p3.x + width / 2, -p3.y + height / 2,
    p4.x + width / 2, -p4.y + height / 2
  );
}


/**
 * Helper to draw text at a position specified from a p5.Vector
 * Note that everything is shifted so that 0,0 is
 * always the center of the Canvas and the y axis is
 * pointing upwards
 * @param {string} str Text to write
 * @param {p5.Vector} pos Position of the text
 */
function drawText(str, pos) {
  text(str, pos.x + width / 2, -pos.y + height / 2);
}


/**
 * Helper function to draw a circle centered on a p5.Vector.
 * Note that everything is shifted so that 0,0 is
 * always the center of the Canvas and the y axis is
 * pointing upwards
 * @param {p5.Vector} center Position of the circle center
 * @param {number} radius Radius of the circle in pixels
 */
function drawCircle(center, radius) {
  circle(center.x + width / 2, -center.y + height / 2, 2 * radius);
}


/**
 * Converts an array of shapes to JSON.
 * WARNING: Will freeze any  existing transform.
 * @param {Array<Fresco.Shape>} shapes
 */
function shapesToJSON(shapes) {
  buffer = [];
  shapes.forEach(
    s => buffer.push(s.toJSON())
  );
  jsonData = {
    shapes: buffer
  };
  return JSON.stringify(jsonData)
}

/**
 * Converts an array of shapes to JSON and saves it to file.
 * WARNING: Will freeze any  existing transform.
 * @param {Array<Fresco.Shape>} shapes
 */
function shapesToFile(shapes, filename) {
  let content = shapesToJSON(shapes);

  let a = document.createElement("a");
  let file = new Blob([content], { type: 'text/plain' });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
}

/**
 * Helper function which draws a normal to a vertex of a shape.
 *
 * @param {p5.Vector} normal Normal we want to draw. It should be
 * normalized and expressed in the shape referential
 * @param {p5.Vector} pt Point at which the normal was computed,
 * in the shape referential
 * @param {Fresco.Shape} shape Shape to which the point belongs
 * @param {number} length Lenght we want to draw the normal at
 */
function drawNormal(normal, pt, shape, length = 10) {
  let n = shape.applyTransform(pt.position().add(
    normal.copy()));
  n.sub(shape.applyTransform(pt.position())).normalize().mult(length).add(
    shape.applyTransform(pt.position()));
  drawLine(shape.applyTransform(pt), n);
}

// container class describing a Point object. A point object is a p5.Vector with a color,
// a radius, a transform and a potential owner
/**
 * Class describing a Point object. A point object is a p5.Vector with a color,
 * a radius, a transform and a potential owner.
 * @class
 * @extends p5.Vector
 */
Fresco.Point = class extends p5.Vector {
  /**
   * @constructor
   * @param {p5.Vector} position Position of the point.
   * @property {number} rotation=0 - Rotation of the point. Useful when instancing a shape with this point's transform.
   * @property {Array.<number>} color=255,255,255,255 - Color of the point in RGBA, defined as an array of 4 values in the [0, 255] range.
   * @property {number} radius=1 - Radius of the point. Used as strokeWeight when drawing, as well as for relaxation.
   * @property {p5.Vector} scale=1,1 - Point scale, useful when instancing a shape with this point's transform.
   * @property {Fresco.Shape} [owner] - Shape to which this point belongs to.
   * @property {number} layer=0 - Used for drawing with an axidraw. Specifies which layer this point shoul be drawn on.
   * This property is only used when the point is not part of a shape.
   */
  constructor(position) {
    super(position.x, position.y, position.z);
    this.rotation = 0;
    this.color = [255, 255, 255, 255];
    this.radius = 1;
    this.scale = createVector(1, 1);
    this.owner;
    this.layer = 0
  }

  /**
   * Utility function which draws the point on the canvas. It will use
   * the point color for the `stroke` and its radius for the `strokeWeight`
   */
  draw() {
    stroke(this.color);
    strokeWeight(this.radius);
    if (this.owner) {
      drawPoint(this.owner.applyTransform(this.position()));
    }
    else {
      drawPoint(this.position());
    }
  }

  /**
   * Does nothing. Simply here to homogenize with other Fresco objects
   */
  freezeTransform() {
  }

  /**
   * Generic function for setting this point's position.
   * Can be used interchangeably with setting the position attribute directly
   * @param {p5.Vector} pos
   */
  setPosition(pos) {
    this.position = pos;
  }

  /**
   * Generic function for setting this point's rotation.
   * Can be used interchangeably with setting the position attribute directly
   * @param {Number} rot
   */
  setRotation(rot) {
    this.rotation = rot;
  }

  /**
   * Generic function for setting this point's scale.
   * Can be used interchangeably with setting the position attribute directly
   * @param {p5.Vector} scale
   */
  setScale(scale) {
    this.scale = scale;
  }

  /**
   * Computes a falloff value based on the distance to the point. The falloff
   * will reach zero when reaching the radius of  the particle.
   * @param {p5.Vector} vtx Point to evaluate the falloff at
   * @param {number} decayPower How fast the falloff decays. The distance will be
   * put at the the specified power. For example a value of 1 means linear decay,
   * 2 quadratic decay and so on...
   * @returns {number} Falloff value in the [0, 1] range, where 0 means we are out
   * of particle range, and 1 at the particle
   */
  falloff(vtx, decayPower) {
    let distance = (this.position().sub(vtx)).mag();
    let r = distance / this.radius;
    return 1 - pow(r, decayPower);
  }

  /**
   * Checks whether all properties are equal. Is so, the other point
   * is considered the same as this one.
   * This ignores ownership so 2 points belonging to 2 different shapes will
   * still be detected as one and only
   * @param {Fresco.Point} pt Point to compare this one with
   * @returns {boolean} True is the provided point is found to be the same as this one
   */
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

  /**
   * Sets the point color
   * @param {Array.<number>} color Array of RGBA values in the range [0, 255]
   */
  setColor(color) {
    this.color = color;
  }

  /**
   * Returns a copy of the position of the point as a
   * `p5.Vector`.
   * @returns {p5.Vector} Copyof the position of this Point.
   */
  position() {
    return createVector(this.x, this.y, this.z);
  }


  /**
   * Set a provided p5.Vector as the new position of this
   * point
   * @param {p5.Vector} nu_pos New position to set this point at
   */
  setPosition(nu_pos) {
    this.x = nu_pos.x;
    this.y = nu_pos.y;
    this.z = nu_pos.z;
  }


  // returns a deepcopy of this point
  /**
   * Copies this point.
   * This behaves as a deepcopy so the new point can be messed with
   * without fear of backpropagating changes to this one.
   * To avoid cyclic references due to the
   * point possible ownership by a shape, we stayed away from
   * using JSON Serialization-Deserialization an manually copied
   * over properties instead.
   * @returns {Fresco.Point} Deepcopy of this point
   */
  copy() {
    // ugly but avoids issues with cyclic references
    // when using JSON serialization
    let nu_pt = new Fresco.Point(this.position());
    nu_pt.rotation = this.rotation;
    nu_pt.radius = this.radius;
    nu_pt.scale = this.scale.copy();
    nu_pt.owner = this.owner;
    nu_pt.layer = this.layer;
    arrayCopy(this.color, nu_pt.color);
    return nu_pt;
  }

  toJSON() {
    // export the point as a dictionary of coordinates, normalized to the [0, 1] range
    return {
      x: (this.x / width) + 0.5,
      y: (this.y / height) + 0.5,
    }
  }
}


// simple utility to create a point from coordinates
/**
 * Utility function which creates a `Fresco.Point`
 * from x, y, and z coordinates
 * @param {number} x X-coordinate of the new Point
 * @param {number} y Y-coordinate of the new Point
 * @param {number} [z] Z-coordinate of the new Point
 */
function createPoint(x, y, z = null) {
  return new Fresco.Point(createVector(x, y, z));
}


/**
 * Container for all point based 2D shapes.
 */
Fresco.Shape = class {
  /**
   * @constructor
   * @param {Array.<Fresco.Point>} vertices Vertices of this shape.
   * For this shape to behave properly, it is important to use  `Fresco.Point` and not simple  `p5.Vector`.
   * Note that for easier handling in functions,
   * the class has no understanding of closed shapes.
   * To make a closed shape, simply add a copy of the first point
   * back at the end
   * of the vertices list
   * @property {Array.<Fresco.Point>} vertices The shape's vertices
   * @property {p5.Vector} position=0,0 - Position of the shape
   * @property {number} rotation=0 - Rotation of the shape
   * @property {p5.Vector} scale=1,1 - Scale of the shape
   * @property {Array.<number>} color=255,255,255,255 Color of the contour in RGBA,
   * described as an array of 4 values in the [0, 255] range.
   * @property {Array.<number>} fillColor=255,255,255,255 Color of the fill of the shape in RGBA
   * described as an array of 4 values in the [0, 255] range.
   * @property {boolean} noStroke=false Whether to draw the contour of the shape
   * @property {boolean} noFill=true Whether to fill in the shape
   * @property {number} strokeWeight=1 Stroke weight to draw the shape's contour with.
   * @property {Array.<p5.Vector>} [BoundingBox] of the shape described as the top left and bottom right corners.
   * DO NOT CALL DIRECTLY. Use getBoundingBox() instead.
   * @property {boolean} updateLengths=true Whether the edge lengths currently need recomputing.
   * @property {Array.<number>} [edgeLengths] Length of the edges of the shape
   * @property {boolean} ignoreEnds Whether the first and last vertices should be ignored when drawing
   * @property {number} layer=0 - Used for drawing with an axidraw. Specify which layer to draw this shape on
   */
  constructor(vertices = []) {
    this.vertices = vertices; // Array of Points
    // set this shape as owner of the vertices
    for (let i = 0; i < vertices.length; i++) {
      this.vertices[i].owner = this;
    }

    this.isPolygonal = false; //Whether to use lines or sdrawLines to connect vertices
    this.position = createVector(0, 0);
    this.rotation = 0;
    this.scale = createVector(1, 1);
    this.color = [255, 255, 255, 255];
    this.fillColor = [255, 255, 255, 255];
    this.noStroke = false;
    this.noFill = true;
    this.strokeWeight = 1;
    // This contains the bounding box opposite corners, provided it has been calculated
    this.boundingBox = []; // DO NOT CALL DIRECTLY. Use getBoundingBox() instead.
    this.updateLengths = true; // whether the edge length should be recomputed
    this.edgeLengths = [];
    this.layer = 0;
  }


  /**
   * Generic function for setting this shape's position.
   * Can be used interchangeably with setting the position attribute directly
   * @param {p5.Vector} pos
   */
  setPosition(pos) {
    this.position = pos;
  }

  /**
   * Generic function for setting this shape's rotation.
   * Can be used interchangeably with setting the position attribute directly
   * @param {Number} rot
   */
  setRotation(rot) {
    this.rotation = rot;
  }

  /**
   * Generic function for setting this shape's scale.
   * Can be used interchangeably with setting the position attribute directly
   * @param {p5.Vector} scale
   */
  setScale(scale) {
    this.scale = scale;
  }

  /**
   * Returns a minimal description of the shape
   * WARNING: Freezes the transform
   * @returns The JSON friendly dict represnting the shape
   */
  toJSON() {
    this.freezeTransform()
    let points = []
    for (let i = 0; i < this.vertices.length; i++) {
      points.push(this.vertices[i].toJSON());
    }
    return {
      canvas_width: width,
      canvas_height: height,
      vertices: points,
      isPolygonal: this.isPolygonal,
      layer: this.layer,
    }
  }

  /**
   * JSONify the shape and saves it to file
   * WARNING: Freezes the transform
   * @param {string} filename Filename to save the shape to
   */
  toFile(filename) {
    let jsonData = this.toJSON()
    let content = JSON.stringify(jsonData)

    let a = document.createElement("a");
    let file = new Blob([content], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
  }

  /**
   * Utility to draw the shape
   * @param {boolean} usePointColor=false Whether to use  the shape color or the
   * individual vertices color.
   * At the current time, p5.js does not support drawing shapes with
   * multiple vertices color so this will
   * most likely result in drawing the shape  with the last vertex's color.
   * @param {boolean} registerCopy=false If true, a copy of this shape will be registered instead of this shape.
   * This is necessary if you want to overlay multiple versions of this shape.
   */
  draw(usePointColor = false, registerCopy = false) {
    if (registerCopy && Fresco.registerShapes) {
      registerDrawnShape(this.copy());
    }
    else {
      registerDrawnShape(this);
    }
    this._draw(usePointColor);
  }

  /**
   * Duplicate of the draw method except the shape won't be registered
   * @param {boolean} [usePointColor] Whether to use  the shape color or the
   * individual vertices color.
   * At the current time, p5.js does not support drawing shapes with
   * multiple vertices color so this will
   * most likely result in drawing the shape  with the last vertex's color.
   */
  drawNoRegister(usePointColor = false) {
    this._draw(usePointColor);
  }

  _draw(usePointColor) {
    this._drawInstantiate(usePointColor);
  }

  /**
   * Utility to draw the shape with a specified (optional) transform
   * @param {boolean} [usePointColor] Whether to use  the shape color or the
   * individual vertices color.
   * @param {p5.Vector} [position] Position offset. If not specified,
   * the method will use the shape's own transform.
   * @param {p5.Vector} [scale] Scale. If `position` is specified,
   * this will default to unit scale.
   * @param {number} [rotation] Rotation. If `position` is specified,
   * this will default to 0.
   * @param {Array.<number>} color RGBA color the stroke of the instance,
   * as an array of 4 values in the range [0,255].
   * Ignored if `usePointColor`. If not specified, will default to the shape's color.
   * @param {Array.<number>} fillColor RGBA fill color of the stroke of the instance,
   * as an array of 4 values in the range [0,255].
   * If not specified, will default to the shape's fillColor.
   * @param {number} lineWeight Weight of the stroke.
   * If not specified, will default to the shape's strokeWeight.
   * At the current time, p5.js does not support drawing shapes with
   * multiple vertices color so this will
   * most likely result in drawing the shape  with the last vertex's color.
   * Note: This will register a copy of this shape with the appropriate transform rather than
   * the shape itself, allowing to register several instances.
   */
  drawInstantiate(usePointColor = false, position = null,
    scale = null, rotation = null, color = null, fillColor = null,
    lineWeight = null) {
    if (Fresco.registerShapes) {
      let shapeBuf = this.copy();
      if (position != null) {
        shapeBuf.position = position;
      }
      if (scale != null) {
        shapeBuf.scale = scale;
      }
      if (rotation != null) {
        shapeBuf.rotation = rotation;
      }
      shapeBuf.freezeTransform();
      registerDrawnShape(shapeBuf);
    }

    this._drawInstantiate(usePointColor, position, scale, rotation, color, fillColor, lineWeight);
  }

  /**
   * Duplicate of the draw instantiate function in which the drawn shape will not be registered
   * @param {boolean} [usePointColor] Whether to use  the shape color or the
   * individual vertices color.
   * @param {p5.Vector} [position] Position offset. If not specified,
   * the method will use the shape's own transform.
   * @param {p5.Vector} [scale] Scale. If `position` is specified,
   * this will default to unit scale.
   * @param {number} [rotation] Rotation. If `position` is specified,
   * this will default to 0.
   * @param {Array.<number>} color RGBA color the stroke of the instance,
   * as an array of 4 values in the range [0,255].
   * Ignored if `usePointColor`. If not specified, will default to the shape's color.
   * @param {Array.<number>} fillColor RGBA fill color of the stroke of the instance,
   * as an array of 4 values in the range [0,255].
   * If not specified, will default to the shape's fillColor.
   * @param {number} lineWeight Weight of the stroke.
   * If not specified, will default to the shape's strokeWeight.
   * At the current time, p5.js does not support drawing shapes with
   * multiple vertices color so this will
   * most likely result in drawing the shape  with the last vertex's color.
   */
  drawInstantiateNoRegister(usePointColor = false, position = null,
    scale = null, rotation = null, color = null, fillColor = null,
    lineWeight = null) {
    this._drawInstantiate(usePointColor, position, scale, rotation, color, fillColor, lineWeight);
  }

  _drawInstantiate(usePointColor = false, position = null,
    scale = null, rotation = null, color = null, fillColor = null,
    lineWeight = null) {

    if (this.vertices.length == 0) {
      return;
    }

    if (this.noStroke && !usePointColor) {
      noStroke();
    } else {
      if (color) {
        stroke(color);
      }
      else {
        stroke(this.color);
      }
      if (lineWeight) {
        strokeWeight(lineWeight);
      }
      else {
        strokeWeight(this.strokeWeight);
      }
    }

    let fillBuffer = this.fillColor;
    if (this.noFill) {
      noFill();
    }
    else {
      if (fillColor) {
        this.fillColor = fillColor;
      }
      fill(this.fillColor);
    }

    beginShape();
    if (this.isPolygonal) {
      let start = 0;
      let end = this.vertices.length;
      if (this.ignoreEnds) {
        start++;
        end--;
      }

      let vtx;
      for (let i = start; i < end; i++) {
        vtx = this.applyTransform(this.vertices[i],
          position, scale, rotation);
        if (usePointColor) {
          stroke(this.vertices[i].color);
        }
        drawVertex(vtx);
      }
    } else {
      let vtx;
      if (!this.ignoreEnds) {
        // we add the first and last vertex twice to make sure all points
        // are part of the curve. Note that if the shape is closed, we
        // use the last but one and second points instead
        vtx = this.applyTransform(this.vertices[0],
          position, scale, rotation);
        if (this.isClosed()) {
          vtx = this.applyTransform(
            this.vertices[this.vertices.length - 2],
            position, scale, rotation);
          if (usePointColor) {
            stroke(this.vertices[this.vertices.length - 2].color);
          }
        }
        else if (usePointColor) {
          stroke(this.vertices[0].color);
        }

        drawCurveVertex(vtx);
      }

      for (let i = 0; i < this.vertices.length; i++) {
        vtx = this.applyTransform(this.vertices[i],
          position, scale, rotation);
        if (usePointColor) {
          stroke(this.vertices[i].color);
        }
        drawCurveVertex(vtx);
      }

      if (!this.ignoreEnds) {
        vtx = this.applyTransform(
          this.vertices[this.vertices.length - 1],
          position, scale, rotation);

        if (this.isClosed()) {
          vtx = this.applyTransform(
            this.vertices[1], position, scale, rotation);
          if (usePointColor) {
            stroke(this.vertices[1].color);
          }
        }
        else {
          if (usePointColor) {
            stroke(this.vertices[this.vertices.length - 1].color);
          }
        }
        drawCurveVertex(vtx);
      }
    }
    endShape();

    this.fillColor = fillBuffer;
  }

  /**
   * Draws the shape to a buffer rather than to the actual canvas.
   * @param {p5.Graphics} buffer The p5.Graphics buffer object to draw to
   */
  drawToBuffer(buffer) {
    console.log(this.vertices);
    if (this.vertices.length == 0) {
      return;
    }

    // set brush properties
    buffer.stroke(this.color);
    buffer.strokeWeight(this.strokeWeight);
    if (this.noFill) {
      buffer.noFill();
    }
    else {
      buffer.fill(this.fillColor);
    }

    buffer.beginShape();
    if (this.isPolygonal) {
      let start = 0;
      let end = this.vertices.length;
      if (this.ignoreEnds) {
        start++;
        end--;
      }

      let vtx;
      for (let i = start; i < end; i++) {
        vtx = this.applyTransform(this.vertices[i]);
        drawVertex(vtx, buffer);
      }
    } else {
      let vtx;
      if (!this.ignoreEnds) {
        // we add the first and last vertex twice to make sure all points
        // are part of the curve. Note that if the shape is closed, we
        // use the last but one and second points instead
        vtx = this.applyTransform(this.vertices[0]);
        if (this.isClosed()) {
          vtx = this.applyTransform(
            this.vertices[this.vertices.length - 2]);
        }
        drawCurveVertex(vtx, buffer);
      }

      for (let i = 0; i < this.vertices.length; i++) {
        vtx = this.applyTransform(this.vertices[i]);
        drawCurveVertex(vtx, buffer);
      }

      if (!this.ignoreEnds) {
        vtx = this.applyTransform(
          this.vertices[this.vertices.length - 1]);

        if (this.isClosed()) {
          vtx = this.applyTransform(this.vertices[1]);
        }
        drawCurveVertex(vtx.buffer);
      }
    }
    buffer.endShape();
  }

  /**
   * Draws each and  every point of the shape
   */
  drawPoints() {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].draw();
    }
  }


  //
  // diffusivity defines how far from the original
  // line points may be moved
  /**
   * Draws scattered points along contour. The  goal is to give  some organic
   * effect and as such point  will not necessarily land  on the contour.
   * How far they are allowed
   * to land is controled by the  diffusivity.
   * Each point  will have a different `strokeWeight` which will be randomly
   * chosen within the user specified interval.
   * @param {number} [numPoints] Number of points  to Fresco.
   * @param {number} [diffusivity] How far form the original contour, in pixels, a point can land
   * @param {number} [minWeight] Minimum random stroke weight with which a point  can be  drawn
   * @param {number} [maxWeight] Maximum random stroke weight with which a point  can be  drawn
   */
  drawScattered(numPoints = 1000, diffusivity = 5, minWeight = .5, maxWeight = 2) {
    stroke(this.color);
    let p = scatter(this, numPoints);

    let theta = 0;
    let r = 0;
    for (let i = 0; i < p.length; i++) {
      r = random(0, diffusivity);
      theta = random(0, 2 * Math.PI);
      p[i].x += r * Math.cos(theta);
      p[i].y += r * Math.sin(theta);

      strokeWeight(random(minWeight, maxWeight));
      drawPoint(p[i]);
    }
  }


  // draws multiple lines on top of one another
  // with a bit of noise.
  /**
   * Draws multiple contours on top of one another,
   * Each one of   them being displaced by some noise,
   * to  give some organic feel to the  drawing.
   * @param {number} [numLines] Number of line to draw
   * @param {number} [diffusivity] How  far  a contour vertex may be displaced in pixels
   * @param {number} [lineOpacity] Opacity of  each contour line
   * @param {boolean} [close] Whether to force the displaced line to come back
   * to the starting point, should the original  shape be closed.
   */
  drawNoisy(numLines = 5, diffusivity = 5, lineOpacity = 128, close = true) {
    let tmp_s = this.copy();
    tmp_s.color[3] = lineOpacity;
    let j;
    let r;
    let theta;
    for (let i = 0; i < numLines; i++) {
      for (j = 0; j < tmp_s.vertices.length; j++) {
        r = diffusivity * noise(
          this.vertices[j].x * 0.001 + i * 0.01,
          this.vertices[j].y * 0.001 + i + 0.01
        );
        theta = 20 * Math.PI * noise(
          this.vertices[j].x * 0.001 + i + 0.01,
          this.vertices[j].y * 0.001 + i + 0.01
        );
        // r = random(0, diffusivity);
        // theta = random(0, 2 * Math.PI);
        tmp_s.vertices[j].x = this.vertices[j].x + r * Math.cos(theta);
        tmp_s.vertices[j].y = this.vertices[j].y + r * Math.sin(theta);
      }
      if (this.isClosed() && close) {
        tmp_s.vertices[tmp_s.vertices.length - 1] = tmp_s.vertices[0];
      }

      tmp_s.draw();
    }
  }


  /**
   * Draws the shadow of a 2D shape using hatching or stippling
   * @param {number} [type] Whether to use hatching or stippling.
   * @param {number} [angle] Angle of the shadow. The shadow will only be cast
   * where the normals are oriented in the shadows direction
   * @param {number} [tolerance] Angle tolerance to consider a normal to be in
   * the right direction for the shape to cast a shadow at the point
   * @param {number} [density] How many points to evaluate the normal of along the contour
   * and draw hatches or stipples from
   * @param {number} [length] Max length of the hatches or max distance of a stipple
   * @param {number} [inside] Should the shadow be cast inside or outside the shape
   * @param {number} [stipplingDensity] Max number of stipple to draw for each evaluated point
   * @param {number} [weight] Min stroke weight of the hatching lines and stipples
   * @param {number} [weightRandomness] Max random amount to add to the stroke weight
   * @param {boolean} [constantLength] Whether the `length` should be modulated by
   * the angle relative to the normal
   * @param {number} [vanishingBands] Number of bands to use when drawing a `vanishing` shadow type.
   * @param {number} [hatchingAngle] Angle to hatch at, relative to the normal.
   */
  drawShadow(type = shadowType.hatching, angle = Math.PI / 4, tolerance = Math.PI / 2,
    density = 100, length = 10, inside = false, stipplingDensity = 20,
    weight = 1, weightRandomness = 0, constantLength = true, vanishingBands = 10,
    hatchingAngle = null, color = null) {

    if (!color) {
      color = this.color;
    }

    stroke(color);

    if (type == shadowType.full) {
      let shapeNoFill = this.noFill;
      this.noFill = false;
      let dir = 1;
      if (inside) {
        dir = -1;
      }
      this.drawInstantiate(false, this.position.copy().add(
        p5.Vector.fromAngle(angle).mult(length * dir)),
        this.scale, this.rotation,
        color, color, this.strokeWeight);

      this.noFill = shapeNoFill;
    }
    else if (type == shadowType.vanishing) {
      let shapeNoFill = this.noFill;
      this.noFill = false;
      let dir = 1;
      if (inside) {
        dir = -1;
      }
      let strk = this.noStroke;
      this.noStroke = true;
      for (let i = vanishingBands; i > 0; i--) {
        let clr = new Array(4);
        arrayCopy(color, clr);
        let offset = length * i / vanishingBands;
        clr[3] *= 1 - i / (vanishingBands + 1);
        this.drawInstantiate(false, this.position.copy().add(
          p5.Vector.fromAngle(angle).mult(offset * dir)),
          this.scale, this.rotation,
          clr, clr, this.strokeWeight);
      }
      this.noStroke = strk;
      this.noFill = shapeNoFill;
    }
    else {
      // retrieve the specified number of points to shade from
      let vtx = sample(this, density, true, false);

      if (weight <= 0) {
        weight = this.strokeWeight
      }

      let nrm;
      let alpha;
      let mod;
      let nu_pt;
      let dirToNextVtx;
      let dirToPrevVtx;
      let t;
      let x = createVector(1, 0);
      // set the direction to draw the shadow
      let nrmDir = 1;
      if (inside) {
        nrmDir = -1;
      }
      let shadowVec = p5.Vector.fromAngle(angle);
      if (hatchingAngle && type == shadowType.hatching) {
        shadowVec.rotate(hatchingAngle);
      }
      // for each seed point, check the normal and if within the shadow cone angle
      for (let i = 0; i < vtx.length; i++) {
        // retrieve the normal
        nrm = this.normalAtPoint(vtx[i], 0.1);

        // check if the nrm has the shadow's angle with horizontal line
        alpha = Math.acos(nrm.dot(x));
        if (nrm.y < 0) {
          alpha *= -1;
        }

        let diff = compareAngles(alpha, angle);

        if (diff <= tolerance) {
          if (type == shadowType.hatching) {
            if (constantLength) {
              mod = 1;
            }
            else {
              mod = 1 - diff / tolerance;
            }
            strokeWeight(weight + random(0, weightRandomness));
            drawLine(this.applyTransform(vtx[i]), this.applyTransform(
              vtx[i]).add(shadowVec.copy().mult(length * nrmDir * mod)));
          }
          else {
            // modulation due to angular distance to target shadow angle
            if (constantLength) {
              mod = 1;
            }
            else {
              mod = 1 - diff / tolerance;
            }

            // compute direction to next and previous vertex
            if (i == 0) {
              dirToPrevVtx = createVector(0, 0);
            }
            else {
              dirToPrevVtx = vtx[i - 1].position().sub(vtx[i]);
            }
            if (i == vtx.length - 1) {
              dirToNextVtx = createVector(0, 0);
            }
            else {
              dirToNextVtx = vtx[i + 1].position().sub(vtx[i]);
            }

            // draw many points scattered around
            for (let j = 0; j < stipplingDensity * mod; j++) {
              strokeWeight(weight + random(0, weightRandomness));
              nu_pt = this.applyTransform(vtx[i]);
              // set random normal position
              let t = random();
              nu_pt.add(shadowVec.copy().mult(length * nrmDir * mod * t));

              // set random position along direction to next vertex
              t = random(-1, 1);
              if (t >= 0) {
                nu_pt.add(dirToNextVtx.copy().mult(t));
              }
              else {
                nu_pt.add(dirToPrevVtx.copy().mult(t));
              }
              drawPoint(nu_pt);
            }
          }
        }
      }
    }
  }

  /**
   * Sets the shape's color
   * @param {Array.<number>} [contourColor] Color of the contour as an array of RGBA values in the range [0, 255].
   * If not specified this shape will have no contour.
   * @param {Array.<number>} [fillColor] Color of the fill as an array of RGBA values in the range [0, 255].
   * If not specified the shape will have no fill.
   */
  setColor(contourColor = null, fillColor = null) {
    if (contourColor) {
      this.color = contourColor;
      this.noStroke = false
    }
    else {
      this.noStroke = true;
    }
    if (fillColor) {
      this.fillColor = fillColor;
      this.noFill = false
    }
    else {
      this.noFill = true;
    }
  }


  /**
   * Sets the scale of the shape. If only x is specified,
   * a uniform scale will be used
   * @param {number} x Scale along the x axis. Will be used  as the
   * uniform scale if y is not specified
   * @param {number} [y] Scale along the y axis
   */
  setScaleFromScalar(x, y = null) {
    if (y) {
      this.scale = createVector(x, y);
    }
    else {
      this.scale = createVector(x, x);
    }
  }

  /**
   * Utility which prints the number of each vertex of the shape
   * next to it. This is designed mostly for debug purposes.
   */
  numberVertices() {
    let nrm = this.computeNormals();
    for (let i = 0; i < this.vertices.length - 1; i++) {
      drawText(i, this.applyTransform(
        this.vertices[i].position().add(
          nrm[i].copy().mult(10))));
    }

    if (!this.vertices[0].equals(
      this.vertices[this.vertices.length - 1])) {
      drawText(i, this.applyTransform(
        this.vertices[this.vertices.length - 1].position().add(
          nrm[this.vertices.length - 1].copy().mult(20))));
    }
  }


  /**
   * Returns a copy of  the specified vertex, which position has
   * been modified following this shape's transform (position, scale and rotation that is).
   * This allows to retrieve the position in world coordinates of a point form the position
   * in the  shape referential.
   * This method can also be used to transform a point as if it was a part
   * of a shape with a specified transform. This is useful for instantiating the shape for instance
   * @param {p5.Vector} vtx The point to apply the transform to.
   * @param {p5.Vector} [position] Offset to apply to the point.
   * If specified, the shape transform will be ignored.
   * @param {p5.Vector} [scale] Scale to apply to the point.
   * If not specified and `position` is, it will default to unit scale;
   * @param {number} [rotation] Rotation to apply to the point.
   * If not specified and `position` is, it will default to 0.
   * @returns {p5.Vector} The transformed point. Note that because of the way the computation is done,
   * classes which extend `p5.Vector` may be passed as argument as  well, as long  as  they implement
   * the `copy` method, and usual vector arithmetics (this is the case of `Fresco.Point` and
   * `Fresco.Particle` for instance). In this case the return type will be  the same
   * as the input type.
   */
  applyTransform(vtx, position = null, scale = null, rotation = null) {
    if (position) {
      if (!scale) {
        scale = createVector(1, 1);
      }
      if (!rotation) {
        rotation = 0;
      }
    }
    else {
      position = this.position;
      rotation = this.rotation;
      scale = this.scale;
    }

    let nu_vtx = vtx.copy();
    let z_buff = nu_vtx.z;
    if (nu_vtx !== 0) {
      nu_vtx.z = 0;
    }
    nu_vtx.rotate(rotation);
    nu_vtx.z = z_buff;
    nu_vtx.mult(scale);
    nu_vtx.add(position);

    return nu_vtx;
  }


  //
  /**
   * Freeze the transform of the shape into its vertices. This is to say that the current transform will be applied
   * to each vertex and then reset.
   */
  freezeTransform() {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] =
        this.applyTransform(this.vertices[i]);
      this.vertices[i].rotation += this.rotation;
    }
    this.rotation = 0;
    this.position = createVector(0, 0);
    this.scale = createVector(1, 1);
    this.updateLengths = true;
  }


  // Returns the bounding box (defined as the bottom
  // left and top right corner points position in world coordinates). It will recompute it only if needed.
  /**
   * Returns the bounding box (defined as the bottom left and top
   * right corner points position in world coordinates).
   * It will recompute it only if needed.
   * Because of this last statement,  we may have missed so cases where recomputation is required.
   * Should you run in such case,  please report it so  that we can fix  it accordingly
   * @returns {Array.<p5.Vector>} Position of  the top left  and  bottom right  corners
   */
  getBoundingBox() {
    let xs = [];
    let ys = [];
    for (let i = 0; i < this.vertices.length; i++) {
      let vtx = this.applyTransform(this.vertices[i]);
      xs.push(vtx.x);
      ys.push(vtx.y);
    }
    this.boundingBox = [createVector(min(xs), min(ys)), createVector(max(xs), max(ys))]

    return this.boundingBox;
  }


  /**
   * Checks whether the  shape is closed, that is if the first and  last point are
   * @returns {boolean} True if the  shape is closed
   */
  isClosed() {
    return this.vertices[0].equals(
      this.vertices[this.vertices.length - 1]) && this.vertices.length > 1;
  }


  /**
   * Returns the control point  defining an edge starting at a given vertex.
   * In the case where the shape is polygonal, the edge is a line and
   * this returns the 2 end vertices of the line.
   * If  the shape isn't polygonal, this returns the point before the edge start vertex,
   * the vertex  itself, and  the next to one. Should the first or last vertex extend out of the
   * vertex array, they will be  dealt with accordingly. If the shape is open, the very first and
   * very last vertices of the shape are repeated. Otherwise the next vertex in  the shape
   * (that is reading the vertices array as a circular buffer) is returned.
   * @param {number} idx Index of the vertex the  shape starts at.
   * @returns {Array.<Fresco.Point>} Reference to the edge control points
   */
  controlPoints(idx) {
    if (this.isPolygonal) {
      let p0 = this.vertices[idx];
      let p1;
      if (idx + 1 > this.vertices.length - 1) {
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
        throw "Cannot provide sdrawLine control points starting from last vertex";
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


  /**
   * Returns the length of an edge. If the index passed is the last one,
   * it will return the distance of the hypothetic edge to the first vertex,
   * no matter if the shape is closed or not.
   * Note that the length is in world units (meaning all transforms have been applied)
   * @param {number} startIdx Index of the vertex at the start of the edge.
   * @param {number} resolution In the case of a non polygonal shape, there is no explicit
   * expression for computing the length of a 2D spline. We thus use a discrete integration,
   * splitting the contour in the specified amount of small lines.
   * @returns {number} Length of the edge
   */
  edgeLength(startIdx, resolution = 100) {
    if (this.isPolygonal) {
      let [p0, p1, p2, p3] = this.controlPoints(startIdx);
      return p1.copy().sub(p0).mag();
    }
    else {
      let [p0, p1, p2, p3] = this.controlPoints(startIdx);
      let [a, b, c, d] = catmullRom(this.applyTransform(p0),
        this.applyTransform(p1),
        this.applyTransform(p2),
        this.applyTransform(p3));
      const dt = 1 / resolution;
      let t = 0;
      let l = 0;

      // We discretize the integration by taking resolution points along
      // the sdrawLine and drawing lines between them
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

  //
  /**
   * Computes the total length of the shape's
   * contour in world scale. The computation will only
   * be performed when an update is required.
   * Because of this last statement,  we may have missed so cases where recomputation is required.
   * Should you run in such case,  please report it so  that we can fix  it accordingly.
   * @returns {number} Total length in world referential of the shape's contour.
   */
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

  /**
   * Computes the position of a point at specified percentage of a given edge's length.
   * @param {number} interp  Percentage of the edge at which to compute point position
   * @param {number} edgeIdx Index of the starting vertex of the edge
   * @param {number} resolution In the case where the shape is not polygonal, we will use
   * a discrete integration
   * to find the point position, because there is no exact expression  to compute it.
   * This is the number of small segments to divide the edge into for the integration.
   * @param {boolean} approx If true, the position is  approximated  by the spline equation
   * evaluated at the specified percentage of the edge. In the general case, this will be
   * somewhat different from the point at the specified percentage of the length of the contour.
   * This is however much faster to compute, and is recommended for application where the actual
   * position does not really matter, such as random point scattering for instance.
   * @param {boolean} world Whether the point position should be returned in the world or
   * shape referential
   * @returns {Fresco.Point} Point at specified percentage of the contour length
   */
  edgeInterpolation(interp, edgeIdx, resolution = 100,
    approx = false, world = true) {
    if (edgeIdx > this.vertices.length - 1) {
      throw "Cannot interpolate edge starting at last point (or more) of shape";
    }

    if (this.isPolygonal) {
      // simple linear interpolation
      let l = edgeIdx + 1;
      if (l > this.vertices.length - 1) {
        if (this.isClosed()) {
          l = 0;
        }
        else {
          throw "Cannot interpolate from last vertex in open shape";
        }
      }

      let pt = this.vertices[edgeIdx].copy().mult(1 - interp).add(
        this.vertices[l].position().mult(interp));
      if (world) {
        return this.applyTransform(pt);
      }
      else {
        return pt;
      }
    }
    else {
      //for a sdrawLine there is no exact expression. Instead we integrate the
      // edge length until we reach the desired value
      let [p0, p1, p2, p3] = this.controlPoints(edgeIdx);

      // For non uniform scales, deducing the transformed sdrawLine edge length
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
        // the sdrawLine and drawing lines between them
        let a2 = d;
        let a1;
        for (let t = 0; t < 1; t += dt) {
          a1 = a2.copy();
          // compute next point
          a2 = a.copy().mult(t * t * t).add(
            b.copy().mult(t * t)).add(
              c.copy().mult(t)).add(d);
          l += (a1.copy().sub(a2)).mag();
          if (l / this.edgeLengths[edgeIdx] >= interp) {
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


  /**
   * Converts a point coordinates (in vector form)
   * to the shape local coordinate system
   * @param {p5.Vector} pt Point to compute the local coordinates of
   * @returns {p5.Vector} Point coordinates the local coordinate system.
   * The function also supports classes that extend `p5.Vector` as long as they
   * implement vector arithmetic functions and the `copy` method. The return will
   * be of the same type
   */
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


  /**
   * Sets the center of rotation as the center of the boundingBox
   */
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


  /**
   * Retrieve the normal at a given point along the contour.
   *
   * To do so we first need to  find, where the point is on  the edge. To do so, we do a
   * simple line-point intersection test in the polygonal case.
   * For the non-polygonal case, each edge will be sudvided in smaller segments,
   * untill one of such segments end, is either close enough to the specified point
   * or the max resolution is reached. This is  done this way because of numerical issues
   * which may make it so a point may only ALMOST be on  the spline but not completely.
   * In turn, this means that solving the spline equation for the point intersetcion will yield
   * no solution. The adopted dichotomic solution  allows for a small distance espilon to exist
   * between the  point and the line.
   *
   * The normal itself is taken as the orthogonal to the tangent at the found point, and is oriented
   * depending on whether the shape is described in a clockwise fashion, to always face outwards.
   * @param {p5.Vector} pt Point in SHAPE's coordinate
   * @param {number} [epsilon] Distance tolerance in the distance of the point to the edge to
   * consider it is actually on the edge. If not specified, a value of 0.1 is taken for non polygonal shapes,
   * and 1e-3 for polygonal ones. In most cases this should result in acceptable tolerance values.
   * @param {number} [resolution] Maximum number of subdivisions for a spline edge. Because we add 2
   * points by sub-edge each iteration, it is  recommended to uses a power of 2.
   * @returns {p5.Vector} Normal to the shape's contour at the specified poitn
   */
  normalAtPoint(pt, epsilon = null, resolution = 128) {
    if (!epsilon) {
      if (this.isPolygonal) {
        epsilon = 1e-3;
      }
      else {
        epsilon = 1e-1;
      }
    }

    let [projection, closest_edge_idx, percentage, closest_dist] = this.projectOnShape(pt, resolution);

    if (closest_dist > epsilon) {
      console.log("[in normalAtPoint] Some error may have " +
        "occured as the specified point was not found to belong to the shape");
    }

    if (this.isPolygonal) {
      let edge = this.vertices[closest_edge_idx + 1].position().sub(this.vertices[closest_edge_idx]);
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
    else {
      // retrieve the edge spline equation coefficients
      [a, b, c, d] = catmullRom(...this.controlPoints(closest_edge_idx));

      let tangent = a.mult(3 * percentage * percentage).add(
        b.mult(2 * percentage)).add(c).normalize();
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


  /**
   * Projects a point the shape. This is not a "true" projection. A more accurate description would
   * be that this method finds the closest point on the shape. This is because we project on each edge
   * and keep the closest egde. The subtelty is that if the projection is not actually on the edge
   * (but further along the edge direction), we'll cap to the edge limits.
   *
   * Warning: Thi signores the shape's transform
   * @param {Fresco.Point} pt Point to project
   * @param {number} resolution Resolution for the distance estimation
   * @returns {Array<p5.Vector, number, number, number>} Projection, Index of the closest edge,
   * Percentage along the edge where the point is, Distance from the projection to the point
   */
  projectOnShape(pt, resolution = 128) {
    let closest_edge_idx = 0;
    let closest_dist = Number.MAX_VALUE;
    let projection;
    let percentage;
    // project on each edge, and keep the closest projection
    if (this.isPolygonal) {
      for (let i = 0; i < this.vertices.length - 1; i++) {
        // project on line
        let edge = this.vertices[i + 1].position().sub(this.vertices[i]);
        let dirToPoint = pt.copy().sub(this.vertices[i]);
        let proj_dist = edge.dot(dirToPoint);
        let projPercentage = proj_dist / edge.magSq();
        let proj_pt;
        // restrict projection to segment
        if (projPercentage <= 1) {
          if (projPercentage >= 0) {
            proj_pt = edge.copy().mult(projPercentage).add(this.vertices[i]);
          }
          else {
            projPercentage = 0;
            proj_pt = this.vertices[i].position();
          }
        }
        else {
          projPercentage = 1;
          proj_pt = this.vertices[i + 1].position();
        }
        let orthogonal = dirToPoint.sub(proj_pt);
        let distSq = orthogonal.magSq();

        if (distSq < closest_dist) {
          closest_edge_idx = i;
          closest_dist = distSq;
          projection = proj_pt;
          percentage = projPercentage;
        }
      }
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
      for (let i = 0; i < this.vertices.length - 1; i++) {
        // retrieve the edge spline equation coefficients
        [a, b, c, d] = catmullRom(...this.controlPoints(i));

        t0 = 0;
        t1 = 1;
        // we proced by simple dichotomy. We stop early if one the points is already within the tolerance threshold
        for (j = 1; Math.pow(2, j) <= resolution; j++) {
          // compute the position of the first and 2nd thirds of the sub sdrawLine
          t00 = t0 + (t1 - t0) / 3;
          t01 = t0 + 2 * (t1 - t0) / 3;
          p1 = a.copy().mult(t00 * t00 * t00).add(b.copy().mult(
            t00 * t00)).add(c.copy().mult(t00)).add(d);
          p2 = a.copy().mult(t01 * t01 * t01).add(b.copy().mult(
            t01 * t01)).add(c.copy().mult(t01)).add(d);

          // move the bounds such that we restrict the splineine to the closest half
          if (distSquared(pt, p1) <= distSquared(pt, p2)) {
            t1 = (t1 + t0) * 0.5;
          }
          else {
            t0 = (t1 + t0) * 0.5;
          }
        }

        dist = distSquared(pt, p1);
        if (dist < closest_dist) {
          closest_dist = dist;
          projection = p1;
          percentage = t0;
          closest_edge_idx = i;
        }
      }
    }

    closest_dist = Math.sqrt(closest_dist);
    return [projection, closest_edge_idx, percentage, closest_dist];
  }


  /**
   * Computes the normals to each vertex in local coordinates.
   * If the shape is open, the first and last points will use the only
   * connected edge to compute the normal, otherwise the computation will
   * consider both connected edges (in the non polygonal case this does not make
   * any difference though, as the shape is supposed to have a continuous curvature).
   * @returns {Array.<p5.Vector>} Normals at each vertex of the shape
   */
  computeNormals() {
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
      if (i == 0 && this.isClosed()) {
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
      nu_nrm = createVector(0, 0);
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

      if (this.isPolygonal) {
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

    // Fresco.Shapes may be numbered clockwise or anticlockwise.
    // if the shape is clockwise we reverse the normals
    if (this.isClockwise()) {
      for (let i = 0; i < nrm.length; i++) {
        nrm[i].mult(-1);
      }
    }
    return nrm;
  }


  /**
   * Computes whether the shape is described in a clockwise fashion.
   * This is achieved by computing the winding number relative to the center
   * of the bounding box. Note that this method does not check whether the shape
   * is closed. The resulting boolean will indeed only make sense in the case the
   * shape actually is.
   * @returns {boolean} True is the shape is described in a clockwise fashion
   */
  isClockwise() {
    this.getBoundingBox();
    let center = this.boundingBox[0].copy().add(this.boundingBox[1]).mult(0.5);
    let buffer = [];
    this.vertices.forEach(v => {
      buffer.push(this.applyTransform(v));
    })
    let winding_nb = windingNumber(center, buffer)
    // wounding_nb is positive when the shae is counter clockwise
    return winding_nb < 0;
  }


  // return a deep copy of the
  /**
   * Returns a "deep-copy" of the shape. This is done manually to avoid
   * cyclic dependencied issue with the vertices when using JSON
   * Serialization-Desrialization.
   * @returns {Fresco.Shape} Deep-copy of this shape, meaning the resulting shape
   * can  me modified in any way
   * wanted without fear of interfering with this one. Even the  vertices are
   * deep-copied and can be altered at will.
   */
  copy() {
    // ugly but avoids cyclic references with JSON deserialization
    let vertexCopy = [];
    for (let i = 0; i < this.vertices.length; i++) {
      append(vertexCopy, this.vertices[i].copy());
    }
    let nu_shape = new Fresco.Shape(vertexCopy);
    nu_shape.isPolygonal = this.isPolygonal;
    nu_shape.position = this.position.copy();
    nu_shape.rotation = this.rotation;
    nu_shape.scale = this.scale.copy();
    arrayCopy(this.color, nu_shape.color);
    arrayCopy(this.fillColor, nu_shape.fillColor);
    nu_shape.noStroke = this.noStroke;
    nu_shape.noFill = this.noFill;
    nu_shape.strokeWeight = this.strokeWeight;
    nu_shape.layer = this.layer;

    return nu_shape;
  }

  /**
   * Provided another shape, returns a list of all the intersection points with the other shape
   * @param {Freco.Shape} shape
   * @returns {Array<*>}An array of {this_idx, other_idx, point} object literals where the index is that of the intersecting edge
   * (this shape first then the other shape)
   */
  getIntersectionsPoints(shape) {
    if (!shape.isPolygonal || !this.isPolygonal) {
      throw 'path finding is not supported for non polygonal shapes'
    }

    // retrieve all intersection points
    let intersections = [];
    for (let i = 0; i < this.vertices.length - 1; i++) {
      for (let j = 0; j < shape.vertices.length - 1; j++) {
        let inter = segmentIntersection(
          this.applyTransform(this.vertices[i]), this.applyTransform(this.vertices[i + 1]),
          shape.applyTransform(shape.vertices[j]), shape.applyTransform(shape.vertices[j + 1])
        );
        if (inter != false) {
          intersections.push({ this_idx: i, other_idx: j, point: inter.copy() });
        }
      }
    }

    return intersections;
  }


  /**
   * Sort interestions returned by getIntersectionsPoints, such that they
   * appear in contour order
   * @param {*} intersections
   */
  sortIntersections(intersections) {
    let buffer = [];
    let idx = 0;

    while (intersections.length > 0) {
      let subBuffer = [];

      // get idx of first intersected edge
      idx = intersections[0].this_idx;

      // collect buffer corresponding to intersections on one segment
      while (intersections.length > 0 && intersections[0].this_idx == idx) {
        subBuffer.push(intersections.shift());
      }

      // sort sub buffer
      subBuffer.sort((A, B) => {
        let vecA = createVector(0, 0);
        let vecB = createVector(0, 0);
        vecA.x = this.vertices[A.this_idx].x - A.x;
        vecA.y = this.vertices[A.this_idx].y - A.y;
        vecB.x = this.vertices[A.this_idx].x - B.x;
        vecB.y = this.vertices[A.this_idx].y - B.y;
        return vecA.magSq() - vecB.magSq();
      })

      // add sorted sub buffer to main buffer
      buffer = buffer.concat(subBuffer);
    }

    return buffer;
  }

  /**
   * Returns an array of shapes corresponding to individual parts of the contour in between intersections.
   * Intersections should be formatted to match the return of the getIntersectionsPoints function, that is a an array of object literals
   * {this_idx, other_idx, point}.
   * @param {*} intersections
   * @returns {Array<Shape>} Split contour
   */
  splitShape(intersections) {
    if (intersections.length == 0) {
      return [this.copy()];
    }
    let subShapes = [];
    let prev_idx = 0;
    let prev_inter = null;

    intersections.forEach(inter => {
      let vtxBuff = [];
      if (inter.this_idx >= prev_idx) {
        // get all points within 2 intersections
        vtxBuff = this.vertices.slice(prev_idx, inter.this_idx + 1);
        // add intersection at the end
        vtxBuff.push(inter.point);
        // if not the first intersection, add the previous intersection at the start
        if (prev_idx != 0) {
          vtxBuff.unshift(prev_inter.copy());
        }
      }
      else {
        // if this intersections idx is smaller than the prev_idx this means the intersection
        // is on the same edge as the previous intersection
        vtxBuff = [prev_inter.copy(), inter.point];
      }
      // create a new shape from the vtx buffer and add it to the sub shapes array
      subShapes.push(new Fresco.Shape(vtxBuff));
      // update intermediaries
      prev_inter = inter.point.copy();
      prev_idx = inter.this_idx + 1;
    });

    // Add the remaining points as either a separate shape if the shape is open,
    // or as part as the first sub-shape if it is closed
    if (this.isClosed()) {
      let vtxBuff = this.vertices.slice(prev_idx, this.vertices.length - 1);
      subShapes[0].vertices.forEach(vtx => vtxBuff.push(vtx));
      subShapes[0].vertices = vtxBuff;
      subShapes[0].vertices.unshift(prev_inter.copy());
    }
    else {
      let vtxBuff = [];
      vtxBuff = this.vertices.slice(prev_idx, this.vertices.length);
      vtxBuff.unshift(prev_inter.copy());
      subShapes.push(new Fresco.Shape(vtxBuff));
    }

    return subShapes;
  }


  /**
   * Subtract the specified shape from this one. As of now, this will remove the overlapped parts entirely,
   * not even leaving a contour.
   * @param {Fresco.Shape} shape Shape to subtract to this one
   */
  subtract(shape) {
    if (!shape.isPolygonal || !this.isPolygonal) {
      throw 'path finding is not supported for non polygonal shapes'
    }

    this.freezeTransform();

    // if the other shape is not closed, then the boolean should return the original shape
    if (!shape.isClosed()) {
      return [this];
    }

    // retrieve all intersection points
    let intersections = this.getIntersectionsPoints(shape);

    // sort intersections to ensure they are in order along the contour
    intersections = this.sortIntersections(intersections);

    // debug draw the intersection points
    let interIdx = 0;
    intersections.forEach(inter => {
      inter.point.radius = 10
      inter.point.color = [255, 0, 0]
      inter.point.draw()
      strokeWeight(5)
      stroke(255)
      drawText(interIdx, inter.point.copy().add(createVector(10, 0)));
      interIdx += 1
    })

    // split the shape in many sub contours
    let subShapes = this.splitShape(intersections);

    // // debug draw subshapes
    // let idx = subShapes.length + 1
    // subShapes.forEach(s => {
    //   s.setColor([random() * 255, random() * 255, random() * 255]);
    //   s.strokeWeight = idx;
    //   s.draw();
    //   print(s.vertices);
    //   idx - 1;
    // })
    // print(subShapes.length);

    // Save only contours that are outside the other shape
    let remainingShapes = [];
    subShapes.forEach(s => {
      let isIn = false;
      // if there are only 2 vertices we check the midpoint
      if (s.vertices.length == 2) {
        let midPoint = s.vertices[0].copy().add(s.vertices[1]).mult(0.5);
        isIn = isInside(midPoint, shape, true);
      }
      else {
        // else we take a random point
        isIn = isInside(s.vertices[1], shape, true);
      }

      if (!isIn) {
        remainingShapes.push(s);
      }
    });

    // // debug draw remainingShapes
    // remainingShapes.forEach(s => {
    //   s.setColor([random() * 255, random() * 255, random() * 255]);
    //   s.draw();
    //   print(s.vertices);
    // })
    // print(remainingShapes.length);

    if (remainingShapes.length > 0) {
      remainingShapes[0].isPolygonal = true;
      return mergeContours(remainingShapes);
    }
    else {
      return [];
    }
  }

  /**
   * Invert operation of the subtract path finding operation.
   * Will only leave the contours inside of the specified shape visible
   * @param {Fresco.Shape} shape
   * @returns {Array<Fresco.Shape>} Resulting contours from the original clipped shape
   */
  clip(shape) {
    if (!shape.isPolygonal || !this.isPolygonal) {
      throw 'path finding is not supported for non polygonal shapes'
    }

    this.freezeTransform();

    // if the other shape is not closed, then the boolean should return the original shape
    if (!shape.isClosed()) {
      return [this];
    }

    // retrieve all intersection points
    let intersections = this.getIntersectionsPoints(shape);

    // split the shape in many sub contours
    let subShapes = this.splitShape(intersections);

    // Save only contours that are outside the other shape
    let remainingShapes = [];
    subShapes.forEach(s => {
      let isIn = false;
      // if there are only 2 vertices we check the midpoint
      if (s.vertices.length == 2) {
        let midPoint = s.vertices[0].copy().add(s.vertices[1]).mult(0.5);
        isIn = isInside(midPoint, shape, true);
      }
      else {
        // else we take a random point
        isIn = isInside(s.vertices[1], shape, true);
      }

      if (isIn) {
        remainingShapes.push(s);
      }
    });

    remainingShapes[0].isPolygonal = true;
    return mergeContours(remainingShapes);
  }

  /**
   *
   * @param {number} angle angle of the hatching
   * @param {number} interline spacing of the lines (must be positive)
   * @param {boolean} approx=true consider the shape is polygonal no matter what
   * @returns {Array<Fresco.Shape>} Hatching lines
   */
  hatchFill(angle, interline, approx = true) {
    // if (!this.isPolygonal) {
    //   throw 'hatch fill not yet supported for non polygonal shapes'
    // }

    // make sure the angle is positive to avoid issues down the line
    angle = (angle + 2 * Math.PI) % (2 * Math.PI);
    // line direction is periodic of period PI
    angle = angle % Math.PI;

    if (interline <= 0) {
      throw 'Hatching interline must be strictly positive'
    }

    // init a hatch line at the bottom left hand corner of the
    // bounding box with specified angle, if angle below 90deg,
    // then we take the bottom right hand corner
    let direction = p5.Vector.fromAngle(angle);
    let orthogonal = createVector(-direction.y, direction.x).mult(interline);
    let bounds = this.getBoundingBox();
    let origin = bounds[0];
    if (angle < Math.PI / 2) {
      origin.x = bounds[1].x;
    }
    else if (angle == Math.PI / 2) {
      direction = createVector(0, 1);
      orthogonal = createVector(interline, 0);
    }
    else {
      orthogonal.mult(-1);
    }

    // make sure we don't start at the corner which could create issues
    origin.sub(orthogonal.copy().mult(0.5));

    // for each hatch line, compute the intersections with the shape, and then
    // join the intersections 2 by 2, in order. If there is an odd number of intersections,
    // means one at least is tangential, which will create issues. For now we'll simply
    // add a 1% offset to the hatch line in this case, which should be invisible and much faster
    // than detecting which intersection is tangential.
    let lines = [];
    let prev_intersection = false;
    let done = false;

    let isPolygonal = this.isPolygonal;
    if (approx) {
      this.isPolygonal = true;
    }

    while (!done) {
      // compute all intersections along the hatch line
      let intersections = [];
      for (let i = 0; i < this.vertices.length - 1; i++) {
        if (this.isPolygonal) {
          let [p0, p1] = this.controlPoints(i);
          let inter = lineSegmentIntersection(
            origin, direction, this.applyTransform(p0), this.applyTransform(p1), true);
          if (inter.length > 0) {
            intersections.push(inter);
          }
        }
        else {
          let [p0, p1, p2, p3] = this.controlPoints(i);
          intersections = intersections.concat(
            lineSplineIntersection(
              origin, direction, this.applyTransform(p0), this.applyTransform(p1),
              this.applyTransform(p2), this.applyTransform(p3), true)
          );
        }
      }
      // if there is an even number of intersections, proceed.
      if (intersections.length % 2 == 0) {
        // if there previously was an intersection and there no longer is,
        // this means we are done scanning the shape
        if (intersections.length == 0 && prev_intersection) {
          done = true;
        }
        else {
          // sort intersections by interpolent
          intersections.sort((a, b) => {
            return a[a.length - 1] - b[b.length - 1];
          });

          // create lines in between intersections
          for (let i = 0; i < intersections.length / 2; i++) {
            lines.push(new Fresco.Line(intersections[2 * i][0], intersections[2 * i + 1][0]));
          }

          // move the hatch line one step
          origin.add(orthogonal);

          // mark this intersection test as valid
          if (intersections.length > 0) {
            prev_intersection = true;
          }
        }
      }
      else {
        print('meh')
        // simply offset the hatch line by 1% to avoid the tangential intersections
        origin.add(orthogonal.copy().mult(0.01));
      }
    }

    this.isPolygonal = isPolygonal;
    lines.forEach(l => {
      l.layer = this.layer;
    })
    return lines;
  }

  /**
   * Turn the shape into a polygonal one. If the shape is already polygonal, nothing wil happen.
   * If the shape isn't, each spline will be split in a set number of segments.
   * @param {number} resolution=10 Number of splits that will be made for each segment
   */
  poligonize(resolution = 10) {
    if (this.isPolygonal) {
      return
    }
    let buffer = [];
    let inv_res = 1 / resolution;
    let splits = [];
    for (let i = 0; i < resolution; i++) {
      splits.push(inv_res * i);
    }
    for (let i = 0; i < this.vertices.length - 1; i++) {
      let [p0, p1, p2, p3] = this.controlPoints(i);
      let [a, b, c, d] = catmullRom(p0, p1, p2, p3);

      splits.forEach(t => {
        buffer.push(((a.copy().mult(t).add(b)).mult(t).add(c)).mult(t).add(d))
      });
    }
    buffer.push(this.vertices[this.vertices.length - 1]);

    this.vertices = buffer;
    this.isPolygonal = true;
  }
}

/**
 * Creates a Fresco.Shape from some json data
 * @param {*} json_dict data loaded from a json file
 * @param {boolean} apply_scale=true If true, the points will be
 * rescaled by the canvas size specified in the file
 */
function shapeFromJSON(json_dict, apply_scale = true) {
  vtxBuffer = []
  for (let v in json_dict['vertices']) {
    let x = json_dict['vertices'][v]['x'];
    let y = -json_dict['vertices'][v]['y'];
    if (apply_scale) {
      x *= json_dict['canvas_width'];
      y *= json_dict['canvas_height'];
    }
    vtxBuffer.push(createPoint(x, y));
  }

  let s = new Fresco.Shape(vtxBuffer);
  s.isPolygonal = json_dict['isPolygonal'];
  s.ignoreEnds = json_dict['ignoreEnds'];

  if ('layer' in json_dict) {
    s.layer = json_dict['layer'];
  }
  else {
    s.layer = 0;
  }

  return s;
}


/**
 * Class describing a collection of geometric objects
 * in the Fresco namespace. This collection has a transform of its own which
 * can be used to modify multiple objects at once in a rigid body fashion
 * (meaning they will keep  their scale , position and  rotation relative to one another).
 * @class
 */
Fresco.Collection = class {
  /**
   * @constructor
   * @property {p5.Vector} scale=1,1 - Scale of the geometry collection
   * @property {number} rotation=0 - Rotation of the geometry collection
   * @property {p5.Vector} position=0,0 - Position of the geometry collection
   * @property {Array.<*>} objects Objects in the collection. These must be in the Fresco
   * namespace and implement the `draw` function as well have a transform of their own.
   * @property {Array.<number>} objectsRotation Rotation of the individual objects of the collection relative to the collection itself
   * @property {Array.<p5.Vector>} objectsScale Scale of the individual objects of the collection relative to the collection itself
   * @property {Array.<p5.Vector>} objectsPosition Position of the individual objects of the collection relative to the collection itself
   */
  constructor() {
    this.scale = createVector(1, 1);
    this.rotation = 0;
    this.position = createVector(0, 0);
    this.objects = [];
    this.objectsRotation = []; //stores the initial rotation of the objects
    this.objectsScale = []; //stores the initial scale of the objects
    this.objectsPosition = []; //stores the initial position of the objects
  }

  /**
   * Draws all objects. Every object must have a `draw` method of its own.
   */
  draw() {
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].draw();
    }
  }

  /**
   * Set the position of the Geometry.
   * Use this method rather than setting `this.position`,
   * as this will propagate
   * the position change to the underlying objects
   * @param {p5.Vector} position
   */
  setPosition(position) {
    this.position = position;
    this.setObjectsTransform();
  }

  /**
   * Set the rotation of the Geometry.
   * Use this method rather than setting `this.rotation`,
   * as this will propagate
   * the position change to the underlying objects
   * @param {number} rotation
   */
  setRotation(rotation) {
    this.rotation = rotation;
    this.setObjectsTransform();
  }

  /**
   * Set the scale of the Geometry.
   * Use this method rather than setting `this.scale`,
   * as this will propagate
   * the position change to the underlying objects
   * @param {p5.Vector} scale
   */
  setScale(scale) {
    this.scale = scale;
    this.position.mult(scale);
    this.setObjectsTransform();
  }

  /**
   * Applies this Geometry collection's transform to its objects
   */
  setObjectsTransform() {
    for (let i = 0; i < this.objects.length; i++) {
      // set rotation
      this.objects[i].setRotation(this.objectsRotation[i] + this.rotation);
      // set scale
      this.objects[i].setScale(this.objectsScale[i].copy().mult(this.scale));
      // set position using this scale, rotation and position
      let newPos = this.objectsPosition[i].copy().mult(this.scale);
      newPos.rotate(this.rotation);
      newPos.add(this.position);
      this.objects[i].setPosition(newPos);
    }
  }

  freezeTransform() {
    this.position = createVector(0, 0);
    this.rotation = 0;
    this.scale = createVector(1, 1);
    for (let i = 0; i < this.objects.length; i++) {
      let o = this.objects.shift();
      this.objectsPosition.shift();
      this.objectsRotation.shift();
      this.objectsScale.shift();
      this.attach(o);
    }
  }

  /**
   * Attaches a new object to this geometry.
   * This will also automatically compute the
   * transform of the new object relative to this
   * Geometry and store it.
   * @param {object} object Object in the Scatter namespace
   * to attach to this Geometry
   */
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

  /**
   * Removes all references to the specified object
   * in this Geometry and returns the object
   * @param {number} objectIdx Index of the object to detach
   */
  detach(objectIdx) {
    // remove the original transform references
    this.objectsPosition.splice(objectIdx, 1);
    this.objectsScale.splice(objectIdx, 1);
    this.objectsRotation.splice(objectIdx, 1);

    // remove the object from this geometry and return it
    return this.objects.splice(objectIdx, 1);
  }

  /**
   * Serialize the collection. Points will be converted to shapes
   * containing a unique point.
   * @returns {Array<string>} An array of serialized shapes
   */
  toJSON() {
    let buffer = []
    this.objects.forEach(obj => {
      // Serialize object
      let jsonObj = obj.toJSON();

      // If the object was a point, it should have a key named x.
      // In this case, return as a single vertex shape
      if ('x' in jsonObj) {
        jsonObj = (new Shape([obj])).toJSON();
      }

      // Add serialized object to buffer
      buffer.push(jsonObj);
    });
    return buffer;
  }


  toShapes() {
    let buffer = []
    this.objects.forEach(obj => {
      // Serialize object
      let jsonObj = obj.toJSON();

      // If the object was a point, it should have a key named x.
      // In this case, return as a single vertex shape
      if ('x' in jsonObj) {
        buffer.push(new Shape([obj]));
        buffer[buffer.length - 1].layer = obj.layer
      }
      else {
        buffer.push(obj);
      }
    });
    return buffer;
  }

  copy() {
    let newCollection = new Fresco.Collection();
    newCollection.position = this.position.copy();
    newCollection.rotation = this.rotation;
    newCollection.scale = this.scale.copy();
    this.objects.forEach(o => newCollection.attach(o.copy()));
    return newCollection;
  }
}


/**
 * Perfoms a deep copy of an object. This will play poorly with cyclic dependencies.
 * Use at your own risks
 * @param {*} obj Object to copy
 * @returns {*} Deep copy of the input  object
 */
function deepcopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}


/**
 * A class representing a line
 * @class
 * @extends Fresco.Shape
 */
Fresco.Line = class extends Fresco.Shape {
  /**
   * @constructor
   * @param {p5.Vector} pt1 First extremity Point
   * @param {p5.Vector} pt2 Second extremity Point
   * @param {number} resolution number of points subdividing the
   * line (min 2, the extremities).
   */
  constructor(pt1, pt2, resolution = 2) {
    if (resolution < 2) {
      throw "A line should at least have 2 points"
    }
    super([]);
    let t = 0;
    const incr = 1 / (resolution - 1);
    // add resolution points
    for (let i = 0; i < resolution; i++) {
      this.vertices.push(createPoint(
        pt1.x * (1 - t) + pt2.x * t,
        pt1.y * (1 - t) + pt2.y * t,
        pt1.z * (1 - t) + pt2.z * t));
      t += incr;
    }
    this.isPolygonal = true;
  }
}


/**
 * Class representing a sphere as a collection of splines
 * @class
 * @extends Fresco.Shape
 */
Fresco.Circle = class extends Fresco.Shape {
  /**
   * @constructor
   * @param {number} radius Radius  of the circle in pixels
   * @param {number} resolution Number of vertices
   * @property {number} radius Radius of the circle
   * which describe the circle
   */
  constructor(radius = 50, resolution = 24) {
    super([]);
    this.radius = radius;
    this.resetResolution(resolution);
  }

  /**
   * Allows to change the sphere resolution on the fly.
   * WARNING: this will reset point positions
   * @param {number} resolution New number of points
   */
  resetResolution(resolution) {
    const angleIncr = 2 * PI / resolution;
    let angle = 0;
    for (let i = 0; i < resolution; i++) {
      append(this.vertices,
        createPoint(this.radius * cos(angle), this.radius * sin(angle)));
      angle += angleIncr;
      this.vertices[i].owner = this;
    }
    append(this.vertices, createPoint(this.radius, 0));
    this.vertices[this.vertices.length - 1].owner = this;
    this.updateLengths = true;
  }
}

/**
 * Class describing an Arc from a collection of splines.
 * By default the arc faces downwards and is centered on the vertical center line
 */
Fresco.Arc = class extends Fresco.Shape {
  /**
   * @constructor
   * @param {number} angle Arc angle in radians
   * @param {number} radius Radius of the arc in pixels
   * @param {number} resolution Number of points along the arc
   * @param {number} close Whether to close the arc or not, linking the last
   * point to the first
   */
  constructor(angle = Math.PI, radius = 50, resolution = 12, close = false) {
    super([]);
    this.radius = radius;
    const angleIncr = angle / (resolution - 1);
    let theta = - angle * 0.5 - PI / 2; //center the arc on the bottom vertical
    for (let i = 0; i < resolution; i++) {
      append(this.vertices,
        createPoint(radius * cos(theta), radius * sin(theta)));
      theta += angleIncr;
      this.vertices[i].owner = this;
    }
    if (close) {
      this.vertices.push(this.vertices[0]);
      this.vertices[this.vertices.length - 1].owner = this;
    }
  }
}


/**
 * Rectangle shape, centered
 * @extends Fresco.Shape
 */
Fresco.Rect = class extends Fresco.Shape {
  /**
   * @contructor
   * @param {number} w Width in pixels
   * @param {number} h Height in pixels
   */
  constructor(w = 100, h = 50) {
    let vertices = [];
    append(vertices, createPoint(-w / 2, -h / 2));
    append(vertices, createPoint(-w / 2, h / 2));
    append(vertices, createPoint(w / 2, h / 2));
    append(vertices, createPoint(w / 2, -h / 2));
    append(vertices, createPoint(-w / 2, -h / 2));

    super(vertices);

    this.isPolygonal = true;
  }
}


/**
 * Centered Square
 * @extends Fresco.Shape
 */
Fresco.Square = class extends Fresco.Rect {
  /**
   * @constructor
   * @param {number} size Side length in pixels
   */
  constructor(size = 100) {
    super(size, size);
  }
}


/**
 * Centered regular polygon (for example hexagon, octogon...)
 * @extends Fresco.Circle
 */
Fresco.Polygon = class extends Fresco.Circle {
  /**
   * @constructor
   * @param {number} radius Radius of the  polygon
   * @param {number} resolution Number of summit vertices
   */
  constructor(radius = 50, resolution = 24) {
    super(radius, resolution);
    this.isPolygonal = true;
  }
}


/**
 * Computes the winding number of a curve around a point,
 * which is to say, in lemmans terms, how many time does the curve
 * turn around the point.
 * @param {p5.Vector} pt Point of observation
 * @param {Array.<Fresco.Point>} vertices Vertices describing the curve
 * @returns {number} The winding number
 */
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


/**
 * Returns the catmull rom centripetal spline equation (3rd order polynomial)
 * coefficients given 4 points position.
 * This is usefull as the vertexCurve in p5 uses Catmull-Rom with its alpha = 0.5.
 * @param {Fresco.Point} p0
 * @param {Fresco.Point} p1
 * @param {Fresco.Point} p2
 * @param {Fresco.Point} p3
 * @returns {Array.<Fresco.Point>} 2D coefficients of the 2D Catmull-Rom spline.
 * This may very well work in 3D as well but is untested
 */
function catmullRom(p0, p1, p2, p3) {
  a = p1.copy().mult(3).sub(p0).add(
    p2.copy().mult(-3)).add(p3).mult(0.5); //0.5 * (-p0 + 3 * p1 - 3 * p2 + p3)
  b = p0.copy().mult(2).add(p1.copy().mult(-5)).add(
    p2.copy().mult(4)).sub(p3).mult(0.5); // alpha * (2 * p0 - 5 * p1 + 4 * p2 - p3)
  c = p2.copy().sub(p0).mult(0.5); // alpha * (-p0 + p2)
  d = p1.copy().mult(0.5 * 2); // alpha * (2 *p1)
  return [a, b, c, d];
}


/**
 * Finds the real roots of a 2nd order polynomial
 * @param {number} a 2nd degree coefficient
 * @param {number} b 1st degree coefficient
 * @param {number} c 0th degree coeeficient
 * @returns {Array.<number>} Real roots if they exist
 */
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


/**
 * Finds the real roots of a 3rd order polynomial
 * @param {number} a 3rd degree coefficient
 * @param {number} b 2nd degree coefficient
 * @param {number} c 1st degree coefficient
 * @param {number} d 0th degree coefficient
 * @returns {Array.<number>} Real roots if they exist
 */
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


/**
 * Computes the intersection of 2 lines. Each line should
 * be described by its direction and a point
 * that we call the origin of the line fr simplicity.
 * In other words, any point p on the line can be described
 * from a unique t, such that
 * p = t * drection + origin
 * @param {p5.Vector} pt1 First line's origin
 * @param {p5.Vector} dir1 First line's directon
 * @param {p5.Vector} pt2 Second line's origin
 * @param {p5.Vector} dir2 Second line's direction
 * @returns {Array.<number>} [t1, t2] where t1 and t2 are the value
 * of t at the intersection point for the first and second
 * line respectively. If the 2 lines are parallel, the array
 * will instead constain 2 booleans
 */
function lineIntersection(pt1, dir1, pt2, dir2) {
  if (dir1.x == 0) {
    // if  both x components of the lines direction are 0 then they are parallel and don't intersect
    if (dir2.x == 0) {
      return [false, false];
    }
    else {
      const t2 = (pt1.x - pt2.x) / dir2.x;
      const t1 = ((pt2.y - pt1.y) + dir2.y * t2) / dir1.y;
      return [t1, t2];
    }
  }
  // check if parallel
  else if (dir2.y == dir1.y * dir2.x / dir1.x) {
    return [false, false];
  }
  // general case
  else {
    // this is using geometry tricks
    // const v1 = pt1.copy().sub(pt2);
    // const v3 = createVector(-dir1.y, dir1.x);
    // const t2 = v1.dot(v3) / dir2.dot(v3);
    // const t1 = ((pt2.x - pt1.x) + dir2.x * t2) / dir1.x;
    // return [t1, t2];

    // This is using brute force system solving
    const det = -dir1.x * dir2.y + dir2.x * dir1.y;
    const ax = pt2.x - pt1.x;
    const ay = pt2.y - pt1.y;
    const t1 = (-dir2.y * ax + dir2.x * ay) / det;
    const t2 = (-dir1.y * ax + dir1.x * ay) / det;
    return [t1, t2];
  }
}


/**
 * Computes the intersection of 2 segments defined by there extremities.
 * @param {p5.Vector} p0 First end of the first line
 * @param {p5.Vector} p1 Second end of the first line
 * @param {p5.Vector} p2 First end of the second line
 * @param {p5.Vector} p3 Second end of the second line
 * @param {Number} epsilon=0 Min distance to end points
 * @returns {p5.Vector} Position of the intersection point.
 * If the point does not exist,
 * this method will return false instead.
 * Note that this method will work with any class which extends
 * p5.Vector as long as it implements the `copy` method and the
 * basic vector arithmetic. The return will have the same type
 * as the first point input.
 */
function segmentIntersection(p0, p1, p2, p3, epsilon = 0) {
  let dir1 = p1.copy().sub(p0);
  let dir2 = p3.copy().sub(p2);

  let [t1, t2] = lineIntersection(p0, dir1, p2, dir2);

  // if lines intersect, check that intersection is within the
  // segment extremities
  if (t1 !== false) {
    if (t1 > 1 - epsilon || t1 < epsilon) {
      return false;
    }
    if (t2 > 1 - epsilon || t2 < epsilon) {
      return false;
    }

    return p0.copy().add(dir1.copy().mult(t1));
  }
  else {
    return false;
  }
}


/**
 * Checks if a ray intersects a segment.
 * @param {p5.Vector} rayOrigin Origin point of the ray
 * @param {p5.Vector} rayDir Direction of the ray
 * @param {p5.Vector} p0 First end of the segment
 * @param {p5.Vector} p1 Second end of the segment
 * @returns {p5.Vector} Intersection point. False if no intersection.
 * @returns {number} Line interpolent of the segment, that is `t` such that
 * intersectionPoint = p1 + t * segmentDirection. False if no intersection.
 */
function raySegmentIntersection(rayOrigin, rayDir, p0, p1) {
  let dir2 = p1.position().sub(p0);

  let [t1, t2] = lineIntersection(rayOrigin, rayDir, p0, dir2);
  // if lines intersect, check that intersection is within the
  // segment extremities and on the positive direction of the ray
  if (t1 !== false) {
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

/**
 * Checks if a line intersects a segment. If no intersection is found an empty array is returned
 * @param {p5.Vector} origin Point on the line
 * @param {p5.Vector} dir Direction of the line
 * @param {Fresco.Point} p0 First end of the segment
 * @param {Fresco.Point} p1 Second end of the segment
 * @param {boolean} returnLineInt If true, the line interpolent will also be returned
 * @returns {p5.Vector} Intersection point.
 * @returns {number} Line interpolent of the segment, that is `t` such that
 * intersectionPoint = p1 + t * segmentDirection.
 */
function lineSegmentIntersection(origin, dir, p0, p1, returnLineInt = false) {
  let dir2 = p1.position().sub(p0);

  let [t1, t2] = lineIntersection(origin, dir, p0, dir2);
  // if lines intersect, check that intersection is within the
  // segment extremities and on the positive direction of the ray
  if (t1 !== false) {
    if (t2 > 1 || t2 < 0) {
      return [];
    }
    if (returnLineInt) {
      return [origin.copy().add(dir.copy().mult(t1)), t2, t1];
    }
    else {
      return [origin.copy().add(dir.copy().mult(t1)), t2];
    }
  }
  else {
    return [];
  }
}


// computes the intersection of 2 lines of the form p = origin + direction * t. Returns false if
// the 2 lines are parallel, else returns the value of t for which the 2 lines intersect
// Note: the directions should be normalized
/**
 * Computes the intersection of a line with a spline. The line should
 * be described by an "origin", which is a point on the line used as reference.
 * The spline is described by its 4 control points.
 * @param {p5.Vector} pt Line "origin"
 * @param {p5.Vector} dir Line direction
 * @param {p5.Vector} p0 Spline control point
 * @param {p5.Vector} p1 Spline control point
 * @param {p5.Vector} p2 Spline control point
 * @param {p5.Vector} p3 Spline control point
 * @param {boolean} returnLineInt If set, also return the line interpolent
 * @returns {Array.Array<number>} For each intersection point the interpolent
 * for the line and the spline are returned. If there is no interesection,
 * the array will be empty.
 */
function lineSplineIntersection(pt, dir, p0, p1, p2, p3, returnLineInt = false) {
  // retrieve the line equation as x + by + c = 0
  let a1 = 1;
  let b1;
  let c1;
  if (dir.y != 0) {
    b1 = -dir.x / dir.y;
    c1 = -pt.x - b1 * pt.y;
  }
  else {
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
    X = a2.x * ti * ti * ti + b2.x * ti * ti + c2.x * ti + d2.x;
    Y = a2.y * ti * ti * ti + b2.y * ti * ti + c2.y * ti + d2.y;
    if (dir.x != 0) {
      interp = (X - pt.x) / dir.x;
    }
    else {
      interp = (Y - pt.y) / dir.y;
    }
    if (returnLineInt) {
      append(t, [createPoint(X, Y), ti, interp]);
    }
    else {
      append(t, [ti, interp]);
    }
  }

  return t;
}


/**
 * Check if a ray intersects a spline edge. For each intersection with the spline,
 * this function will return true if the intersection is whitin the bounds of the edge,
 * as well as the interpolent for the ray and the spline
 * @param {p5.Vector} rayOri Ray origin point
 * @param {p5.Vector} rayDir Ray direction
 * @param {p5.Vector} p0 Spline control point
 * @param {p5.Vector} p1 Spline control point
 * @param {p5.Vector} p2 Spline control point
 * @param {p5.Vector} p3 Spline control point
 * @returns {Array.<boolean, number, number>} For each intersection
 */
function raySplineIntersection(rayOri, rayDir, p0, p1, p2, p3) {
  let t = lineSplineIntersection(rayOri, rayDir, p0, p1, p2, p3);

  let t2 = [];
  for (let i = 0; i < t.length; i++) {
    if (t[i][0] >= 0 && t[i][0] <= 1 && t[i][1] >= 0) {
      append(t2, [true, t[i][0], t[i][1]]);
    }
    else {
      append(t2, [false, false, false]);
    }
  }

  return t2;
}


/**
 * checks whether a line intersects a circle
 * @param {p5.Vector} p0 Point on the line
 * @param {p5.Vector} p1 Point on the line. Should be distinct from p0
 * @param {p5.Vector} center Circle center
 * @param {Number} radius Circle radius
 * @returns {Boolean, p5.Vector} true if intersection + the closest point to
 * the circle center
 */
function doLineIntersectCircle(p0, p1, center, radius) {
  let dir = p1.copy().sub(p0).normalize();
  let toCenter = center.copy().sub(p0);
  let proj = toCenter.dot(dir);

  let projPoint = dir.mult(proj).add(p0);

  // intersection if projection point is close enough to the circle
  // and is within segment
  return [distSquared(projPoint, center) <= radius * radius, projPoint];
}

/**
 * checks whether a segment intersects a circle
 * @param {p5.Vector} p0 Point on the line
 * @param {p5.Vector} p1 Point on the line. Should be distinct from p0
 * @param {p5.Vector} center Circle center
 * @param {Number} radius Circle radius
 * @returns {Boolean, p5.Vector} true if intersection + the closest point to
 * the circle center
 */
function doSegmentIntersectCircle(p0, p1, center, radius) {
  let [intersect, proj] = doLineIntersectCircle(p0, p1, center, radius)

  if (!intersect) return [false, proj];

  return [
    distSquared(p0, proj) <= distSquared(p0, p1)
    || distSquared(p0, center) < radius * radius
    || distSquared(p1, center) < radius * radius,
    proj
  ];
}


/**
 * Checks whether a point is inside a givn shape. This uses the even-odd rule.
 * That is, it counts how many times a ray starting from the point intersects
 * the contour. If it is odd, the point is inside.
 * @param {p5.Vector} vtx Point we want to check
 * @param {Fresco.Shape} shape Shape we check the point is in
 * @param {boolean} [approx] If the shape is not polynomial, setting approx
 * to true will run the test as if the shape was polygonal which is faster
 * but less accurate.
 * @returns {boolean} True if the point is inside the shape
 */
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
  let xVec = p5.Vector.fromAngle(Math.PI / 1.237122147);
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
      // for the sdrawLine case we solve for the roots
      // of the intersection
      // or the horizontal line with each sdrawLine
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


/**
 * Resamples a shape's contour by spreading evenly a given
 * amount of points along the shape. These points will become the
 * new vertices of the shape
 * This may change the look of the shape, inducing some amount of smoothing to
 * some extend, even though each point is spread on the original contour.
 * Note: Equidistaqnce on the contour may not imply equidistance in space.
 * Thus some shape distortion may appear, especially for polygonal shapes.
 * @param {Fresco.Shape} shape The shape to resample
 * @param {number} [numPoints] Number of points to spread along the shape.
 * If the number is 0 or less, this will simply re-spread the existing
 * amount of vertices in the shape
 * @param {boolean} [offset] If true, the first vertex will be moved on the contour
 * by half the distance between 2 succesive vertices. This may be handy to avoid
 * the shape being skewed towards the first vertex.
 * @param {boolean} [approx] If true, non-polygonal shape edge interpolation
 * will be be approximated
 * @param {boolean} [splineResample] To avoid distortion appearing in polygonal shapes,
 * it is a good idea to first convert it to a spline based shape.
 * It will indeed be a bit slower, but it is recommended to always leave it on.
 * @returns {Fresco.Shape} The resampled shape.
 */
function resample(shape, numPoints = 0, offset = true, approx = false,
  splineResample = true) {
  if (shape.vertices.length <= 1) {
    return shape.copy();
  }

  let isPolygonal = shape.isPolygonal;
  if (splineResample) {
    shape.isPolygonal = false;
  }

  if (numPoints == 0 || numPoints == shape.vertices.length) {
    numPoints = shape.vertices.length;
    offset = false;
  }

  // sample the specified amount of points on the contour
  let vtx = sample(shape, numPoints, offset, approx);

  let nu_shape = shape.copy();
  nu_shape.vertices = vtx
  for (let i = 0; i < nu_shape.vertices.length; i++) {
    nu_shape.vertices[i].owner = nu_shape;
  }
  nu_shape.updateLengths = true;
  nu_shape.isPolygonal = isPolygonal;

  return nu_shape;
}


/**
 * Samples a shape's contour by spreading evenly a given
 * amount of points along the shape.
 * @param {Fresco.Shape} shape The shape to resample
 * @param {number} [numPoints] Number of points to spread along the shape.
 * If the number is 0 or less, this will simply re-spread the existing
 * amount of vertices in the shape
 * @param {boolean} [offset] If true, the first vertex will be moved on the contour
 * by half the distance between 2 succesive vertices. This may be handy to avoid
 * the shape being skewed towards the first vertex.
 * @param {boolean} [approx] If true, non-polygonal shape edge interpolation
 * will be be approximated
 * @returns {Fresco.Shape} Samples along the shape's contour
 */
function sample(shape, numPoints, offset = true, approx = false) {
  let vtx = [];

  let totalLength = shape.contourLength();
  let incr = totalLength / (numPoints - 1);
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
  for (let i = start; i < numPoints - 1; i++) {
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

    pt = shape.edgeInterpolation(t, j, 100,
      approx, false);

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

  return vtx;
}


/**
 * Subdivides each edge of a mesh in equal sub edges.
 * @param {Fresco.Shape} shape The Shape to subdivide
 * @param {number} numDivision Number of subdivisions to
 * apply to each edge
 * @param {boolean} [approx] If the shape is non polygonal, this
 * will use the approximated version of the edge interpolation.
 * @returns {Fresco.Shape} The subdivided shape
 */
function subdivide(shape, numDivision, approx = false) {
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
    interp = 1 / (numDivision + 1);
    for (k = 1; k <= numDivision; k++) {
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

      vtx.scale = nu_shape.vertices[i].scale.copy().mult(1 - t).add(
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
/**
 * Randomly scatters points over a shape's contour or inner region
 * @param {Fresco.Shape} shape The shape to scatter points over
 * @param {number} numPoints Number of points to scatter
 * @param {boolean} [contour] If true, points will be scatter on the
 * contour, else they will be scattered inside the shape. The shape
 * must be closed for the latter to be permitted.
 * @param {boolean} [approx] This enables the approximated version of
 * the edge interpolation and when checking whether a point is inside,
 * if the shape is not polygonal
 * @param {number} [safety] When scattering points inside a shape, we
 * try to spawn points inside the bounding box and only keep those actually
 * inside the shape. If the shape is very thin but highly curved, a very
 * high number of attempts may be needed before a single point actually
 * lands in the shape. To avoid ending in a nearly infinite loop, we set a
 * maximum safety number of tries before aborting.
 * @returns {Array.<Fresco.Point>} The scattered points in WORLD coordinates.
 */
function scatter(shape, numPoints = 100,
  contour = true, approx = true, safety = 10000) {
  let vtx = [];
  if (contour) {
    // longer contours should have more chance of getting points
    let totalLength = shape.contourLength();
    let t;
    let l;
    let j;
    for (let i = 0; i < numPoints; i++) {
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
    for (let i = 0; i < numPoints; i++) {
      roll = true;
      itr = 0;
      while (roll) {
        nu_vtx = createVector(random(boundingBox[0].x,
          boundingBox[1].x),
          random(boundingBox[0].y,
            boundingBox[1].y));
        roll = !isInside(nu_vtx, shape, approx);
        itr++;
        if (itr > safety && safety > 0) {
          throw "Could not find place for scattered point in shape";
        }
      }
      append(vtx, nu_vtx);
    }
  }

  let pts = [];
  for (let i = 0; i < vtx.length; i++) {
    append(pts, new Fresco.Point(vtx[i]));
  }

  return pts;
}


/**
 * Relaxes points towards a position which minimizes points overlap based on
 * their respective radii. This is based on
 * <a href="https://en.wikipedia.org/wiki/Lloyd%27s_algorithm">Lloyd's algorithm</a>,
 * but using a weighted
 * voronoi diagram, where the weights are the radii.
 * For the Voroinoi diagram computation, we use a monte carlo simulation,
 * scattering samples in the canvas randomly. We add the samples to each
 * point's cell centroid estimate, if and only if the said point is the
 * closest to the sample, and the sample is at less than point.radius away.
 * Once this is done, we move each point to the computed centroids.
 * Rinse and repeat.
 * @param {Array.<p5.Vector>} points Points to relax.
 * @param {number} [iterations] Number of relaxation iterations to perform.
 * @param {number} [totSamples] Number of samples to use for the Monte Carlo estimation.
 * @param {Fresco.Shape} [shape] Shape the points may belong to.
 * @param {number} [minX] Bounds to constrain the relaxed points to.
 * @param {number} [minY] Bounds to constrain the relaxed points to.
 * @param {number} [maxX] Bounds to constrain the relaxed points to.
 * @param {number} [maxY] Bounds to constrain the relaxed points to.
 * @param {boolean} [alongCurve] Whether to relax along the curve. This makes
 * it closer to a resampling
 * @returns {Array.<p5.Vector>} The relaxed points.
 */
function relax(points,
  iterations = 1, totSamples = 1000,
  shape = null,
  minX = -width / 2, minY = -height / 2,
  maxX = width / 2, maxY = height / 2,
  alongCurve = false
) {
  // we find the max radius
  let r = 0;
  for (let i = 0; i < points.length; i++) {
    if (points[i].radius > r) {
      r = points[i].radius;
    }
  }

  let num_pts = points.length;
  // if a shape is closed, ignore last point
  if (points[points.length - 1].equals(points[0])) {
    num_pts--;
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
    cells = new Array(num_pts).fill(0).map( () => createVector(0, 0));
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
    let samples;
    if (alongCurve) {
      let proxyShape = new Fresco.Shape(points);
      samples = scatter(proxyShape, totSamples);
    }
    for (j = 0; j < totSamples; j++) {
      if (alongCurve) {
        p = samples[j];
      }
      else {
        let pt = points[randomInt(points.length)];
        let n = map(random(), 0, 1, 0, 10 * PI);
        p = pt.position().add(p5.Vector.fromAngle(n).mult(2 * pt.radius));
      };

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
        if (dist < m) {
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


/**
 * Copies a shape at specified points
 * The new shape will inheritate the points color,
 * it's shape will be that of the original shape times the that of the point,
 * and it's velocity will be a composition of the velocity of the points,
 * @param {Fresco.Shape} shape Shape to copy
 * @param {Array.<Fresco.Point>} points Points to copy the shape to.
 * @returns {Array<Fresco.Shape>} The shape copies.
 */
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
    nu_shape.updateLengths = true;
    append(shapes, nu_shape.copy());
  }

  return shapes;
}


// returns an intermediary shape between 2 shapes that have the same number of vertices.
// A boolean allows to keep the appearance of shape A or B
// If this function is to be called multiple times in a raw, for animation purposes
// for instance, one can specify the point pairs using pointMatch to save the computation time
// of finding the best vertex matching (and keep it consistant throughout the interpolation),
// should one of the 2 shapes be switched for the interpolated one on subsequent itterations.
// The pointMatch input consist only of the index of the matching vertex in shape B
// to vertex 0 in A. All other pairs can then be deduced using a circular buffer.
/**
 * Computes a shape which vertices is the interpolation between 2 shapes with
 * the same number of vertices.
 * @param {Fresco.Shape} A Shape A
 * @param {Fresco.Shape} B Shape B
 * @param {number} interp Interpolent
 * @param {boolean} [keepA] Whether to keep the properties of A
 * (isPolygonal, color, ...) or those of B
 * @param {number} [pointMatch] Index of the corresponding index in
 * shape B to the vertex 0 of shape A. If negative, it will computed to minimize
 * the average distance between point pairs between shapes.
 * @param {number} [matchDir] Matching direction between the 2 shapes. `1` means vertex
 * `i` in shape A matches vertex `i + pointMatch` in shape B, `-1` means it matches vertex `-i - pointMatch`.
 * @returns {Fresco.Shape} The interpolated shape.
 */
function shapeInterpolate(A, B, interp, keepA = true, pointMatch = -1, matchDir = 1) {
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
  if (pointMatch < 0) {
    pointMatch = 0;
    // brute force (see <a href "https://preview.tinyurl.com/y26xsngd">SO question</a>)
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
        pointMatch = k;
        matchDir = 1;
      }
      if (d1 < m) {
        m = d;
        pointMatch = k;
        matchDir = -1;
      }
    }
  }

  for (let i = 0; i < C.vertices.length; i++) {
    C.vertices[i].setPosition(
      A.applyTransform(A.vertices[i]).mult(
        1 - interp).add(
          B.applyTransform(
            B.vertices[(matchDir * i + matchDir * pointMatch) %
            A.vertices.length]).mult(interp)));
  }

  return C;
}

/**
 * Given an array of contours, merge those that have connected ends
 * @param {Array<Fresco.Shape>} contours
 * @returns {Array<Fresco.Shape>} Array of merged contours
 */
function mergeContours(contours) {
  // Now merge shapes together
  let isPolygonal = contours[0].isPolygonal
  let nuShape = contours[0];
  nuShape.isPolygonal = isPolygonal;
  let outShapes = [];
  contours.shift();
  contours.forEach(s => {
    if (s.vertices[0] == nuShape[nuShape.vertices.length - 1]) {
      s.vertices.shift();
      s.vertices.forEach(vtx => nuShape.push(vtx));
    }
    else {
      outShapes.push(nuShape.copy());
      nuShape = s;
      nuShape.isPolygonal = isPolygonal;
    }
  });
  outShapes.push(nuShape.copy());

  return outShapes;
}

/**
 * Computes the offset between 2 sets of points to minimize
 * average pair-wise distance
 * WARNING: Currently Non-functional
 * @param {Fresco.Shape} A Shape A
 * @param {Fresco.Shape} B Shape B
 * @returns {number} Offset between the 2 points vertices
 * @returns {number} Matching direction
 */
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
    for (let i = 0; i < A.length - 1; i += 2) {
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
/**
 * Given a function and a set of coordinates, this function returns the
 * displaced coordinates following the gradient of a 1D function which takes
 * x and y coordinates as input and returns a value in the [0, 1] range.
 * @param {p5.Vector} point Point to displace
 * @param {Function} func Function to use the gradient of to displace the point.
 * @param {number} amplitude Amount of displacement in pixels
 * @param {number} [step] Differnetiation step to compute the gradient
 * @returns {p5.Vector} Displaced point
 */
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
/**
 * Distorts an image using some simulated depth.
 * This works by stretching the uv coordinates to wrap around the simulated
 * geometry, assuming white means an elevation of "amplitude" and black means 0
 * @param {p5.Vector} point Point to displace
 * @param {Function} func Function which returns the simulated "depth" of a pixel
 * @param {number} amplitude Amount of displacement
 * @param {step} step Integration step for the distance calculation
 * @returns {p5.Vector} Displaced point
 */
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

function pointDistToLine(vtx, p0, dir) {
  // vector from point on line to vtx
  let ray = vtx.copy().sub(p0);

  // we project the ray onto the line
  let proj = p5.Vector.dot(ray, dir);
  let projVec = dir.copy().mult(proj);

  // we subtract the projection from the "ray"
  let orth = ray.sub(projVec);

  return orth.mag();
}

function pointDistToSegment(vtx, p0, p1) {
  // we compute the segment direction
  let dir = p1.copy().sub(p0);
  let length = dir.mag();
  if (length == 0) {
    console.log('Error! A segment should be of length > 0 for a distance to a point to be defined');
    return 1e9;
  } else {
    dir.div(length);
  }

  // vector from point on line to vtx
  let ray = vtx.copy().sub(p0);

  // we project the ray onto the line
  let proj = p5.Vector.dot(ray, dir);

  // if the projected distance on the underlying line to the segment is larger than the segment
  // length or is negative, then the distance to the segment is that to the end vertices
  if (proj > length) {
    return p1.copy().sub(vtx).mag();
  } else if (proj < 0) {
    return p0.copy().sub(vtx).mag();
  } else {
    // otherwise the distance to the segment is that to the underlying line
    let projVec = dir.copy().mult(proj);

    // we subtract the projection from the "ray"
    let orth = ray.sub(projVec);

    return orth.mag();
  }
}