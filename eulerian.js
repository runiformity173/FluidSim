const GRID_WIDTH = 100;
const GRID_HEIGHT = 100;
const GRAVITY_ACCELERATION = 0.0; // 9.8;
const INCOMPRESSIBILITY_ITERATIONS = 40;
const OVERRELAXATION_COEFFICIENT = 1.2; // 1.5
class EulerianSimulation {
    constructor(w,h,g=0.0) {
        this.h = h;
        this.w = w;
        this.g = g;
        this.l = h*w;
        this.down = new Float32Array(this.l);
        this.right = new Float32Array(this.l);
        this.newDown = new Float32Array(this.l);
        this.newRight = new Float32Array(this.l);
        this.smoke = new Float32Array(this.l);
        this.smoke.fill(0.0);
        this.newSmoke = new Float32Array(this.l);
        this.s = new Float32Array(this.l);
        this.s.fill(1.0);
    }
    getVelocityAtPosition(y, x) {
        const row = Math.max(1,Math.min(Math.floor(y),this.h-1));
        const col = Math.max(1,Math.min(Math.floor(x),this.w-1));
        const up = this.down[(row-1)*this.w+col];
        const down = this.down[row*this.w+col];
        const left = this.right[row*this.w+col-1];
        const right = this.right[row*this.w+col];
        return [(x-col)*right + (1-x+col)*left, (y-row)*down + (1-y+row)*up];
    }
    getSmokeAtPosition(y, x) {
        y = Math.max(0.501,Math.min(y,this.h-0.501));
        x = Math.max(0.501,Math.min(x,this.w-0.501));
        const row = Math.floor(y-0.5);
        const col = Math.floor(x-0.5);
        const tl = this.smoke[row*this.w+col];
        const tr = this.smoke[row*this.w+col+1];
        const bl = this.smoke[(row+1)*this.w+col];
        const br = this.smoke[(row+1)*this.w+col+1];
        const top = tl * (1-(x-col-0.5)) + tr * (x-col-0.5);
        const bottom = bl * (1-(x-col-0.5)) + br * (x-col-0.5);
        const mid = top * (1-(y-row-0.5)) + bottom * (y-row-0.5);
        return mid;
    }
    calculateAdvection(y, x, dt) {
        const [vx,vy] = this.getVelocityAtPosition(y, x);
        y = y-vy*dt;
        x = x-vx*dt;
        return this.getVelocityAtPosition(y, x);
    }
    calculateSmokeAdvection(y, x, dt) {
        const [vx,vy] = this.getVelocityAtPosition(y, x);
        x -= vx*dt;
        y -= vy*dt;
        return this.getSmokeAtPosition(y, x);
    }
    solveIncompressibility() {
        for (let iter = 0; iter < INCOMPRESSIBILITY_ITERATIONS; iter++) {
            for (let col = 1; col < this.w-1; col++) {
                for (let row = 1; row < this.h-1; row++) {
                    const up = this.down[(row-1)*this.w+col];
                    const down = this.down[row*this.w+col];
                    const left = this.right[row*this.w+col-1];
                    const right = this.right[row*this.w+col];
                    let divergence = up+left-right-down;
                    divergence *= OVERRELAXATION_COEFFICIENT;
                    let s = this.s[row*this.w+col]+this.s[(row-1)*this.w+col]+this.s[(row+1)*this.w+col]+this.s[row*this.w+col-1]+this.s[row*this.w+col+1]
                    if (s == 0) continue;
                    this.down[(row-1)*this.w+col] -= divergence/s;
                    this.down[row*this.w+col] += divergence/s;
                    this.right[row*this.w+col-1] -= divergence/s;
                    this.right[row*this.w+col] += divergence/s;
                }
            }
        }
    }
    extrapolate() {
        for (let col = 0; col < this.w; col++) {
            this.down[col] = this.down[this.w+col];
            this.down[this.w*(this.h-1)+col] = this.down[this.w*(this.h-2)+col];
        }
        for (let row = 0; row < this.h; row++) {
            this.right[row*this.w] = this.right[row*this.w+1];
            this.right[(row+1)*this.w-1] = this.right[(row+1)*this.w-2];
        }
    }
    vortexSheddingSetup() {
        let v = 1*GRID_WIDTH;
        for (let i = 0; i < this.h; i++) {
            for (let j = 0; j < this.w; j++) {
                let s = 1.0;
                if (i == 0 || j == 0 || i == this.h-1) s = 0.0;
                this.s[i*this.w + j] = s;

                if (j == 1) this.right[i*this.w + j] = v;
            }
        }

        let pipeH = 0.1 * this.h;
        let minJ = Math.floor(0.5 * this.h - 0.5*pipeH);
        let maxJ = Math.floor(0.5 * this.h + 0.5*pipeH);

        for (let j = minJ; j < maxJ; j++) {
            this.smoke[j*this.w] = 1.0;
        }

        // setObstacle(0.4, 0.5, true);
    }
    stepFluid(dt) {
        // Outside forces
        // loop through vertical velocities
        for (let row = 0; row <= this.h; row++) {
            for (let col = 0; col < this.w; col++) {
                this.down[row*this.w+col] += this.g*dt;
            }
        }
        // Incompressibility
        // loop through cells
        this.solveIncompressibility();
        this.extrapolate();
        this.newDown.set(this.down);
        this.newRight.set(this.right);
        // Advection
        // Loop through velocities
        for (let row = 1; row < this.h-1; row++) {
            for (let col = 1; col < this.w-1; col++) {
                if (this.s[row*this.w+col] != 0.0 && this.s[(row-1)*this.w+col] != 0.0 && row < this.h-1) this.newDown[this.w*row+col] = this.calculateAdvection(row+1, col+0.5, dt)[1];
                if (this.s[row*this.w+col] != 0.0 && this.s[row*this.w+col-1] != 0.0 && col < this.w-1) this.newRight[this.w*row+col] = this.calculateAdvection(row+0.5, col+1, dt)[0];
            }
        }
        this.down.set(this.newDown);
        this.right.set(this.newRight);
        // Advect smoke
        this.newSmoke.set(this.smoke);
        for (let row = 1; row < this.h-1; row++) {
            for (let col = 1; col < this.w-1; col++) {
                if (this.s[row*this.w+col] != 0.0)
                    this.newSmoke[this.w*row+col] = this.calculateSmokeAdvection(row+0.5, col+0.5, dt);
            }
        }
        this.smoke.set(this.newSmoke);
    }
}

const fluid = new EulerianSimulation(GRID_WIDTH, GRID_HEIGHT, GRAVITY_ACCELERATION);
fluid.vortexSheddingSetup();