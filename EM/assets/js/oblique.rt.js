/**
 * Created by Qi on 6/9/17.
 */

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

    Plotly.newPlot(plt1, data, layout)
}

// Initialize
updateHeatmapValues();
createHeatmapPlot();