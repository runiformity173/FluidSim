const canvas = document.getElementById("output");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");


function displayGrid() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let i = 0; i < 128; i++) { // down
        for (let j = 0; j < 128; j++) { // across
            const [vx,vy] = getVelocityAtPosition(1+(GRID_HEIGHT-2)/128*i, 1+(GRID_WIDTH-2)/128*j);
            ctx.beginPath();
            ctx.fillStyle = `hsl(${Math.atan2(vy,vx)/Math.PI*180}deg ${Math.hypot(vx,vy)*20} 50)`;
            ctx.arc(j*4, i*4, 1.5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
displayGrid();