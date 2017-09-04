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
// Front-view data
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
// Bird-view data
const bx_1bird = require('./bx_1loop_birdview.json').data; // Read json file
const by_1bird = require('./by_1loop_birdview.json').data;
const U_1bird = require('./U_1loop_birdview.json').data;
const bx_3bird = require('./bx_3loop_birdview.json').data;
const by_3bird = require('./by_3loop_birdview.json').data;
const U_3bird = require('./U_3loop_birdview.json').data;
const bx_5bird = require('./bx_5loop_birdview.json').data;
const by_5bird = require('./by_5loop_birdview.json').data;
const U_5bird = require('./U_5loop_birdview.json').data;
const bx_7bird = require('./bx_7loop_birdview.json').data;
const by_7bird = require('./by_7loop_birdview.json').data;
const U_7bird = require('./U_7loop_birdview.json').data;
const bx_9bird = require('./bx_9loop_birdview.json').data;
const by_9bird = require('./by_9loop_birdview.json').data;
const U_9bird = require('./U_9loop_birdview.json').data;
const xNum = 50;  // Number of grids
const yNum = 50;
const zNum = 50;
const xMax = 3;  // Spatial range
const yMax = 3;
const zMax = 3;
let x = linspace(ndarray([], [xNum]), -xMax, xMax);
let y = linspace(ndarray([], [yNum]), -yMax, yMax);
let z = linspace(ndarray([], [zNum]), -zMax, zMax);
x.dtype = 'float64';  // You have to convert type before using "meshgrid".
y.dtype = 'float64';
z.dtype = 'float64';
let X;
let Y;
let Z;
[X, Z] = meshgrid(x, z);
Y = meshgrid(x, y)[1];
X = unpack(X);  // ndarray to array
Y = unpack(Y);
Z = unpack(Z);
let bxs = [bx_1loop, bx_3loop, bx_5loop, bx_7loop, bx_9loop];
let bxs_bird = [bx_1bird, bx_3bird, bx_5bird, bx_7bird, bx_9bird];
let bys = [by_1bird, by_3bird, by_5bird, by_7bird, by_9bird];
let bzs = [bz_1loop, bz_3loop, bz_5loop, bz_7loop, bz_9loop];
let Uvals = [flatten(U_1loop), flatten(U_3loop), flatten(U_5loop), flatten(U_7loop), flatten(U_9loop)];
let Uvals_bird = [flatten(U_1bird), flatten(U_3bird), flatten(U_5bird), flatten(U_7bird), flatten(U_9bird)];
let opt;  // Option to choose different number of loops


// Plotting
// Frame setup
// plot 0
let width0 = document.getElementById('plt0').getAttribute('width');
const height0 = document.getElementById('plt0').getAttribute('height');
const canvas0 = document.getElementById('plt0');  // Initialize a "canvas" element
let context0 = canvas0.getContext('2d');
context0.lineWidth = 0.1;
context0.strokeStyle = '#ff0000'; // Stroke color
// Mapping from vfield coords to web page coords
let xMap0 = d3.scaleLinear()
    .domain([-xMax, xMax])
    .range([0, xNum]);
let yMap0 = d3.scaleLinear()
    .domain([-zMax, zMax])
    .range([0, zNum]);
context0.fillRect(0, 0, width0, height0);
context0.scale(canvas0.width / x.size, canvas0.height / z.size);
let path0 = d3.geoPath(null, context0);  // Used by "fill" function
let color0;  // Used by "fill" function
// context0.font = '48px Helvetica';
// // context0.textBaseline = "right"; // how to align the text vertically
// // context0.textAlign = "end"; // how to align the text horizontally
// context0.fillText("test1", xMap0(0), yMap0(0)); // text, x, y


// plot 1
let width1 = document.getElementById('plt1').getAttribute('width');
const height1 = document.getElementById('plt1').getAttribute('height');
const canvas1 = document.getElementById('plt1');  // Initialize a "canvas" element
let context1 = canvas1.getContext('2d');
context1.lineWidth = 0.1;
context1.strokeStyle = '#ff0000'; // Stroke color
// Mapping from vfield coords to web page coords
let xMap1 = d3.scaleLinear()
    .domain([-xMax, xMax])
    .range([0, xNum]);
let yMap1 = d3.scaleLinear()
    .domain([-yMax, yMax])
    .range([0, yNum]);
