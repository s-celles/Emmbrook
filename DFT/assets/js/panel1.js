/**
 * Created by Qi on 5/30/17.
 */

// Variables
var phaseSlider = $('#myPhase')
    .bootstrapSlider({});
var ampSlider = $('#myAmplitude')
    .bootstrapSlider({});
var freqSlider = $('#myFreq')
    .bootstrapSlider({});
var phase = phaseSlider.bootstrapSlider('getValue');
var amplitude = ampSlider.bootstrapSlider('getValue');
var frequency = freqSlider.bootstrapSlider('getValue');
var plt = document.getElementById('plt');

var xv = numeric.linspace(0, 10, 201);
var yv = new Array(xv.length);
var yPoints = numeric.sin(numeric.mul(2.2, xv));

function yvUpdate() {
    /*
     yv will change when amplitude, phase, or frequency changes.
     */
    yv = numeric.mul(amplitude,
        numeric.sin(numeric.add(phase, numeric.mul(frequency, xv))));
}

function plot() {
    plt.data[0].y = yv;
    Plotly.redraw(plt);
}

function createPlot() {
    var layout = {
        margin: {
            t: 0
        },
        yaxis: {
            title: 'Height Y (m)',
            titlefont: {
                size: 18
            }
        },
        xaxis: {
            title: 'Time t (s)',
            titlefont: {
                size: 18
            }
        }
    };

    var data = [{
            x: xv,
            y: yv,
            type: 'scatter',
            mode: 'lines',
            name: 'fit'
        },
        {
            x: xv,
            y: yPoints,
            type: 'scatter',
            mode: 'markers',
            name: 'data'
        }
    ];

    Plotly.newPlot(plt, data, layout);
}

phaseSlider.on('change', function () {
    phase = phaseSlider.bootstrapSlider('getValue'); // Change "global" value
    yvUpdate();
    plot();

    $('#phaseSliderVal')
        .text(phase);
});

ampSlider.on('change', function () {
    amplitude = ampSlider.bootstrapSlider('getValue'); // Change "global" value
    yvUpdate();
    plot();

    $('#ampSliderVal')
        .text(amplitude);
});

freqSlider.on('change', function () {
    frequency = freqSlider.bootstrapSlider('getValue'); // Change "global" value
    yvUpdate();
    plot();

    $('#freqSliderVal')
        .text(frequency);
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt);
};

// Initialize
yvUpdate();
createPlot();
$('#phaseSliderVal')
    .text(phase);
$('#ampSliderVal')
    .text(amplitude);
$('#freqSliderVal')
    .text(frequency);
