/**
 * Created by qz on Dec 8th, 2017
 */

// Check if your browser supports ES6 features
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
let n = 200; // Maximum number of points
let x, y, z; // Coordinates of points
let dt = 0.015;
// Interactive variables
let sigmaSlider = $('#sigma').bootstrapSlider({});
let betaSlider = $('#beta').bootstrapSlider({});
let rhoSlider = $('#rho').bootstrapSlider({});
let sigma = sigmaSlider.bootstrapSlider('getValue');
let beta = betaSlider.bootstrapSlider('getValue');
let rho = rhoSlider.bootstrapSlider('getValue');
let plt = document.getElementById('plt');
// Start and stop animation
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
let reqId; // Cancels an animation frame request previously scheduled through a call to window.requestAnimationFrame().


// Calculation for animation
/**
 * Each time we stop and then restart the animation, we update the x, y, z as initials
 */
function updateInitials() {
    x = [];
    y = [];
    z = [];
    for (let i = 0; i < n; i++) {
        x[i] = Math.random() * 2 - 1;
        y[i] = Math.random() * 2 - 1;
        z[i] = 30 + Math.random() * 10;
    }
}

function calculateStabilityCriterion() {
    let num = sigma * ((sigma + beta + 3) / (sigma - beta - 1));
    return num.toFixed(3);
}

/**
 * Here we use a closed method, i.e., a predictor-corrector method for solving the problem.
 */
function compute() {
    let dx, dy, dz;
    let xh, yh, zh;
    for (let i = 0; i < n; i++) {
        dx = sigma * (y[i] - x[i]);
        dy = x[i] * (rho - z[i]) - y[i];
        dz = x[i] * y[i] - beta * z[i];
        // Predicted value for this system
        xh = x[i] + dx * dt * 0.5;
        yh = y[i] + dy * dt * 0.5;
        zh = z[i] + dz * dt * 0.5;
        dx = sigma * (yh - xh);
        dy = xh * (rho - zh) - yh;
        dz = xh * yh - beta * zh;
        // Corrected value for this system
        x[i] += dx * dt;
        y[i] += dy * dt;
        z[i] += dz * dt;
    }
}


// Plotting
function createPlot() {
    let data = [{
        x: x,
        y: z,
        mode: 'markers'
    }];

    let layout = {
        title: 'The Lorenz system',
        xaxis: {
            title: '<i>x</i>',
            titlefont: {
                size: 18,
            },
            range: [-60, 60]
        },
        yaxis: {
            title: '<i>z</i>',
            titlefont: {
                size: 18,
            },
            range: [0, 150]
        },
    };

    Plotly.plot('plt', data, layout);
}


// Animation
function animatePlot() {
    compute();

    Plotly.animate('plt', {
        data: [{
            x: x,
            y: z
        }]
    }, {
        transition: {
            duration: 0
        },
        frame: {
            duration: 0,
            redraw: false
        }
    });

    reqId = requestAnimationFrame(animatePlot); // Return the request id, that uniquely identifies the entry in the callback list.
}


// Interactive interfaces
// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt);
};

sigmaSlider.on('change', function () {
    sigma = sigmaSlider.bootstrapSlider('getValue');

    $('#stabilityCriterion').text(calculateStabilityCriterion());
    $('#sigmaSliderVal').text(sigma);
});

betaSlider.on('change', function () {
    beta = betaSlider.bootstrapSlider('getValue');

    $('#stabilityCriterion').text(calculateStabilityCriterion());
    $('#betaSliderVal').text(beta);
});

rhoSlider.on('change', function () {
    rho = rhoSlider.bootstrapSlider('getValue');

    $('#rhoSliderVal').text(rho);
});

let isAnimationOff = true; // No animation as default
$('#animate')
    .on('click', function () {
        let $this = $(this);
        if (isAnimationOff) { // If no animation, a click starts one.
            isAnimationOff = false;
            $this.text('Off');
            updateInitials();
            reqId = requestAnimationFrame(animatePlot); // Start animation
        } else { // If is already in animation, a click stops it.
            isAnimationOff = true;
            $this.text('On');
            cancelAnimationFrame(reqId); // Stop animation
        }
    });


// Initialize
updateInitials();
createPlot();
$('#sigmaSliderVal').text(sigma);
$('#betaSliderVal').text(beta);
$('#rhoSliderVal').text(rho);
$('#stabilityCriterion').text(calculateStabilityCriterion());
