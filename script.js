const RESOLUTION = 800;
const GRID_SIZE = 20;
const CELL_SIZE = RESOLUTION / GRID_SIZE;

let canvas;
let ctxt;
let grid;

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = RESOLUTION;
    canvas.height = RESOLUTION;
    ctxt = canvas.getContext("2d");

    grid = new Grid(GRID_SIZE);

    canvas.onclick = e => {
        let rect = canvas.getBoundingClientRect();

        let x = Math.floor(GRID_SIZE * e.offsetX / rect.width);
        let y = Math.floor(GRID_SIZE * e.offsetY / rect.height);

        grid.setCell(x, y);
        grid.render(ctxt);
    }

    grid.render(ctxt);
}

function loop() {
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    grid.render(ctxt);

    grid.update();

    requestAnimationFrame(loop);
}

function startSimulation() {

}

class Grid {
    constructor(size) {
        this.size = size;
        this.grid = [];
        for(let i=0;i<size;i++) {
            let row = [];
            for(let j=0;j<size;j++) {
                row.push(new GridCell());
            }
            this.grid.push(row);
        }
    }

    render(ctxt) {
        ctxt.clearRect(0, 0, canvas.width, canvas.height);

        ctxt.beginPath();
        for(let i=0;i<this.size+1;i++) {
            for(let j=0;j<this.size+1;j++) {
                ctxt.moveTo(CELL_SIZE * i, 0);
                ctxt.lineTo(CELL_SIZE * i, canvas.height);
                ctxt.moveTo(0, CELL_SIZE * i);
                ctxt.lineTo(canvas.width, CELL_SIZE * i);
            }
        }
        ctxt.stroke();

        for(let i=0;i<this.size;i++) {
            for(let j=0;j<this.size;j++) {
                this.grid[i][j].render(ctxt, j, i);
            }
        }
    }

    setCell(x, y) {
        this.grid[y][x].setCell();
    }

    update() {
        for(let i=0;i<this.size+1;i++) {
            for(let j=0;j<this.size+1;j++) {
                if(i > 0) {
                    this.grid[i][j].visitFromTop(this.grid[i-1][j]);
                }
                if(j > 0) {
                    this.grid[i][j].visitFromLeft(this.grid[i][j-1]);
                }
                if(i < this.size - 1) {
                    this.grid[i][j].visitFromBottom(this.grid[i+1][j]);
                }
                if(j < this.size - 1) {
                    this.grid[i][j].visitFromRight(this.grid[i][j+1]);
                }
                this.grid[i][j].resolve();
            }
        }
    }
}

class GridCell {
    constructor() {
        this.top = NaN;
        this.right = NaN;
        this.bottom = NaN;
        this.left = NaN;

        this.renderColor1 = "#0000";
        this.renderColor2 = "#0000";
        this.renderColor3 = "#0000";
        this.renderColor4 = "#0000";
        this.renderColor5 = "#0000";
        this.renderColor6 = "#0000";
        this.renderColor7 = "#0000";
        this.renderColor8 = "#0000";
    }

    setCell() {
        let hue = Math.floor(360 * Math.random());
        this.top = hue;
        this.right = hue;
        this.bottom = hue;
        this.left = hue;

        this.renderColor1 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor2 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor3 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor4 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor5 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor6 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor7 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor8 = `hsl(${hue}, 100%, 50%)`;
    }

    render(ctxt, x, y) {
        let x1 = x * CELL_SIZE;
        let x2 = (x+0.5) * CELL_SIZE;
        let x3 = (x+1) * CELL_SIZE;

        let y1 = y * CELL_SIZE;
        let y2 = (y+0.5) * CELL_SIZE;
        let y3 = (y+1) * CELL_SIZE;

        ctxt.fillStyle = this.renderColor1;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2);
        ctxt.lineTo(x2, y1);
        ctxt.lineTo(x3, y1);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor2;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2);
        ctxt.lineTo(x3, y1);
        ctxt.lineTo(x3, y2);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor3;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2);
        ctxt.lineTo(x3, y2);
        ctxt.lineTo(x3, y3);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor4;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2);
        ctxt.lineTo(x3, y3);
        ctxt.lineTo(x2, y3);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor5;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2);
        ctxt.lineTo(x2, y3);
        ctxt.lineTo(x1, y3);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor6;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2);
        ctxt.lineTo(x1, y3);
        ctxt.lineTo(x1, y2);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor7;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2);
        ctxt.lineTo(x1, y2);
        ctxt.lineTo(x1, y1);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor8;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2);
        ctxt.lineTo(x1, y1);
        ctxt.lineTo(x2, y1);
        ctxt.fill();
    }

    visitFromTop(cell) {
        if(isNaN(this.top)) {
            this.top = cell.bottom;
        }
    }

    visitFromLeft(cell) {
        if(isNaN(this.left)) {
            this.top = cell.right;
        }
    }

    visitFromBottom(cell) {
        if(isNaN(this.bottom)) {
            this.top = cell.top;
        }
    }

    visitFromRight(cell) {
        if(isNaN(this.right)) {
            this.top = cell.left;
        }
    }

    resolve() {
        let state = 0b1000 * isNaN(this.top) + 0b100 * isNaN(this.right) + 0b10 * isNaN(this.bottom) + 0b1 * isNaN(this.left);

        this.renderColor1 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor2 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor3 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor4 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor5 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor6 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor7 = `hsl(${hue}, 100%, 50%)`;
        this.renderColor8 = `hsl(${hue}, 100%, 50%)`;
    }
}
