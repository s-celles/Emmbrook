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
// Load pre-calculated magnetic field data
const bx_1loop = require('./bx_1loop.json').data; // Read json file
const bz_1loop = require('./bz_1loop.json').data;
const U_1loop = require('./U_1loop.json').data;
const bx_3loop = require('./bx_3loop.json').data;
const bz_3loop = require('./bz_3loop.json').data;
const U_3loop = require('./U_3loop.json').data;
const bx_5loop = require('./bx_5loop.json').data;
const bz_5loop = require('./bz_5loop.json').data;
const U_5loop = require('./U_5loop.json').data;
const bx_7loop = require('./bx_7loop.json').data;
const bz_7loop = require('./bz_7loop.json').data;
const U_7loop = require('./U_7loop.json').data;
const bx_9loop = require('./bx_9loop.json').data;
const bz_9loop = require('./bz_9loop.json').data;
const U_9loop = require('./U_9loop.json').data;
let xNum = 50;  // Number of grids
let zNum = 50;
const xMax = 3;  // Spatial range
const zMax = 3;
let x = linspace(ndarray([], [xNum]), -xMax, xMax);
let z = linspace(ndarray([], [zNum]), -zMax, zMax);
x.dtype = 'float64';  // You have to convert type before using "meshgrid".
z.dtype = 'float64';
let X;
let Z;
[X, Z] = meshgrid(x, z);
X = unpack(X);  // ndarray to array
Z = unpack(Z);
let bxs = [bx_1loop, bx_3loop, bx_5loop, bx_7loop, bx_9loop];
let bzs = [bz_1loop, bz_3loop, bz_5loop, bz_7loop, bz_9loop];
let Uvals = [flatten(U_1loop), flatten(U_3loop), flatten(U_5loop), flatten(U_7loop), flatten(U_9loop)];
let opt;  // Option to choose different number of loops


// Plotting
// Frame setup
let width = document.getElementById('plt0').getAttribute('width');
const height = document.getElementById('plt0').getAttribute('height');
const canvas = document.querySelector('canvas');  // Initialize a "canvas" element
let context = canvas.getContext('2d');
context.lineWidth = 0.1;
context.strokeStyle = '#ff0000'; // Stroke color
// Mapping from vfield coords to web page coords
let xMap = d3.scaleLinear()
    .domain([-xMax, xMax])
    .range([0, xNum]);
let yMap = d3.scaleLinear()
    .domain([-zMax, zMax])
    .range([0, zNum]);
context.fillStyle = '#ffffff';
context.fillRect(0, 0, width, height);
context.scale(canvas.width / x.size, canvas.height / z.size);
let path = d3.geoPath(null, context);  // Used by "fill" function
let color;  // Used by "fill" function

function plotPlt0(i) {
    switchNum(i);
    let bx = bxs[opt];
    let bz = bzs[opt];
    let U = Uvals[opt];
    // Plot contours
    // Reference: https://bl.ocks.org/mbostock/bf2f5f02b62b5b3bb92ae1b59b53da36
    let thresholds = d3.range(Math.min(...U), Math.max(...U), 0.01);
    let contours = d3.contours()
        .size([xNum, zNum])
        .thresholds(thresholds);
    color = d3.scaleSequential(d3.interpolateCubehelixDefault)
        .domain(d3.extent(U));
    contours(U).forEach(fill);

    // Plot vector field
    // Reference: http://bl.ocks.org/newby-jay/767c5ffdbbe43b65902f
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


// Basic interfaces
/**
 *
 * @param array
 * @returns {*}
 */
function flatten(array) {
    return array.reduce((a, b) => a.concat(b));
}

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

/**
 *
 * @param geometry
 */
function fill(geometry) {
    context.beginPath();
    path(geometry);
    let rgb = color(geometry.value).toString();
    let rgba = 'rgba(' + rgb.slice(4, -1) + ', 1)';  // rgb to rgba
    context.fillStyle = rgba;
    context.fill();
}


// Miscellaneous
// Scaling HTML5 canvas width preserving w/h aspect ratio
let plt0 = $('#plt0');
plt0.css('width', '100%');
$(window).resize(function () {
    plt0.height(plt0.width());
});

function switchNum(i) {
    switch (i) {
        case 1:
            opt = 0;
            break;
        case 3:
            opt = 1;
            break;
        case 5:
            opt = 2;
            break;
        case 7:
            opt = 3;
            break;
        case 9:
            opt = 4;
            break;
    }
}


// Initialize
plotPlt0(1);
