/**
 * Created by qz on 8/6/17.
 */

'use strict';

var supportsES6 = function () { // Test if ES6 is ~fully supported
    try {
        new Function("(a = 0) => a");
        return true;
    } catch (err) {
        return false;
    }
}();

if (supportsES6) {} else {
    alert('Your browser is outdated! Please use a modern browser!');
};

// Import libraries
let numeric = require('numeric');
let ndarray = require('ndarray'); // Modular multidimensional arrays for JavaScript.
let ops = require('ndarray-ops'); // A collection of common mathematical operations for ndarrays. Implemented using cwise.
let unpack = require('ndarray-unpack'); // Converts an ndarray into an array-of-native-arrays.
let tile = require('ndarray-tile'); // This module takes an input ndarray and repeats it some number of times in each dimension.
let show = require('ndarray-show');
let meshgrid = require('ndarray-meshgrid');


// letiables
let i = 1; // Current
let xNum = 2;
let yNum = 2;
let zNum = 2;
let l = 50; // Length of the wire
let xCoord = ndarray(new Float64Array(numeric.linspace(0, 10, xNum)));
let yCoord = ndarray(new Float64Array(numeric.linspace(0, 10, yNum)));
let zCoord = ndarray(new Float64Array(numeric.linspace(0, 10, zNum)));
// console.log(show(meshgrid([0, 1, 1], [2, 3, 1], [4, 5, 1])))
let arr = meshgrid([0, 1, 1], [2, 3, 1], [4, 5, 1]);
console.log((arr.pick(null, 0)))
// var xMesh = reshape(arr.pick(null, 0))
// console.log(show(xMesh))
// console.log(xCoord)
// console.log(show(tile(xCoord, [yNum, zNum])))
// console.log(show(tile(yCoord, [xNum])))


function reshape(oldNdarr, newShape) {
    /*
     Here oldNdarray is a ndarray, newShape is an array spcifying the newer one's shape.
     */
    return ndarray(oldNdarr.data, newShape);
}