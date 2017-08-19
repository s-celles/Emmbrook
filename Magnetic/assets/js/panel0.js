/**
 * Created by qz on Aug 19, 2017
 */

'use strict';
// Check if your browser supports ES6 feature
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
let ndarray = require('ndarray'); // Modular multidimensional arrays for JavaScript.
let linspace = require('ndarray-linspace'); // Fill an ndarray with equally spaced values
let ops = require('ndarray-ops'); // A collection of common mathematical operations for ndarrays.
let unpack = require('ndarray-unpack'); // Converts an ndarray into an array-of-native-arrays.
let fill = require('ndarray-fill');
let show = require('ndarray-show');
let ncc = require('ndarray-concat-cols');
let ncr = require('ndarray-concat-rows');
let tile = require('ndarray-tile'); // This module takes an input ndarray and repeats it some number of times in each dimension.
let d3 = require('d3');

// frame setup
let width = 2000,
    height = 1000,
    mw = 0, // if we want a margin
    g = d3.select('#plt0').node().getContext('2d'); // initialize a "canvas" element
g.fillStyle = 'rgba(0, 0, 0, 0.05)'; // for fading curves
g.lineWidth = 0.7;
g.strokeStyle = '#FF8000'; // html color code

// mapping from vfield coords to web page coords
g.fillRect(0, 0, width, height);
g.beginPath();
g.moveTo(0, 0);
g.lineTo(250, 50);
g.stroke();

let bx = require('./bx.json').data; // Read json file
let bz = require('./bz.json').data; // Read json file

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
