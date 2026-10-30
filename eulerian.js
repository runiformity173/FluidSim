const GRID_WIDTH = 12;
const GRID_HEIGHT = 12;
const GRAVITY_ACCELERATION = 0; // 9.8;
const INCOMPRESSIBILITY_ITERATIONS = 2;
const OVERRELAXATION_COEFFICIENT = 1; // 1.5
const ADVECTION_STEPS = 2;

const HORIZONTAL_OFFSET = GRID_HEIGHT*GRID_WIDTH
const OVERALL_LENGTH = HORIZONTAL_OFFSET*2;
let GRID = new Float32Array(OVERALL_LENGTH);

function getVelocityAtPosition(y, x) {
    const row = Math.floor(y);
    const col = Math.floor(x);
    const up = GRID[(row-1)*GRID_WIDTH+col];
    const down = GRID[row*GRID_WIDTH+col];
    const left = GRID[HORIZONTAL_OFFSET + row*GRID_WIDTH+col-1];
    const right = GRID[HORIZONTAL_OFFSET + row*GRID_WIDTH+col];
    return [(x-col)*right + (1-x+col)*left, (y-row)*down + (1-y+row)*up];
}

function calculateAdvection(y, x, dt) {
    for (let i = 0; i < ADVECTION_STEPS; i++) {
        const [vx,vy] = getVelocityAtPosition(y, x);
        y = y-vy*dt/ADVECTION_STEPS;
        x = x-vx*dt/ADVECTION_STEPS;
    }
    return getVelocityAtPosition(y, x);
}

function solveIncompressibility() {
    for (let iter = 0; iter < INCOMPRESSIBILITY_ITERATIONS; iter++) {
        const newGrid = new Float32Array(GRID);
        for (let row = 1; row < GRID_WIDTH-1; row++) {
            for (let col = 1; col < GRID_HEIGHT-1; col++) {
                const up = GRID[(row-1)*GRID_WIDTH+col];
                const down = GRID[row*GRID_WIDTH+col];
                const left = GRID[HORIZONTAL_OFFSET + row*GRID_WIDTH+col-1];
                const right = GRID[HORIZONTAL_OFFSET + row*GRID_WIDTH+col];
                const divergence = up+left-right-down;
                newGrid[(row-1)*GRID_WIDTH] -= divergence/4;
                newGrid[row*GRID_WIDTH] += divergence/4;
                newGrid[HORIZONTAL_OFFSET + row*GRID_WIDTH+col-1] -= divergence/4;
                newGrid[HORIZONTAL_OFFSET + row*GRID_WIDTH+col] += divergence/4;
            }
        }
        GRID = newGrid;
    }
}

function stepFluid(dt) {
    // Outside forces
    // loop through vertical velocities
    for (let row = 0; row <= GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            GRID[row*GRID_WIDTH+col] += GRAVITY_ACCELERATION*dt;
        }
    }
    // Incompressibility
    // loop through cells
    solveIncompressibility();

    const newGrid = new Float32Array(OVERALL_LENGTH);
    // Advection
    // Loop through velocities
    for (let row = 1; row < GRID_HEIGHT-1; row++) {
        for (let col = 1; col < GRID_WIDTH-1; col++) {
            newGrid[GRID_WIDTH*row+col] = calculateAdvection(row+0.5, col, dt)[1];
            newGrid[HORIZONTAL_OFFSET + GRID_WIDTH*row+col] = calculateAdvection(row, col+0.5, dt)[0];
        }
    }
    GRID = newGrid;
}


GRID[25] = 10;

// maybe exempt bottom row from gravity because bottom has to be 0?
// Definitely need to work out what happens when the same edge acted on twice during divergence. Currently overrides.
