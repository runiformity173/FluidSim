const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const GRAVITY_ACCELERATION = 9.8;
const OVERRELAXATION_COEFFICIENT = 1.5;
const ADVECTION_STEPS = 2;

const HORIZONTAL_OFFSET = (GRID_HEIGHT+1)*GRID_WIDTH
const OVERALL_LENGTH = HORIZONTAL_OFFSET + GRID_HEIGHT*(GRID_WIDTH+1);
// vertical ranges include height, horizontal ranges include width.
let GRID;

function constructGrid() {
    GRID = new Float32Array(OVERALL_LENGTH);
    for (let row = 0; row <= GRID_HEIGHT; row++) {
        for (let col = 0; col <= GRID_WIDTH; col++) {
            if (row < GRID_HEIGHT) {
                GRID[HORIZONTAL_OFFSET + row*(GRID_WIDTH+1)+col] = 0.0;
            }
            if (col < GRID_WIDTH) {
                GRID[row*GRID_WIDTH+col] = 0.0;
            }
        }
    }
}
function canSideMove(row,col,dir) {
    return !(
        dir == 0 && row == 0 ||
        dir == 3 && col == 0 ||
        dir == 2 && row == GRID_HEIGHT-1 ||
        dir == 1 && col == GRID_WIDTH-1
    )
}

function getCellData(row, col) {
    const up = GRID[row*GRID_WIDTH+col];
    const down = GRID[(row+1)*GRID_WIDTH+col];
    const left = GRID[HORIZONTAL_OFFSET + row*(GRID_WIDTH+1)+col];
    const right = GRID[HORIZONTAL_OFFSET + row*(GRID_WIDTH+1)+col+1];
    return [up, right, down, left];
}

// currently doesn't check for validity
function modifyCellVelocity(row, col, dir, dv, grid) {
    if (dir == 1) col++;
    if (dir == 2) row++;
    const index = dir%2==0 ? row*GRID_WIDTH+col: HORIZONTAL_OFFSET+row*(GRID_WIDTH+1)+col;
    grid[index] = dv;
}

function getVelocityAtPosition(y, x) {
    const row = Math.floor(y);
    const col = Math.floor(x);
    const [up, right, down, left] = getCellData(row, col);
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

function stepFluid(dt) {
    let newGrid = new Float32Array(OVERALL_LENGTH);
    // Outside forces
    // loop through vertical velocities
    for (let row = 0; row <= GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            GRID[row*GRID_WIDTH+col] -= GRAVITY_ACCELERATION*dt;
        }
    }
    // Incompressibility
    // loop through cells
    for (let row = 0; row < GRID_WIDTH; row++) {
        for (let col = 0; col < GRID_HEIGHT; col++) {
            const cellData = getCellData(row, col);
            const correctionFactor = [0,0,0,0]; // 0 if blocked, 1 if flowing in, -1 if flowing out
            let denom = 0;
            let divergence = 0;
            for (let dir = 0; dir < 4; dir++) {
                if (canSideMove(row,col,dir)) {
                    correctionFactor[dir] = dir % 3 == 0 ? 1 : -1;
                    denom+=1;
                    divergence += correctionFactor[dir]*cellData[dir];
                }
            }
            if (denom == 0) continue;
            const divergencePerDirection = OVERRELAXATION_COEFFICIENT*divergence/denom;
            for (let dir = 0; dir < 4; dir++) {
                modifyCellVelocity(row,col,dir,cellData[dir]-divergencePerDirection, newGrid);
            }
        }
    }
    GRID = newGrid;
    newGrid = new Float32Array(OVERALL_LENGTH);
    // Advection
    for (let row = 0; row <= GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            newGrid[GRID_WIDTH*row+col] = calculateAdvection(row, col+0.5, dt)[1];
        }
    }
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col <= GRID_WIDTH; col++) {
            newGrid[HORIZONTAL_OFFSET+(GRID_WIDTH+1)*row+col] = calculateAdvection(row+0.5, col, dt)[0];
        }
    }
    GRID = newGrid;
}

constructGrid();

// maybe exempt bottom row from gravity because bottom has to be 0?
// Definitely need to work out what happens when the same edge acted on twice during divergence. Currently overrides.
