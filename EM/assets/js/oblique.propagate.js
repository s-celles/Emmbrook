/**
 * Created by Qi on 6/9/17.
 */

var spatialX = 20;  // Spatial physical size
var spatialZ = 20;  // Spatial physical size
var nx = 200;  // Spatial grid size
var nz = 200;  // Spatial grid size
var xStep = spatialX / nx;
var zStep = spatialZ / nz;

// Basic interfaces
function sqr(x) {
    return Math.pow(x, 2)
}

function dist2(v, w) {
    /*
     Calculate 2D distance between 2 points v and w.
     */
    return Math.sqrt(sqr(v.x - w.x) + sqr(v.z - w.z))
}

function dist2PointToSegment(u, v, w) {
    /*
     Calculate 2D distance between a point u and a line segment vw.
     */
    var lwv = dist2(w, v);
    var luv = dist2(u, v);
    if (lwv === 0 || luv === 0) {  // Remember to include both
        return luv
    }

    var cosTheta = ((u.x - v.x) * (w.x - v.x) + (u.z - v.z) * (w.z - v.z)) / (lwv * luv);  // Cosine of angle between 2 segments
    var sinTheta = Math.sqrt(1 - sqr(cosTheta));  // Sine of angle between 2 segments
    return luv * sinTheta
}

function generate2DGrid(gridXDimesion, gridZDimesion) {
    var grid = [];

    for (var i = 0; i < gridXDimesion; i++) {
        grid[i] = [];
        for (var j = 0; j < gridZDimesion; j++) {
            grid[i][j] = {
                x: i * xStep,  // Normalize grid x coordinate
                z: j * zStep,  // Normalize grid z coordinate
                eFieldIncidentIntens: 0
            };
        }
    }
    return grid
}

function roundPoint(u) {
    /*
     Snap a point to its nearest grid square
     */
    return [Math.round(u.x), Math.round(u.y)];
}

function generateEndPointOfRay(startPoint, theta) {
    var edgePoint = [0, startPoint.y];

}

function generateDecayFactor(u, v, w) {
    /*
     The electric field intensity I decays as exp(-r^2), where r is the radial distance of point u from line vw.
     */
    var r = dist2PointToSegment(u, v, w);
    return Math.exp(-sqr(r));
}

function assignDecayFactor(grid, v, w) {
    /*
     Assign each grid point an electric field intensity, according to its distance from line vw.
     */
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[0].length; j++) {
            var u = grid[i][j];
            var d = generateDecayFactor(u, v, w);
            u.eFieldIncidentIntens = 1 * d;  // The intensity on line segment vw is 1
        }
    }
    return grid
}

function geteFieldIncidentIntens(grid, gridXOffset, gridZOffset) {
    var intens = [];

    for (var i = 0; i < nx; i++) {
        intens[i] = [];
        for (var j = 0; j < nz; j++) {
            intens[i][j] = 0
        }
    }

    for (i = 0; i < grid.length; i++) {
        for (j = 0; j < grid[0].length; j++) {
            intens[i + gridXOffset][j + gridZOffset] += grid[i][j].eFieldIncidentIntens
        }
    }
    return intens
}

function eFieldReflectIntens(eFieldIncidentIntens) {
    return sqr(reflectRatios * eFieldIncidentIntens)
}

function eFieldTransmitIntens(eFieldIncidentIntens) {
    return sqr(transmitRatios * eFieldIncidentIntens)
}

// Plot
function createPlot() {

    var incidenthm = {
        x: numeric.linspace(0, spatialX, nx),
        y: numeric.linspace(0, spatialZ, nz),
        z: geteFieldIncidentIntens(incidentGrid, nx / 2, 0),
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
var incidentGrid = generate2DGrid(nx / 2, nz / 2);
var physicalGrid = generate2DGrid(nx, nz);
assignDecayFactor(incidentGrid,
    incidentGrid[0][incidentGrid.length - 1],
    incidentGrid[incidentGrid.length - 1][0]);
createPlot();