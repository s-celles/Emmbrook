/**
 * Originally written by Makani Cartwright.
 * Modified by Qi on 12/5/17.
 */

'use strict';
// Check if your browser supports ES6 feature
let supportsES6 = function () { // Test if ES6 is ~fully supported
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


// Variables
let t = 0;
let dt = 0.2;
let kBar;
let wBar;
let deltaK;
let deltaW;
let x = nj.arange(0, 200.5, .5).tolist();
let y = [];
// Interactive variables
let k1Slider = $('#k1').bootstrapSlider({});
let k2Slider = $('#k2').bootstrapSlider({});
let w1Slider = $('#w1').bootstrapSlider({});
let w2Slider = $('#w2').bootstrapSlider({});
let k1 = k1Slider.bootstrapSlider('getValue');
let k2 = k2Slider.bootstrapSlider('getValue');
let w1 = w1Slider.bootstrapSlider('getValue');
let w2 = w2Slider.bootstrapSlider('getValue');
let plt = document.getElementById('plt');
// Start and stop animation
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
let reqId; // Cancels an animation frame request previously scheduled through a call to window.requestAnimationFrame().


// Interfaces
function initialize() {
    kBar = (k1 + k2) / 2;
    wBar = (w1 + w2) / 2;
    deltaK = (k1 - k2) / 2;
    deltaW = (w1 - w2) / 2;
    calculate();
    createPlot();
}

function calculate() {
    y = [];
    for (let i = 0; i < 400; i++) {
        y.push(2 * Math.cos(deltaK * x[i] - deltaW * t) * Math.cos(kBar * x[i] - wBar * t));
    }
}

function createPlot() {
    let layout = {
        margin: {
            t: 20,
            l: 50,
            r: 20,
        },
        yaxis: {
            title: '<i>f(z,t)</i>',
            range: [-4, 4]
        },
        xaxis: {
            title: '<i>z</i>',
            range: [0, 200]
        }
    };

    let data = [{
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines'
    }];

    Plotly.newPlot(plt, data, layout);
}


// Interactive interfaces
k1Slider.on('change', function () {
    k1 = k1Slider.bootstrapSlider('getValue');  // Get new "global" value
    initialize();

    $('#k1SliderVal').text(k1);
});

k2Slider.on('change', function () {
    k2 = k2Slider.bootstrapSlider('getValue');  // Get new "global" value
    initialize();

    $('#k2SliderVal').text(k2);
});

w1Slider.on('change', function () {
    w1 = w1Slider.bootstrapSlider('getValue');  // Get new "global" value
    initialize();

    $('#w1SliderVal').text(w1);
});

w2Slider.on('change', function () {
    w2 = w2Slider.bootstrapSlider('getValue');  // Get new "global" value
    initialize();

    $('#w2SliderVal').text(w2);
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt);
};

let isAnimationOff = true; // No animation as default
$('#animate')
    .on('click', function () {
        let $this = $(this);
        if (isAnimationOff) { // If no animation, a click starts one.
            isAnimationOff = false;
            $this.text('Off');
            reqId = requestAnimationFrame(animatePlot); // Start animation
        } else { // If is already in animation, a click stops it.
            isAnimationOff = true;
            $this.text('On');
            cancelAnimationFrame(reqId); // Stop animation
        }
    });

function animatePlot() {
    // Advances t and animates the plot
    calculate();

    let data = [{
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines'
    }];

    Plotly.animate('plt', {
        data: data
    }, {
        transition: {
            duration: 0
        },
        frame: {
            duration: 0.05,
            redraw: false
        }
    });
    t += dt;

    reqId = requestAnimationFrame(animatePlot); // Return the request id, that uniquely identifies the entry in the callback list.
}


// Initialize
$('#k1SliderVal')
    .text(k1);
$('#k2SliderVal')
    .text(k2);
$('#w1SliderVal')
    .text(w1);
$('#w2SliderVal')
    .text(w2);
initialize();