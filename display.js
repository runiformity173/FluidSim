const canvas = document.getElementById("output");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");


function displayGrid() {
    for (let i = 0; i < 128; i++) { // down
        for (let j = 0; j < 128; j++) { // across
            const [vy,vx] = getVelocityAtPosition(GRID_HEIGHT/128*i+0.5, GRID_WIDTH/128*j+0.5);
            ctx.beginPath();
            ctx.fillStyle = `rgb(${vy*100}, ${vx*100}, 100)`;
            ctx.arc(i*4, j*4, 1.5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
displayGrid();