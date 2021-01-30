# p5.Fresco
`p5.Fresco` for p5.js is a collection of tools for procedural art generation. It mostly focuses on handling 2D shapes, particle systems, noises and physics in p5.js.
Full documentation can be found [here](https://nielspichon.github.io/p5.Fresco)

## Generate the [documentation](https://nielspichon.github.io/p5.Fresco)
The documentation is generated using [jsdoc](https://github.com/jsdoc/jsdoc).

Build documentation by running `gen_docs.sh` or with

```
jsdoc -r ./js -R README.md -d ./docs
```

## [Demos](./demos)

### [Buddha](./demos/buddha/buddha.js)

Scattering points on a sphere and then moving then along some ridged noise projected on the sphere gave the following buddha looking picture.
Tweaking the parameters give many interesting results that can be explored.

<img src="./images/buddha.png" alt="buddha render" width="250"/>
<img src="./images/buddha.png" alt="buddha render" width="250"/>



