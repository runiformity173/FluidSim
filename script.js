function step() {
    fluid.stepFluid(0.2);
    displayGrid();
}
setInterval(step, 200);