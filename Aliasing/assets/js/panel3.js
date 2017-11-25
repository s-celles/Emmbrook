var q_e = 1.602 * math.pow(10, -19);
var pi = 3.14152695;
var hbar = 1.05 * math.pow(10, -34);
var DE_A = 1 * q_e;
var T = 300;
var N_A = [];
var p = [];
var N_C = 0;
var N_V = 0;
var E_C = 0;
var E_V = 0;

var m_e = 9.11 * math.pow(10, -31);
var m_h = 0.81 * m_e;
var kb = 1.38 * math.pow(10, -23);
var Q, N_V;
var mu;

function calcN_CV(t, m) {
    var eq = .0449 * math.pow(kb * t * 2 * m * m_e / math.pow(hbar, 2), 3 / 2);
    return eq
    //var eq = 2 * pi * math.pow(hbar, 2);
    //eq = m * m_e * kb * t / eq;
    //return 2 * math.pow(eq, 3 / 2)
}

function calcQ(dea, t) {
    var eq = -dea / (kb * t);
    return math.exp(eq);
}

function calcp(nv, q, na) {
    var eq = 4 * na / (q * nv);
    if (na < .00001 * q * nv) {
        return na;
    } else {
        eq = math.sqrt(1 + eq);
        eq = eq - 1;
        return q * N_V / 2 * eq;
    }
}

function calcmu(t, nv, p) {
    return kb * t * math.log(nv / p);
}

function paramUpdate(c, v) {
    //Updates control panel and variables
    switch (c) {
        case 0:
            document.querySelector('#eaBox').value = v;
            DE_A = parseFloat(v) * q_e;
            initialize();
            break;
        case 1:
            document.querySelector('#tBox').value = v;
            T = parseFloat(v);
            initialize();
            break;
    }
}

function initialize() {
    N_A = [];
    N_V = calcN_CV(T, 1.15);
    N_C = calcN_CV(T, 1);
    Q = calcQ(DE_A, T);
    for (i = 0; i < 60; i += .5) {
        N_A.push(math.exp(i));
    }
    createPlots();
}


function createPlots() {
    P = [];
    mu = [];
    for (i = 0; i < N_A.length; i++) {
        P.push(calcp(N_V, Q, N_A[i]));
        mu.push(calcmu(T, N_V, P[i]));
    }
    var layout0 = {
        margin: {
            t: 20,
            l: 60,
            r: 20,
        },
        yaxis: {
            title: 'log <i>p</i> (cm<sup>-3</sup>)',
            type: 'log'
        },
        xaxis: {
            title: 'log <i>N<sub>A</sub></i> (cm<sup>-3</sup>)',
            type: 'log'
        }
    };

    var layout1 = {
        margin: {
            t: 20,
            l: 90,
            r: 20,
        },
        xaxis: {
            title: '<i>p</i> (cm<sup>-3</sup>)'
        },
        yaxis: {
            title: 'Fermi Level (eV)'
        },
    };

    var data0 = [{
        x: N_A,
        y: P,
        type: 'scatter',
        mode: 'lines+markers',
        name: "Potential"
    }];

    var data1 = [{
        x: P,
        y: mu,
        type: 'scatter',
        mode: 'markers',
        marker: {
            size: 8,
            color: 'blue'
        }
    }];

    plt0 = document.getElementById('plt0');
    plt1 = document.getElementById('plt1');

    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}
