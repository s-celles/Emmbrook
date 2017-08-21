/**
 * Created by qz on Aug 19, 2017
 */

'use strict';
// Check if your browser supports ES6 features
var supportsES6 = function () { // Test if ES6 is ~fully supported
    try {
        new Function('(a = 0) => a');
        return true;
    } catch (err) {
        return false;
    }
}();

if (supportsES6) {} else {
    alert('Your browser is too old! Please use a modern browser!');
}

// Import libraries
const ndarray = require('ndarray'); // Modular multidimensional arrays for JavaScript.
const linspace = require('ndarray-linspace'); // Fill an ndarray with equally spaced values
const ops = require('ndarray-ops'); // A collection of common mathematical operations for ndarrays.
const unpack = require('ndarray-unpack'); // Converts an ndarray into an array-of-native-arrays.
const show = require('ndarray-show');
const tile = require('ndarray-tile'); // This module takes an input ndarray and repeats it some number of times in each dimension.


// Variables
let xNum = 100;
let zNum = 100;
let xMax = 3;
let zMax = 3;
let x = linspace(ndarray([], [xNum]), -xMax, xMax);
let z = linspace(ndarray([], [zNum]), -zMax, zMax);
x.dtype = 'float64';
z.dtype = 'float64';
let X;
let Z;
[X, Z] = meshgrid(x, z);
X = unpack(X);
Z = unpack(Z);
// Load pre-calculated magnetic field data
let bx = require('./bx.json').data; // Read json file
let bz = require('./bz.json').data; // Read json file
let U = require('./U.json').data; // Read json file
let flattendU = U.reduce(function (a, b) {
    return a.concat(b);
})

function reshape(oldNdarr, newShape) {
    /*
     Here oldNdarray is a ndarray, newShape is an array spcifying the newer one's shape.
     */
    return ndarray(oldNdarr.data, newShape);
}

function meshgrid(xArray, yArray) {
    /*
     Here xArray, yArray should all be 1d arrays.
     Then it returns 2 fortran-style 2D arrays, that is,
     they are all column-major order:
     http://www.wikiwand.com/en/Row-_and_column-major_order.
     The returned xMesh and yMesh are all of shape [xNum, yNum].
     */
    let xNum = xArray.size;
    let yNum = yArray.size;
    let xMesh = reshape(tile(xArray, [yNum]), [xNum, yNum]);
    let yMesh = reshape(tile(yArray, [1, xNum]).transpose(1, 0), [xNum, yNum]);
    return [xMesh, yMesh];
}

function fill(geometry) {
    context.beginPath();
    path(geometry);
    let rgb = color(geometry.value).toString();
    let rgba = 'rgba(' + rgb.slice(4, -1) + ', 0.03)';
    console.log(rgba)
    context.fillStyle = rgba;
    context.fill();
}


// Frame setup
let width = 960;
let height = 960;
let mw = 0; // If we want a margin
let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d'); // Initialize a "canvas" element
context.lineWidth = 0.7;
context.strokeStyle = '#000000'; // Stroke color
// Mapping from vfield coords to web page coords
let xMap = d3.scaleLinear()
    .domain([-xMax, xMax])
    .range([mw, width - mw]);
let yMap = d3.scaleLinear()
    .domain([-zMax, zMax])
    .range([height - mw, mw]);

context.fillStyle = '#ffffff';
context.fillRect(0, 0, width, height);

// Plot vector field
for (let i = 0; i < x.size; i++) {
    for (let j = 0; j < z.size; j++) {
        let r = Math.sqrt(Math.pow(bx[i][j], 2) + Math.pow(bz[i][j], 2));
        context.beginPath();
        context.moveTo(xMap(X[i][j]), yMap(Z[i][j])); // the start point of the path
        context.lineTo(xMap(X[i][j] + bx[i][j] / r / 18), yMap(Z[i][j] + bz[i][j] / r / 18)); // the end point
        context.stroke(); // final draw command
    }
}

// Plot contours
let path = d3.geoPath(null, context);
let thresholds = d3.range(-2, 2, 0.025);
let contours = d3.contours()
    .size([100, 300])
    .thresholds(thresholds);
let color = d3.scaleSequential(d3.interpolateCubehelixDefault)
    .domain(d3.extent(flattendU));
context.scale(canvas.width / x.size, canvas.height / z.size);
contours(flattendU).forEach(fill);