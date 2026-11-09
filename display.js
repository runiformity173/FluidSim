const canvas = document.getElementById("output");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");

function displayGrid() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let i = 0; i < 128; i++) { // down
        for (let j = 0; j < 128; j++) { // across
            const smoke = 1-fluid.getSmokeAtPosition(1+(GRID_HEIGHT-2)/128*i+1, 1+(GRID_WIDTH-2)/128*j);
            ctx.beginPath();
            ctx.fillStyle = `rgb(${smoke*255}, ${smoke*255}, ${smoke*255})`;
            ctx.arc(j*4, i*4, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
displayGrid();