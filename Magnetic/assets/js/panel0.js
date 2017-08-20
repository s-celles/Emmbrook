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

// Frame setup
let width = 960;
let height = 500;
let mw = 0; // If we want a margin
let g = d3.select('#plt0').node().getContext('2d'); // Initialize a "canvas" element
g.lineWidth = 0.7;
g.strokeStyle = '#FF8000'; // Stroke color
// Mapping from vfield coords to web page coords
let xMap = d3.scaleLinear()
    .domain([-xMax, xMax])
    .range([mw, width - mw]);
let yMap = d3.scaleLinear()
    .domain([-zMax, zMax])
    .range([height - mw, mw]);

// Plot vector field
g.fillRect(0, 0, width, height);
for (let i = 0; i < x.size; i++) {
    for (let j = 0; j < z.size; j++) {
        let r = Math.sqrt(Math.pow(bx[i][j], 2) + Math.pow(bz[i][j], 2));
        g.beginPath();
        g.moveTo(xMap(X[i][j]), yMap(Z[i][j])); // the start point of the path
        g.lineTo(xMap(X[i][j] + bx[i][j] / r / 15), yMap(Z[i][j] + bz[i][j] / r / 15)); // the end point
        g.stroke(); // final draw command
    }
}

// Plot contours
let svg = d3.select("svg"),
    w = +svg.attr("width"),
    h = +svg.attr("height");

let thresholds = d3.range(-3, 3, 0.025)
    .map(function (p) {
        return p;
    });

let contours = d3.contours()
    .size([x.size, z.size])
    .thresholds(thresholds);

let color = d3.scaleSequential(d3.interpolateMagma)
    .domain(d3.extent(flattendU));

svg.selectAll('path')
    .data(contours(flattendU))
    .enter().append('path')
    .attr('d', d3.geoPath(d3.geoIdentity().scale(w / x.size)))
    .attr('fill', function (d) {
        return color(d.value);
    });