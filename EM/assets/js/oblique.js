/**
 * Created by Qi on 5/27/17.
 */

// Variables
var n1Slider = $('#n1').bootstrapSlider();
var n2Slider = $('#n2').bootstrapSlider();
var thetaISlider = $('#thetaI').bootstrapSlider();
var n1 = n1Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var thetaI = thetaISlider.bootstrapSlider('getValue');

var epsilon1 = Math.pow(n1, 2);  // Permittivity
var epsilon2 = Math.pow(n2, 2);  // Permittivity
var alpha, beta, t, r, thetaIList;
var plt = document.getElementById('plt');

// Basic interfaces
function updateValues(thetaI) {
    alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(thetaI), 2)) / Math.cos(thetaI);
    beta = n1 / n2 * epsilon2 / epsilon1;
    t = 2 / (alpha + beta);  // Transmission amplitude
    r = (alpha - beta) / (alpha + beta);  // Reflection amplitude
}

function updateHeatmapValues() {
    thetaIList = numeric.linspace(0, Math.PI / 2, 500);
    var alpList = thetaIList.map(function (thetaI) {
        return Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(thetaI), 2)) / Math.cos(thetaI)
    });
    beta = n1 / n2 * epsilon2 / epsilon1;
    t = alpList.map(function (alp) {
        return 2 / (alp + beta)
    });
    r = alpList.map(function (alp) {
        return (alp - beta) / (alp + beta)
    })
}

// Plot
function plot() {
    plt.data[0].y = r;
    plt.data[1].y = t;
    Plotly.redraw(plt)
}

function createHeatmapPlot() {
    var layout = {
        yaxis: {title: 'Ratio', titlefont: {size: 18}},
        xaxis: {title: "\\( \\theta_I \\)", titlefont: {size: 18}}
    };

    var data = [
        {x: thetaIList, y: r, type: 'scatter', mode: 'lines', name: 'r'},
        {x: thetaIList, y: t, type: 'scatter', mode: 'lines', name: 't'}
    ];

    Plotly.newPlot(plt, data, layout)
}


// Interactive interfaces
thetaISlider.on('slideStop', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');

    $('thetaISliderVal').text(thetaI)
});

n1Slider.on('slideStop', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    updateHeatmapValues();
    plot();

    $('n1SliderVal').text(n1)
});

n2Slider.on('slideStop', function () {
    n2 = n1Slider.bootstrapSlider('getValue');
    updateHeatmapValues();
    plot();

    $('n2SliderVal').text(n2)
});

// Initialize
updateHeatmapValues();
createHeatmapPlot();