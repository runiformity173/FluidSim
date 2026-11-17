const canvas = document.getElementById("output");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");

function displayGrid() {
    const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    for (let i = 0; i < canvas.height; i++) { // down
        for (let j = 0; j < canvas.width; j++) { // across
            const smoke = 1-fluid.getSmokeAtPosition(1+(GRID_HEIGHT-2)/canvas.height*i+1, 1+(GRID_WIDTH-2)/canvas.width*j);
            const [r,g,b] = [smoke*255,smoke*255,smoke*255];
            imgData.data[4*(i*canvas.width+j)] = r;
            imgData.data[4*(i*canvas.width+j)+1] = g;
            imgData.data[4*(i*canvas.width+j)+2] = b;
            imgData.data[4*(i*canvas.width+j)+3] = 255;
        }
    }
    ctx.putImageData(imgData,0,0);
    ctx.beginPath();
    ctx.fillStyle = `#000000`;
    ctx.arc((OBSTACLE.x-1)/(GRID_WIDTH-2)*512, (OBSTACLE.y-1.5)/(GRID_HEIGHT-2)*512, OBSTACLE.r/(GRID_HEIGHT-2)*512, 0, 2 * Math.PI);
    ctx.fill();
}
displayGrid();