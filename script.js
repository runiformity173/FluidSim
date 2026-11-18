let STOP = false;

const fluid = new EulerianSimulation(GRID_WIDTH, GRID_HEIGHT, GRAVITY_ACCELERATION);
fluid.vortexSheddingSetup();
setObstacle(40,50,OBSTACLE,true,1/60);

function step() {
    if (STOP) return;
    fluid.stepFluid(1/60);
    displayGrid();
    requestAnimationFrame(step);
}