Fresco.Glyph = class {
    constructor(shapes, width) {
        this.shapes = shapes;
        this.width = width;
    }
}

Fresco.Font = class {
    /**
     * @constructor
     * @param {*} rawData A dict containing the whole font, such as one loae from a json file
     * @property {*} glyphs Dict containing the description of each glyph as an array of shapes
     * @property {number} fontWeight=1 Stroke weight of the glyphs
     * @property {Array<number>} fontColor=(255, 255, 255, 255) Color of the font as an array of 4 RGBA values in range [0-255]
     * @property {number} fontSpacing=0 Spacing between 
     */
    constructor(rawData) {
        // parse the "json" data
        
        // for each glyph, extract the shapes
        this.glyphs = {};
        for (let glyph in rawData) {
            let shapes = []
            rawData[glyph]["shapes"].forEach(s => {
                shapes.push(shapeFromJSON(s))
            });

            this.glyphs[glyph] = new Fresco.Glyph(shapes, rawData[glyph]["width"]);
        }

        // set default size
        this.fontSize = 1;
        this.charWidth = 10;
        this.fontWeight = 1;
        this.fontColor = (255, 255, 255, 255);
        this.fontSpacing = 0;
    }

    drawLetter(letter, size, position) {
        console.log(this.glyphs[letter]);
        this.glyphs[letter].shapes.forEach(s => {
            s.drawInstantiate(
                false, position, size / this.fontSize,
                0, this.color, null, this.fontWeight
            );
        })
    }

    drawText(text, size, position, centered=false) {
        // init start position.
        let nuPos = position.copy();
        if (centered) {
            // compute total text width, as the sum of the width of each character (multiplied by the size)
            // plus the spacing in between each letter
            let totWidth = 0;
            for (let char of text) {
                if (char == ' ') {
                    totWidth += 10 * size / this.fontSize;
                }
                else {
                    totWidth += this.glyphs[char].width * size / this.fontSize;
                }
            }
            totWidth += (text.length - 1) * this.fontSpacing * size / this.fontSize;

            nuPos.x -= totWidth * 0.5;
        }

        // draw each character and offset the next one accordingly
        for (let char of text) {
            if (char == ' ') {
                nuPos.x += 10 * size / this.fontSize + this.fontSpacing * size / this.fontSize;
            }
            else {
                this.drawLetter(char, size, nuPos);
                nuPos.x += this.glyphs[char].width * size / this.fontSize + this.fontSpacing * size / this.fontSize;
            }
        }
    }
}

Fresco.Futural = null;

function loadFonts() {
    Fresco.Futural = new Fresco.Font(futural);
}
