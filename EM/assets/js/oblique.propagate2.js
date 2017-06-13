/**
 * Created by Qi on 6/12/17.
 */

var spatialX = 1;  // Spatial physical size
var spatialZ = 1;  // Spatial physical size
var nx = 200;  // Spatial grid size
var nz = 200;  // Spatial grid size

function generate2DGrid(gridXDimesion, gridZDimesion) {
    var grid = [];

    for (var i = 0; i < gridXDimesion; i++) {
        grid[i] = [];
        for (var j = 0; j < gridZDimesion; j++) {
            grid[i][j] = {
                x: i / nx,  // Normalize grid x coordinate
                z: j / nz,  // Normalize grid z coordinate
                eFieldIntens: 0
            };
        }
    }
    return grid
}

function generateLight(grid, slope, intens) {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[0].length; j++) {
            var cond = grid[i][j].z - slope * grid[i][j].x;
            if (-0.1 < cond && cond < 0.1) {
                grid[i][j].eFieldIntens = intens;
            }
        }
    }
}

function getEFieldIntens(grid) {
    var intens = [];

    for (var i = 0; i < grid.length; i++) {
        intens[i] = [];
        for (var j = 0; j < grid[0].length; j++) {
            intens[i][j] = grid[i][j].eFieldIntens;
        }
    }

    return intens
}

// Plot
function createPlot() {

    var incidenthm = {
        x: numeric.linspace(-spatialX, spatialX, nx),
        y: numeric.linspace(-spatialZ, spatialZ, nz),
        z: getEFieldIntens(incidentGrid),
        type: 'heatmap',
        colorscale: 'Viridis'
    };

    var reflecthm = {
        x: numeric.linspace(-spatialX, spatialX, 2 * nx),
        y: numeric.linspace(-spatialZ, spatialZ, 2 * nz),
        z: getEFieldIntens(reflectGrid),
        type: 'heatmap',
        colorscale: 'Viridis'
    };

    var data = [incidenthm];

    var layout = {
        title: 'E filed intensity',
        xaxis: {
            title: 'x',
            fontsize: 18
        },
        yaxis: {
            title: 'z',
            fontsize: 18
        }
    };

    Plotly.newPlot('plt0', data, layout)
}

// Initialize
var incidentGrid = generate2DGrid(nx, nz);
var reflectGrid = generate2DGrid(nx, nz);
generateLight(incidentGrid, -2, 1);
generateLight(reflectGrid, -1, 0.5);
createPlot();