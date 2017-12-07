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
/**
 * Global variable kBar changes whenever k1 or k2 changes.
 */
function updateKBar() {
    kBar = (k1 + k2) / 2;
}

/**
 * Global variable wBar changes whenever w1 or w2 changes.
 */
function updateWBar() {
    wBar = (w1 + w2) / 2;
}

/**
 * Global variable deltaK changes whenever k1 or k2 changes.
 */
function updateDeltaK() {
    deltaK = (k1 - k2) / 2;
}

/**
 * Global variable deltaW changes whenever w1 or w2 changes.
 */
function updateDeltaW() {
    deltaW = (w1 - w2) / 2;
}

/**
 * Global variable y changes whenever k1, k2, w1 or w2 changes.
 */
function updateY() {
    y = [];
    for (let i = 0; i < 400; i++) {
        y.push(2 * Math.cos(deltaK * x[i] - deltaW * t) * Math.cos(kBar * x[i] - wBar * t));
    }
}

/**
 * When y changes, re-plot.
 */
function plot() {
    plt.data[0].y = y;

    Plotly.redraw(plt);
}

/**
 * Initial plot
 */
function createPlot() {
    let layout = {
        margin: {
            t: 20,
            l: 70,
            r: 30,
        },
        yaxis: {
            title: '<i>f(z,t)</i>',
            range: [-4, 4],
            titlefont: {
                size: 18,
            },
        },
        xaxis: {
            title: '<i>z</i>',
            range: [0, 200],
            titlefont: {
                size: 18,
            },
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
    updateKBar();
    updateDeltaK();
    updateY();
    plot();

    $('#k1SliderVal').text(k1);
});

k2Slider.on('change', function () {
    k2 = k2Slider.bootstrapSlider('getValue');  // Get new "global" value
    updateKBar();
    updateDeltaK();
    updateY();
    plot();

    $('#k2SliderVal').text(k2);
});

w1Slider.on('change', function () {
    w1 = w1Slider.bootstrapSlider('getValue');  // Get new "global" value
    updateWBar();
    updateDeltaW();
    updateY();
    plot();

    $('#w1SliderVal').text(w1);
});

w2Slider.on('change', function () {
    w2 = w2Slider.bootstrapSlider('getValue');  // Get new "global" value
    updateWBar();
    updateDeltaW();
    updateY();
    plot();

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

/**
 * Use PlotlyJS to create animation
 */
function animatePlot() {
    // Advances dt and animates the plot
    updateKBar();
    updateDeltaK();
    updateWBar();
    updateDeltaW();
    updateY();

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
updateKBar();
updateDeltaK();
updateWBar();
updateDeltaW();
updateY();
createPlot();
$('#k1SliderVal')
    .text(k1);
$('#k2SliderVal')
    .text(k2);
$('#w1SliderVal')
    .text(w1);
$('#w2SliderVal')
    .text(w2);