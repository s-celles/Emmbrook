/**
 * Created by Qi on 6/9/17.
 */

var thetaIList = numeric.linspace(0, Math.PI / 2, 500);

function updateRatioValues() {
    var alphaList = thetaIList.map(function (tI) {
        return Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(tI), 2)) / Math.cos(tI)
    });
    var beta = n1 / n2 * epsilon2 / epsilon1;
    var t = alphaList.map(function (alpha) {
        return 2 / (alpha + beta)
    });
    var r = alphaList.map(function (alpha) {
        return (alpha - beta) / (alpha + beta)
    });
    return [r, t]
}

// Plot
function plotRatios() {
    [reflectRatio, transmitRatio] = updateRatioValues();
    plt1.data[0].y = reflectRatio;
    plt1.data[1].y = transmitRatio;
    Plotly.redraw(plt1)
}

function createRatioPlot() {
    var layout = {
        title: 'reflection and transmission ratio',
        xaxis: {
            title: 'theta_I',
            titlefont: {
                size: 18
            },
            tickmode: 'array',
            tickvals: [0, Math.PI / 12, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2],
            ticktext: ['0', 'pi/12', 'pi/6', 'pi/4', 'pi/3', 'pi/2']
        },
        yaxis: {
            title: 'Ratio',
            titlefont: {
                size: 18
            }
        }
    };

    var data = [
        {x: thetaIList, y: reflectRatio, type: 'scatter', mode: 'lines', name: 'r'},
        {x: thetaIList, y: transmitRatio, type: 'scatter', mode: 'lines', name: 't'}
    ];

    Plotly.newPlot(plt1, data, layout)
}

// Initialize
updateRatioValues();
createRatioPlot();
plotRatios();