context1.fillRect(0, 0, width1, height1);
context1.scale(canvas1.width / x.size, canvas1.height / y.size);
let path1 = d3.geoPath(null, context1);  // Used by "fill" function
let color1;  // Used by "fill" function
// context1.font = '48px Helvetica';
// // context0.textBaseline = "right"; // how to align the text vertically
// // context0.textAlign = "end"; // how to align the text horizontally
// context1.fillText("test1", xMap1(0), yMap1(0)); // text, x, y


function plotPlt0() {
    let bx = bxs[opt];
    let bz = bzs[opt];
    let U = Uvals[opt];
    // Plot contours
    // Reference: https://bl.ocks.org/mbostock/bf2f5f02b62b5b3bb92ae1b59b53da36
    let thresholds = d3.range(Math.min(...U), Math.max(...U), 0.01);
    let contours = d3.contours()
        .size([xNum, zNum])
        .thresholds(thresholds);
    color0 = d3.scaleSequential(d3.interpolateCubehelixDefault)
        .domain(d3.extent(U));
    contours(U).forEach(fill0);

    // Plot vector field
    // Reference: http://bl.ocks.org/newby-jay/767c5ffdbbe43b65902f
    for (let i = 0; i < x.size; i++) {
        for (let j = 0; j < z.size; j++) {
            let r = Math.sqrt((bx[i][j] ** 2) + (bz[i][j] ** 2));
            context0.beginPath();
            context0.moveTo(xMap0(X[i][j]), yMap0(Z[i][j])); // the start point of the path
            context0.lineTo(xMap0(X[i][j] + (bx[i][j] / r / 18)), yMap0(Z[i][j] + (bz[i][j] / r / 18))); // the end point
            context0.stroke(); // final draw command
        }
    }
}

function plotPlt1() {
    let bx = bxs_bird[opt];
    let by = bys[opt];
    let U = Uvals_bird[opt];
    // Plot contours
    // Reference: https://bl.ocks.org/mbostock/bf2f5f02b62b5b3bb92ae1b59b53da36
    let thresholds = d3.range(Math.min(...U), Math.max(...U), 0.01);
    let contours = d3.contours()
        .size([xNum, yNum])
        .thresholds(thresholds);
    color1 = d3.scaleSequential(d3.interpolateCubehelixDefault)
        .domain(d3.extent(U));
    contours(U).forEach(fill1);

    // Plot vector field
    // Reference: http://bl.ocks.org/newby-jay/767c5ffdbbe43b65902f
    for (let i = 0; i < x.size; i++) {
        for (let j = 0; j < y.size; j++) {
            let r = Math.sqrt((bx[i][j] ** 2) + (by[i][j] ** 2));
            context1.beginPath();
            context1.moveTo(xMap1(X[i][j]), yMap1(Y[i][j])); // the start point of the path
            context1.lineTo(xMap1(X[i][j] + (bx[i][j] / r / 18)), yMap1(Y[i][j] + (by[i][j] / r / 18))); // the end point
            context1.stroke(); // final draw command
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
function fill0(geometry) {
    context0.beginPath();
    path0(geometry);
    let rgb = color0(geometry.value).toString();
    let rgba = 'rgba(' + rgb.slice(4, -1) + ', 1)';  // rgb to rgba
    context0.fillStyle = rgba;
    context0.fill();
}

function fill1(geometry) {
    context1.beginPath();
    path1(geometry);
    let rgb = color0(geometry.value).toString();
    let rgba = 'rgba(' + rgb.slice(4, -1) + ', 1)';  // rgb to rgba
    context1.fillStyle = rgba;
    context1.fill();
}


// Miscellaneous
// Scaling HTML5 canvas width preserving w/h aspect ratio
let plt0 = $('#plt0');
plt0.css('width', '100%');
$(window).resize(function () {
    plt0.height(plt0.width());
});
let plt1 = $('#plt1');
plt1.css('width', '100%');
$(window).resize(function () {
    plt1.height(plt1.width());
});

$('#wireSelect') // See https://silviomoreto.github.io/bootstrap-select/options/
    .on('changed.bs.select', function () {
        let selectedValue = $(this).val();
        switch (selectedValue) {
            case '1':
                opt = 0;
                break;
            case '3':
                opt = 1;
                break;
            case '5':
                opt = 2;
                break;
            case '7':
                opt = 3;
                break;
            case '9':
                opt = 4;
                break;
        }
        plotPlt0();
        plotPlt1();
    });

// Initialize
opt = 0;
plotPlt0();
plotPlt1();
