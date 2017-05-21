/**
 * Created by Qi on 5/20/17.
 */

function freqUpdate(q) {
    document.querySelector('#freqBox').value = q;
    myFunction();
}
function ampUpdate(q) {
    document.querySelector('#ampBox').value = q;
    myFunction();
}
function phaseUpdate(q) {
    document.querySelector('#phsBox').value = q;
    myFunction();
}

xv = numeric.linspace(0, 10, 201);
fval0 = Number(document.getElementById("myFreq").value);
yv = numeric.sin(numeric.mul(fval0, xv));

ypts = numeric.sin(numeric.mul(2.2, xv));

function myFunction() {
    var fval1 = document.getElementById("myFreq").value;
    var phsval1 = document.getElementById("myPhase").value;
    var ampval1 = document.getElementById("myAmp").value;
    freq = Number(fval1);
    phs = Number(phsval1);
    amp = Number(ampval1);
    yv = numeric.mul(amp, numeric.sin(numeric.add(phs, numeric.mul(freq, xv))));
    TESTER.data[0].y = yv;
    Plotly.redraw(TESTER)
}

var layout1 = {
    margin: {t: 0},
    yaxis: {title: 'Height Y (m)', titlefont: {size: 36}},
    xaxis: {title: 'Time t (s)', titlefont: {size: 36}}
};

var data0 = [{x: xv, y: yv, type: 'scatter', mode: 'lines', name: 'fit'}, {
    x: xv,
    y: ypts,
    type: 'scatter',
    mode: 'markers',
    name: 'data'
}];

TESTER = document.getElementById('tester');
Plotly.newPlot(TESTER, data0, layout1);