let STOP = false;

function step() {
    if (STOP) return;
    fluid.stepFluid(0.1);
    displayGrid();
    requestAnimationFrame(step);
}
step();