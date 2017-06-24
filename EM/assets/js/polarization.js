/**
 * Created by qizhang on 6/24/17.
 */

var d3 = window.d3;
var functionPlot = require('function-plot');

function computeYScale(width, height, xScale) {
    var xDiff = xScale[1] - xScale[0]
    var yDiff = height * xDiff / width
    return [-yDiff / 2, yDiff / 2]
}

var width = 800
var height = 400

// desired xDomain values
var xScale = [-10, 10]

functionPlot({
    width: width,
    height: height,
    xDomain: xScale,
    yDomain: computeYScale(width, height, xScale),

    target: '#plt0',
    data: [{
        fn: 'x^2',
        derivative: {
            fn: '2x',
            updateOnMouseMove: true
        }
    }]
});