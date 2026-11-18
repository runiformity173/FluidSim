const canvas = document.getElementById("output");
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
buffer.width = GRID_WIDTH;
buffer.height = GRID_HEIGHT;
const bufferCtx = buffer.getContext("2d");
const bufferImg = bufferCtx.createImageData(GRID_WIDTH, GRID_HEIGHT);

function displayGrid() {
    const data = bufferImg.data;
    const n = fluid.w;

    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const v = (1 - fluid.smoke[row*n + col]) * 255;
            const p = 4 * (row*GRID_WIDTH + col);
            data[p] = v;
            data[p+1] = v;
            data[p+2] = v;
            data[p+3] = 255;
        }
    }
    bufferCtx.putImageData(bufferImg, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);

    const scale = canvas.width / GRID_WIDTH;
    ctx.beginPath();
    ctx.fillStyle = `#000000`;
    ctx.arc(OBSTACLE.x * scale, OBSTACLE.y * scale, OBSTACLE.r * scale, 0, 2 * Math.PI);
    ctx.fill();
}
displayGrid();
