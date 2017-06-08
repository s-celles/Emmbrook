/**
 * Created by Qi on 6/8/17.
 */

// Variables
var nc = 1000;
var ns = 20;
var xc = nj.arange(0., 1., 1. / nc).tolist();
var xd = nj.arange(0., 1., 1. / ns).tolist();
var yc = new Array(xc.length);
var yc2 = new Array(xd.length);
var yd = new Array(xd.length);

var kSlider = $('#k').bootstrapSlider({});
var k = kSlider.bootstrapSlider('getValue');
var plt = document.getElementById('plt');

// Basic interfaces
function ycUpdate() {
    /*
     yc will change when k changes.
     */
    for (var i = 0; i < (nc + 1); i++) {
        yc[i] = Math.cos(2 * Math.PI * k * xc[i])
    }
}

function ydUpdate() {
    /*
     yd will change when k changes.
     */
    for (var i = 0; i < (ns + 1); i++) {
        yd[i] = Math.cos(2 * Math.PI * k * xd[i])
    }
}

function yc2Update() {
    /*
     yc2 will change when k changes.
     */
    if (k > ns / 2) {
        for (var i = 0; i < (nc + 1); i++) {
            yc2[i] = Math.cos(2 * Math.PI * (k - ns) * xc[i])
        }
    } else if (k < -ns / 2) {
        for (var j = 0; j < (nc + 1); j++) {
            yc2[j] = Math.cos(2 * Math.PI * (k + ns) * xc[j])
        }
    }
    else {
        yc2 = [];
    }
}

// Plot
function createPlot() {
    var layout = {
        margin: {
            t: 0
        },
        yaxis: {
            title: 'X_k',
            titlefont: {
                size: 18
            }
        },
        xaxis: {
            title: 'ja',
            titlefont: {
                size: 18
            }
        }
    };

    var data = [
        {
            x: xc,
            y: yc,
            type: 'scatter',
            mode: 'lines',
            name: 'Waveform'
        },
        {
            x: xc,
            y: yc2,
            type: 'scatter',
            mode: 'lines',
            name: 'Aliased'
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
        }
    ];

    Plotly.newPlot(plt, data, layout);
}

function plot() {  // Redraw
    plt.data[0].y = yc;

    plt.data[1].y = yc2;

    plt.data[2].y = yd;
    Plotly.redraw(plt);
}

// Interactive interfaces
kSlider.on('change', function () {
    k = kSlider.bootstrapSlider('getValue');  // Get new "global" value
    ycUpdate();
    yc2Update();
    ydUpdate();
    plot();

    $('#kSliderVal').text(k)
});

// Adjust Plotly's plot size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt);
};

// Initialize
ycUpdate();
ydUpdate();
yc2Update();
createPlot();
$('#kSliderVal').text(k);