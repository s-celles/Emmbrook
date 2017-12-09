/**
 * Originally written by Makani Cartwright.
 * Modified by Qi on 12/8/17.
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
let T = 300;
let q_e = 1.6 * Math.pow(10, -19);  // Electron charge
let m_e = 9.1 * Math.pow(10, -31);  // Electron mass
let dt = 5 * Math.pow(10, -13);
let ran = 5 * Math.pow(10, -6);
let theta0 = [];
let x, y, vx, vy, vi;
let positions;
let velocities;
let times;
let steps;
let stop;
// Interactive variables
let NSlider = $('#N').bootstrapSlider({});
let EfSlider = $('#Ef').bootstrapSlider({});
let tauSlider = $('#tau').bootstrapSlider({});
let ExSlider = $('#Ex').bootstrapSlider({});
let EySlider = $('#Ey').bootstrapSlider({});
let BzSlider = $('#Bz').bootstrapSlider({});
let N = NSlider.bootstrapSlider('getValue');
let Ef = q_e * EfSlider.bootstrapSlider('getValue');
let tau = tauSlider.bootstrapSlider('getValue');
let Ex = 10000 * ExSlider.bootstrapSlider('getValue');
let Ey = 10000 * EySlider.bootstrapSlider('getValue');
let Bz = BzSlider.bootstrapSlider('getValue');
let plt0 = document.getElementById('plt0');
let plt1 = document.getElementById('plt1');

let omegaC = q_e / m_e * Bz;  // Cyclotron frequency


// Sets up simulation
function initialize() {
    // Resets variables
    stop = false;
    steps = 0;
    x = [];
    y = [];
    vx = [];
    vy = [];
    vi = nj.zeros(n).tolist();
    positions = [];
    velocities = [];
    times = [];
    positions = nj.zeros(n * 2).reshape(n, 2, 1);
    velocities = nj.zeros(n * 2).reshape(n, 2, 1);
    times = nj.zeros(n).tolist();
    // Initialize positions and velocities
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < 2; j++) {
            positions.set(i, j, 0, initialPosition(ran));
        }
        let vs = initialVelocity(i, true);
        velocities.set(i, 0, 0, vs['vx']);
        velocities.set(i, 1, 0, vs['vy']);
    }
    getPositions();
    createPlots();
}

function initialPosition(r) {
    // Random distribution within area defined by r
    return 3 / 2 * (2 * r * Math.random() - r);
}

function initialVelocity(ind, reset) {
    //Random distribution of velocities under the Fermi velocity
    let phase = 2 * Math.PI * Math.random();
    if (reset) {
        let vf = Math.sqrt(2 * Ef / m_e);
        vi[ind] = vf * Math.random();
    }
    if (Math.random() < .5) {
        vx = -vi[ind] * Math.sin(phase);
    } else {
        vx = vi[ind] * Math.sin(phase);
    }
    if (Math.random() < .5) {
        vy = -vi[ind] * Math.cos(phase);
    } else {
        vy = vi[ind] * Math.cos(phase);
    }
    theta0[ind] = phase;
    return {
        vx, vy
    };
}

function updateVelocities() {
    // Updates velocities using solution to charged particle motion ODE
    let vxstep, vystep;
    let vnew = nj.zeros(2 * n).reshape(n, 2);
    if (Bz !== 0) {
        for (let i = 0; i < n; i++) {
            vxstep = vi[i] * Math.sin(omegaC * dt * times[i] + theta0[i]) - Ey / Bz;
            //- eY * dt *q_e / m_e;
            vystep = vi[i] * Math.cos(omegaC * dt * times[i] + theta0[i]) - Ex / Bz;
            vnew.set(i, 0, vxstep);
            vnew.set(i, 1, vystep);
        }
    } else {
        for (let i = 0; i < n; i++) {
            vxstep = velocities.get(i, 0, 0) - Ex * dt * q_e / m_e;
            vystep = velocities.get(i, 1, 0) - Ey * dt * q_e / m_e;
            let vi2 = Math.pow(vxstep, 2) + Math.pow(vystep, 2);
            vi[i] = Math.sqrt(vi2);
            vnew.set(i, 0, vxstep);
            vnew.set(i, 1, vystep);
        }
    }
    return checkScattering(vnew);
}

function checkScattering(vs) {
    // Checks for scattering based on tau
    // Reinitializes velocity if scatters
    for (let i = 0; i < n; i++) {
        if (tau * Math.random() < tau - Math.pow(times[i], .5)) {
            times[i] += 1;
        } else {
            let vn = initialVelocity(i, false);
            vs.set(i, 0, vn['vx']);
            vs.set(i, 1, vn['vy']);
            times[i] = 0;
        }
    }
    return vs;
}


function recalc() {
    //Advances simulation by dt
    let pn;
    let xn = nj.zeros(n);
    let yn = nj.zeros(n);
    omegaC = (q_e / m_e) * Bz;
    //Determines new positions
    for (let i = 0; i < n; i++) {
        xn.set(i, positions.get(i, 0, 0) + velocities.get(i, 0, 0) * dt);
        yn.set(i, positions.get(i, 1, 0) + velocities.get(i, 1, 0) * dt);
    }
    pn = nj.stack([xn, yn]).T;
    let vstep = updateVelocities().reshape(n, 2, 1);
    //Updates data points to include a maximum of 10 points
    switch (true) {
        case steps <= 1:
            positions = nj.concatenate(pn.reshape(n, 2, 1), positions);
            velocities = nj.concatenate(vstep, velocities);
            break;
        case steps > 2:
            positions = nj.concatenate(pn.reshape(n, 2, 1), positions).slice(0, 0, [0, 2]);
            velocities = nj.concatenate(vstep, velocities).slice(0, 0, [0, 2]);
            break;
    }
    getPositions();
    steps += 1;

}

function getPositions() {
    // Resets datapoints
    x = [];
    y = [];
    vx = [];
    vy = [];
    for (let i = 0; i < n; i++) {
        x.push([]);
        x[i] = pullHistory(positions, i, 0);
        x[i] = [checkBoundary(x[i])];
        y[i] = pullHistory(positions, i, 1);
        y[i] = [checkBoundary(y[i])];
        vx[i] = pullHistory(velocities, i, 0);
        vy[i] = pullHistory(velocities, i, 1);
    }
}

//Adjusts Simulation window size to fit
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};

function pullHistory(ndarray, index, axis) {
    //Isolates the ndarray axis history of the particle determined by index
    //i.e. position y history of particle 4 (positions,4,1)
    return ndarray.slice([index, index + 1], [axis, axis + 1], [0, 1]).flatten().tolist();
}

function checkBoundary(p) {
    let pos = parseFloat(p);
    if (pos > 3 / 2 * ran) {
        return checkBoundary(pos - 3 * ran);
    } else if (p < -3 / 2 * ran) {
        return checkBoundary(pos + 3 * ran);
    } else {
        return pos;
    }
}

function genData(ax, ay, index) {
    //Generates data for a single trace
    return {
        x: ax[index],
        y: ay[index],
        type: 'scatter',
        mode: 'markers'
    };
}

function createPlots() {
    let layout0 = {
        margin: {
            t: 20,
            l: 50,
            r: 20,
        },
        yaxis: {
            title: '<i>Y</i>',
            range: [-ran, ran]
        },
        xaxis: {
            title: '<i>X</i>',
            range: [-ran, ran]
        },
        showlegend: false
    };

    let layout1 = {
        margin: {
            t: 20,
            l: 50,
            r: 20,
        },
        yaxis: {
            title: '<i>v<sub>y</sub></i>',
            range: [-400000, 400000]
        },
        xaxis: {
            title: '<i>v<sub>x</sub></i>',
            range: [-400000, 400000]
        },
        showlegend: false
    };

    let data0 = [],
        data1 = [];
    for (i = 0; i < n; i++) {
        data0.push(genData(x, y, i));
        data1.push(genData(vx, vy, i));
    }

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}

function oneStep() {
    stop = true;
    update();
}

function update() {
    //Advances t and animates the plots
    recalc();
    console.log('vx', vx[0]);
    console.log('vy', vy[0]);
    let data0 = [],
        data1 = [],
        trace = [];
    for (i = 0; i < n; i++) {
        data0.push(genData(x, y, i));
        data1.push(genData(vx, vy, i));
        trace.push(i);
    }
    Plotly.animate('plt0', {
        data: data0,
        traces: trace
    }, {
        transition: {
            duration: 0
        },
        frame: {
            duration: 0,
            redraw: false
        }
    });
    Plotly.animate('plt1', {
        data: data1,
        traces: trace
    }, {
        transition: {
            duration: 0
        },
        frame: {
            duration: 0,
            redraw: false
        }
    });
    if (stop == false) {
        requestAnimationFrame(update);
    } else {
        stop = false;
    }
}

function stopAnimation() {
    stop = true;
    Plotly.animate(plt0, [], {
        mode: 'next'
    });
}


// Interactive interfaces
NSlider.on('change', function () {
    N = NSlider.bootstrapSlider('getValue');  // Get new "global" value

    $('#NSliderVal').text(N);
});

EfSlider.on('change', function () {
    Ef = EfSlider.bootstrapSlider('getValue');  // Get new "global" value

    $('#EfSliderVal').text(Ef);
});

tauSlider.on('change', function () {
    tau = tauSlider.bootstrapSlider('getValue');  // Get new "global" value

    $('#tauSliderVal').text(tau);
});

ExSlider.on('change', function () {
    Ex = ExSlider.bootstrapSlider('getValue');  // Get new "global" value

    $('#ExSliderVal').text(Ex);
});

EySlider.on('change', function () {
    Ey = EySlider.bootstrapSlider('getValue');  // Get new "global" value

    $('#EySliderVal').text(Ey);
});

BzSlider.on('change', function () {
    Bz = BzSlider.bootstrapSlider('getValue');  // Get new "global" value

    $('#BzSliderVal').text(Bz);
});