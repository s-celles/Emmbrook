# README

[TOC]

Todo:
- [ ] EM oblique incidence
- [x] Diffraction
- [ ] Aliasing
- [x] DFT simulation
- [ ] Main page
- [ ] Polarization

---

This is a simulation project for classes MSAE-E4206 and MSAE-E4215, i.e., *E&M* and *Mechanical behavior*, so I name it "EMMB"rook.

This `README` will tell you basically how to use bootstrap and JS in this project. In this file I will write what you need to know to edit these files.

## Bootstrap framework

Bootstrap is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web. It supports templates for typography, forms, buttons, navigation and other interface components. Bootstrap 4 is underdeveloping, and I mainly use bootstrap 3.3.7 here[^1]. The official website is [here](http://getbootstrap.com). 

### Usage

#### Template

To use bootstrap, first create a template like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>Your title here</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>
    
    Your code here.
    
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="js/bootstrap.min.js"></script>
  </body>
</html>
```

Put your code into `<body></body>` tag, before the `<script></script>` tags. Let JS files load at the end, and put CSS files in `<head></head>`.

#### Components

[Here](http://getbootstrap.com/components/) is what bootstrap has provided you. Only follow the examples is enough. A basic navbar template in my code is:

```html
<!-- Navigation bar -->
<nav class="navbar navbar-default navbar-inverse navbar-fixed-top">
    <div class="container-fluid">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#panels" aria-expanded="false">
                <!-- Used to hide information intended only for screen readers from the layout of the rendered page. -->
                <span class="sr-only">Toggle navigation</span>
                <!-- Used for responsive layouts to create a button that looks like ≡ on narrow browser screens. -->
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="../index.html">Home</a>
            <p class="navbar-text"><a href="http://apam.columbia.edu/william-bailey"
                                      data-toggle="tooltip" data-placement="bottom"
                                      title="MSE/APAM, Columbia University">W.E. Bailey</a></p>
        </div>

        <div class="collapse navbar-collapse" id="panels">
            <ul class="nav navbar-nav navbar-right">
                <li class="active"><a href="http://spin.ap.columbia.edu/dftsim/">Old page
                    <span class="sr-only">(old page)</span></a>
                </li>
                <li><a href="http://magnet.ap.columbia.edu/home">My page</a></li>
            </ul>
        </div>
    </div>
</nav>
```

Here

```html
<span class="icon-bar"></span>
<span class="icon-bar"></span>
<span class="icon-bar"></span>
```

is mainly to produce a [iconbar](http://imgur.com/wQuvXLM) when you shrink the window size of your browser. Though bootstrap 4 has deprecated this way. `data-toggle="tooltip"` makes a popup bubble, the documentation is [here](http://getbootstrap.com/javascript/#tooltips). You have to add this JS code somewhere in your html or a stand-alone JS file. The lines

```html
<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#panels" aria-expanded="false">
<div class="collapse navbar-collapse" id="panels">
```

make a dropdown menu when you shrink the window size of your browser.

#### Grid system

Grid system is a clever tool for puting your components. Please read the [documentation](https://v4-alpha.getbootstrap.com/layout/grid/) carefully to write correct style of grids.

### Example: the simulator

The idea of simulator is brought from [Schroeder](http://physics.weber.edu/schroeder/md/). I typically write in a bootstrap-way. It combines the use of HTML, JS and CSS. So it may be harder to maintain. For a a plots simulator, the code is usually:

```html
<!-- The simulator -->
<div class="container" id="app-div">
  <h4>
    Simulator
  </h4>

  <div class="row" id="plots">
    <div class="col-sm-6">
      <div id="plt0" class="plot"></div>
    </div>
    <div class="col-sm-6">
      <div id="plt1" class="plot"></div>
    </div>
  </div>

  <div class="row">
    <div class="col" id="control-panel">
      <div id="sliders">
        <!-- Slide bars -->
        <div class="row">
          <div class="col slider-row">
            <label for="x" class="slideLables">Physics Quantity:</label>
            <span id="xSliderVal" class="sliderVal"></span>
            <input id="x" data-slider-min="0" data-slider-max="10" data-slider-value="5" data-slider-step="1">
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

Remember to nest `col` class inside `row` class, recursively. You can also restrict `col`-width according bootstrap grid system documentation. The slider here is using [bootstrap-slider](https://github.com/seiyria/bootstrap-slider) plugin. So you need to add

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/9.8.0/css/bootstrap-slider.min.css" rel="stylesheet"/>
```

to you `<head></head>` and

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/9.8.0/bootstrap-slider.min.js"></script>
```

to your `<body></body>`. You would also want to add

```scss
.slider-row {
  display: inline-block;
  margin: 10px auto;
  max-width: 30%;
}

.slider.slider-horizontal {
  display: block;
  margin: 0 auto;
  max-width: 90%;
}

.slider-selection {
  background-image: linear-gradient(to bottom, $color2 0, $gradient3 100%);
  box-shadow: inset 1px 1px 1px 0 $shadow1;
}

.slider-track-high {
  background-image: linear-gradient(to bottom, $gradient1 0, $gradient2 100%);
  box-shadow: inset 1px 1px 1px 0 $shadow1;
}
```

to your `.scss` file, and then compile it to CSS using `scss`. What's more, you need to initialize the slider in your JS file like:

```javascript
var xSlider = $('#x').bootstrapSlider({});
```

And you may constantly want to use the value of the slider by

```javascript
var x = xSlider.bootstrapSlider('getValue');
```

To interact with this slider, you will need

```javascript
xSlider.on('change', function () {
    x = xSlider.bootstrapSlider('getValue');  // Change "global" value
    // Do something here...
    $('#xSliderVal').text(x);
});
```

All examples can be found [here](http://seiyria.com/bootstrap-slider/).

## JS for simulation

There are some usual way to use JS libraries. 

### Direct way

The first is directly include what you want at the end of your HTML file like this:

```html
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
```

This will load `Plotly` into your namespace. 

You can find most CDN link for your JS libraries [here](https://cdnjs.com) or [here](https://unpkg.org/), just type in the library name and copy the link.

### npm + browserify

However, you might do not want your HTML to be messed up with this links. So you can use npm + browserify to load libraries in JS file like this:

```javascript
// Import libraries
var ndarray = require("ndarray");  // Modular multidimensional arrays for JavaScript.
var ops = require("ndarray-ops");  // A collection of common mathematical operations for ndarrays. Implemented using cwise.
var show = require("ndarray-show");  // For debugging
var cwise = require("cwise");  // Elementwise operation
var pool = require("ndarray-scratch");  // A simple wrapper for typedarray-pool.
var unpack = require("ndarray-unpack");  // Converts an ndarray into an array-of-native-arrays.
var fill = require("ndarray-fill");  // Initialize an ndarray with a function.
var fft = require("ndarray-fft");  // A fast Fourier transform implementation for ndarrays.
```

This is quite clean now. npm is the package manager for JavaScript. You can install libraries simply using `npm install --save <packagename>` in your project root directory. And then load it as above. The recommended packages are in a collection called [scijs](http://scijs.net/packages/#scijs/scijs-ndarray-for-matlab-users), follow very carefully to its documentation, or you will get wrong result. And becareful that the plotting library—Plotly we use do not recognize `ndarray` datatype, so you need to 

```javascript
var unpack = require("ndarray-unpack");
unpack(somendarray);
```

before plotting.

After you have finished written your JS file, you cannot run it directly in browser, for the syntaxes above are designed for Node.js runtime. So you have to use [browserify](http://browserify.org) to compile your JS code to a bundle. The usage of browserify can be very simple, first make sure you have installed all packages employed in your JS simulation file using npm. Then install browserify by

```shell
npm install -g browserify
```

in your terminal (if you are using a *nix operating system, windows user please try to install npm yourself). And just type

```shell
browserify yourfile.js -o yourfile.bundle.js
```

in your terminal to make a bundled file. This is just a one-time command, if you modify `yourfile.js` later, you need to re-run the command. Or you can install `watchify` by

```shell
npm install -g watchify
```

and then

```shell
watchify yourfile.js -o yourfile.bundle.js
```

This will decect the file change automatically.

The last step is to load `yourfile.bundle.js` into your HTML file.

### MathJax

The last thing about JS is that if you write code in my style, you need to include

```html
<!-- MathJax -->
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML">
```

at the very end of the body. The default config here use `\( \)` to include inline math, and `$$ $$` to encompass display-style math. You can find every command you can use [here](http://docs.mathjax.org/en/latest/tex.html), be sure to check the syntax if you are not familiar with $\LaTeX{}$.

## Contact

Please contact [qz2280@columbia.edu](mailto:qz2280@columbia.edu) if you are still looking for help. Thanks!

[^1]: I only use bootstrap 4 cards for the main [index.html](./index.html).