/**
 * Created by Qi on 6/9/17.
 */

var thetaIList = numeric.linspace(0, Math.PI / 2, 200);


// Main interfaces
function updateRatioValues(tI) {
    /*
     Accept an incident angle tI, return the reflection ratio and transmission ratio.
     */
    var alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(tI), 2)) / Math.cos(tI);
    var beta = n1 / n2 * epsilon2 / epsilon1;
    var t = 2 / (alpha + beta);
    var r = (alpha - beta) / (alpha + beta);
    return [r, t]
}

function updateRatioLists() {
    /*
     Return: An array of [[r0, r1, ...], [t0, t1, ...]].
     */
    return numeric.transpose(thetaIList.map(updateRatioValues))  // Defined in oblique.main.js
}

function updateBrewsterAngle() {
    /*
     Brewster angle changes when n1, n2 changes.
     */
    epsilon1 = Math.pow(n1, 2);
    epsilon2 = Math.pow(n2, 2);
    return Math.atan(n1 / n2 * epsilon2 / epsilon1)
}


// Plot
function plotRatios() {
    /*
     Make 2 "ratios" points move as their real values.
     */
    plt1.data[2].x = [thetaI, thetaI];
    plt1.data[2].y = updateRatioValues(thetaI);
    Plotly.redraw(plt1)
}

function plotRatioLists() {
    /*
     Re-plot 2 curves.
     */
    plt1.data[0].y = reflectRatioList;

    plt1.data[1].y = transmitRatioList;
    Plotly.redraw(plt1)
}

function plotBrewsterAngle() {
    plt1.data[3].x = [updateBrewsterAngle()];
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
        {
            x: thetaIList,
            y: reflectRatioList,
            type: 'scatter',
            mode: 'lines',
            name: 'r'
        },
        {
            x: thetaIList,
            y: transmitRatioList,
            type: 'scatter',
            mode: 'lines',
            name: 't'
        },
        {
            x: [thetaI, thetaI],
            y: updateRatioValues(thetaI),
            type: 'scatter',
            mode: 'markers',
            name: 'ratios'
        },
        {
            x: [updateBrewsterAngle()],
            y: [0],
            type: 'scatter',
            mode: 'markers',
            name: 'Brewster angle'
        }
    ];

    Plotly.newPlot(plt1, data, layout)
}


// Initialize
[reflectRatioList, transmitRatioList] = updateRatioLists();
createRatioPlot();
