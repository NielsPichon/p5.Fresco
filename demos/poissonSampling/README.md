This demo implements poisson sampling with variable radii as proposed by Dwork et al. in this paper https://arxiv.org/pdf/2004.06789.pdf.
The radii of the points is varied based on an underlying image intensity.

This indeed means than an image needs to be loaded which will crash if you try to run locally.

To run:
* copy the js directory and style.css files to the current directory
* If you haven't already, install [python](https://www.python.org/).
* In a terminal navigate to this directory
* Run `python -m http.server`. This should create a server on localhost, port 8000.
* In your browser of choice type in the adress bar `localhost:8000`


Also, to avoid copyright issues, no image has been included in this directory, you will have to take one of your own. High contrast images
with large black areas tend to work better.