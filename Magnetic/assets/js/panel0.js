/**
 * Created by qz on Aug 19, 2017
 */

// Check if your browser supports ES6 features
var supportsES6 = function () { // Test if ES6 is ~fully supported
    try {
        new Function('(a = 0) => a');
        return true;
    } catch (err) {
        return false;
    }
}();

if (supportsES6) {
} else {
    alert('Your browser is too old! Please use a modern browser!');
}

// Import libraries
const ndarray = require('ndarray'); // Modular multidimensional arrays for JavaScript.
const linspace = require('ndarray-linspace'); // Fill an ndarray with equally spaced values
// const ops = require('ndarray-ops'); // A collection of common mathematical operations for ndarrays.
const unpack = require('ndarray-unpack'); // Converts an ndarray into an array-of-native-arrays.
// const show = require('ndarray-show');
const tile = require('ndarray-tile'); // This module takes an input ndarray and repeats it some number of times in each dimension.


// Variables
const xNum = 100;
const zNum = 100;
const xMax = 3;
const zMax = 3;
const x = linspace(ndarray([], [xNum]), -xMax, xMax);
const z = linspace(ndarray([], [zNum]), -zMax, zMax);
x.dtype = 'float64';
z.dtype = 'float64';
let X;
let Z;
[X, Z] = meshgrid(x, z);
X = unpack(X);
Z = unpack(Z);
// Load pre-calculated magnetic field data
const bx = require('./bx.json').data; // Read json file
const bz = require('./bz.json').data; // Read json file
const U = require('./U.json').data; // Read json file

const flattendU = U.reduce(function (a, b) {
    return a.concat(b);
});


// Frame setup
const width = 960;
const height = 960;
// Mapping from vfield coords to web page coords
let xMap = d3.scaleLinear()
    .domain([-xMax, xMax])
    .range([0, xNum]);
let yMap = d3.scaleLinear()
    .domain([-zMax, zMax])
    .range([0, zNum]);


// Interfaces
/**
 * Here oldNdarray is a ndarray, newShape is an array spcifying the newer one's shape.
 * @param oldNdarr
 * @param newShape
 * @returns {*}
 */
function reshape(oldNdarr, newShape) {
    return ndarray(oldNdarr.data, newShape);
}

/**
 * Here xArray, yArray should all be 1d arrays.
 Then it returns 2 fortran-style 2D arrays, that is,
 they are all column-major order:
 http://www.wikiwand.com/en/Row-_and_column-major_order.
 The returned xMesh and yMesh are all of shape [xNum, yNum].
 * @param xArray
 * @param yArray
 * @returns {[* , *]}
 */
function meshgrid(xArray, yArray) {
    let xNum = xArray.size;
    let yNum = yArray.size;
    let xMesh = reshape(tile(xArray, [yNum]), [xNum, yNum]);
    let yMesh = reshape(tile(yArray, [1, xNum]).transpose(1, 0), [xNum, yNum]);
    return [xMesh, yMesh];
}


// Plotting
/**
 * Plot vector field
 */
function plotVectorField(context) {
    //
    for (let i = 0; i < x.size; i++) {
        for (let j = 0; j < z.size; j++) {
            let r = Math.sqrt((bx[i][j] ** 2) + (bz[i][j] ** 2));
            context.beginPath();
            context.moveTo(xMap(X[i][j]), yMap(Z[i][j])); // the start point of the path
            context.lineTo(xMap(X[i][j] + (bx[i][j] / r / 18)), yMap(Z[i][j] + (bz[i][j] / r / 18))); // the end point
            context.stroke(); // final draw command
        }
    }
}

/**
 * Plot contours
 */
function plotCountours(context) {
    let path = d3.geoPath(null, context);
    let thresholds = d3.range(Math.min(...flattendU), Math.max(...flattendU), 0.01);
    let contours = d3.contours()
        .size([100, 100])
        .thresholds(thresholds);
    let color = d3.scaleSequential(d3.interpolateCubehelixDefault)
        .domain(d3.extent(flattendU));
    contours(flattendU).forEach(fill);

    /**
     *
     * @param geometry
     */
    function fill(geometry) {
        context.beginPath();
        path(geometry);
        let rgb = color(geometry.value).toString();
        let rgba = 'rgba(' + rgb.slice(4, -1) + ', 0.05)';
        context.fillStyle = rgba;
        context.fill();
    }
}

// Interactive interfaces
/**
 * Adjust d3's plotRatios size responsively according to window motion.
 * https://stackoverflow.com/questions/1664785/resize-html5-canvas-to-fit-window
 */
function plotPlt0() {
    let canvas = document.getElementById('plt0');
    let ctx = canvas.getContext('2d'); // Initialize a "canvas" element

    // Start listening to resize events and draw canvas.
    initialize();

    /**
     * Register an event listener to call the resizeCanvas() function
     * each time the window is resized.
     */
    function initialize() {
        window.addEventListener('resize', resizeCanvas, false);
        // Draw canvas border for the first time.
        resizeCanvas();
    }

    /**
     * Display custom canvas. In this case it's a blue, 5 pixel
     * border that resizes along with the browser window.
     */
    function redraw() {
        ctx.scale(canvas.width / x.size, canvas.height / z.size);
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = '#ff0000'; // Stroke color
        plotCountours(ctx);
        plotVectorField(ctx);
    }

    /**
     * Runs each time the DOM window resize event fires.
     Resets the canvas dimensions to match window,
     then draws the new borders accordingly.
     */
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redraw();
    }
}

plotPlt0();
