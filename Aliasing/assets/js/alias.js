var pi = math.PI;
var nc = 1000;
var ns = 20;

// Plot 1 Variables
var xc = [];
var yc = new Array(nc);
var yd = [];
var yda = [];
var k = 0;

// Plot 2 Variables
var k_x = [];
var k_y = [];
var k_plt = [];
var ka = null;
var k_a = [];
var bzp_x = [];
var bzp_y = [];
var bzm_x = [];
var bzm_y = [];

// Sets frequency to input
function getFrequency() {
    k = Number(document.querySelector('#freqBox').value);
}

//Updates value displayed on slider
function freqUpdate(q) {
    document.querySelector('#freqBox').value = q;
    doRecalc();
}

//Initializes Plots
function initial() {
    for (i = -ns; i <= ns; i++) {
        k_x.push(i);
        k_y.push(0);
    }
    for (i = -.2; i <= .2; i += .05) {
        bzp_x.push(ns / 2);
        bzp_y.push(i);
        bzm_x.push(-ns / 2);
        bzm_y.push(i);
    }
    valsUpdate();
    createPlots();
}

function doRecalc() {
    getFrequency();
    valsUpdate();
    createPlots();
}

function valsUpdate() {
    k_x = [];
    k_y = [];
    k = document.querySelector('#freqBox').value;
    k_plt = [k];
    ka = null;
    //Updates Wavefom
    xc = nj.arange(0., 1., 1. / nc).tolist();
    for (i = 0; i < (nc + 1); i++) {
        yc[i] = math.cos(2 * pi * k * xc[i])
    }
    // Updates Sampled
    xd = nj.arange(0., 1., 1. / ns).tolist();
    for (i = 0; i < (ns + 1); i++) {
        yd[i] = math.cos(2 * pi * k * xd[i])
    }
    //Updates Aliased
    if (k > ns / 2) {
        ka = k - ns;
        k_a = [ka];
        for (i = 0; i < (nc + 1); i++) {
            yda[i] = math.cos(2 * pi * ka * xc[i])
        }
    } else if (k < -ns / 2) {
        ka = parseInt(k) + ns;
        k_a = [ka];
        for (i = 0; i < (nc + 1); i++) {
            yda[i] = math.cos(2 * pi * ka * xc[i])
        }
    }
    else {
        yda = [];
        k_a = [];
    }
    //Updates k space plot
    for (i = -ns; i <= ns; i++) {
        k_x.push(i);
        k_y.push(0);
    }
}

function plotDataUpdate() {
    plt0.data[0].x = xc;
    plt0.data[0].y = yc;
}

function plotRedraw() {
    Plotly.redraw(plt0);
}

function createPlots() {
    var layout0 = {
        margin: {
            t: 0,
            b: 100
        },
        yaxis: {
            title: '<i>X<sub>k</sub></i>',
            titlefont: {
                size: 24
            }
        },
        xaxis: {
            title: '<i>ja</i>',
            titlefont: {
                size: 24
            }
        }
    };

    var layout1 = {
        title: "<i>k</i> Space",
        titlefont: {
            size: 20
        },
        margin: {
            t: 100
        },
        xaxis: {
            title: '<i>k</i>'
        },
        yaxis: {
            visible: false
        },
    };

    var data0 = [
        {
            x: xc,
            y: yc,
            type: 'scatter',
            mode: 'lines',
            name: 'Waveform'
        },
        {
            x: xd,
            y: yd,
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 10
            },
            name: 'Sampled'
        },
        {
            x: xc,
            y: yda,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'green',
                dash: 'dash',
            },
            name: 'Aliased'
        }
    ];

    var data1 = [
        {
            x: k_x,
            y: k_y,
            type: 'scatter',
            mode: 'markers',
            marker: {
                symbol: 'circle-open',
                size: 10,
            },
            name: "k Values"
        },
        {
            x: k_plt,
            y: [0],
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
                color: 'blue'
            },
            name: "<i>k</i>"
        },
        {
            x: k_a,
            y: [0],
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
            },
            name: "<i>k Aliased</i>"
        },
        {
            x: bzp_x,
            y: bzp_y,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red'
            },
            name: "<br>First Brillouin Zone"
        },
        {
            x: bzm_x,
            y: bzm_y,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red'
            },
            name: ""
        },
    ];

    plt0 = document.getElementById('plt0');
    plot1 = document.getElementById('plt1');
    Plotly.newPlot(plt0, data0, layout0);
    Plotly.newPlot(plt1, data1, layout1);
}
