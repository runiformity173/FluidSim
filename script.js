function step() {
    stepFluid(0.1);
    displayGrid();
}
setInterval(step, 200);