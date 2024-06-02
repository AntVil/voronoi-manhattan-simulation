const RESOLUTION = 800;
const GRID_SIZE = 10;
const CELL_SIZE = RESOLUTION / GRID_SIZE;
const EPSILON = 0;

let canvas;
let ctxt;
let grid;
let frame;

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
    if(frame % 10 === 0) {
        grid.update();

        grid.render(ctxt);
    }

    frame++;

    requestAnimationFrame(loop);
}

function startSimulation() {
    frame = 0;
    loop();
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

        for(let i=0;i<this.size;i++) {
            for(let j=0;j<this.size;j++) {
                this.grid[i][j].render(ctxt, j, i);
            }
        }

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
    }

    setCell(x, y) {
        let hue = Math.floor(360 * Math.random());
        this.grid[y][x].setCell(hue);
    }

    update() {
        for(let i=0;i<this.size;i++) {
            for(let j=0;j<this.size;j++) {
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
            }
        }

        for(let i=0;i<this.size;i++) {
            for(let j=0;j<this.size;j++) {
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
        this.resolved = false;

        this.renderColor1 = "#0000";
        this.renderColor2 = "#0000";
        this.renderColor3 = "#0000";
        this.renderColor4 = "#0000";
        this.renderColor5 = "#0000";
        this.renderColor6 = "#0000";
        this.renderColor7 = "#0000";
        this.renderColor8 = "#0000";
    }

    setCell(hue) {
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
        ctxt.moveTo(x2, y2+EPSILON);
        ctxt.lineTo(x2-EPSILON, y1);
        ctxt.lineTo(x3+EPSILON, y1);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor2;
        ctxt.beginPath();
        ctxt.moveTo(x2+EPSILON, y2);
        ctxt.lineTo(x3, y1-EPSILON);
        ctxt.lineTo(x3, y2+EPSILON);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor3;
        ctxt.beginPath();
        ctxt.moveTo(x2+EPSILON, y2);
        ctxt.lineTo(x3, y2-EPSILON);
        ctxt.lineTo(x3, y3+EPSILON);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor4;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2-EPSILON);
        ctxt.lineTo(x3+EPSILON, y3);
        ctxt.lineTo(x2-EPSILON, y3);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor5;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2-EPSILON);
        ctxt.lineTo(x2+EPSILON, y3);
        ctxt.lineTo(x1-EPSILON, y3);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor6;
        ctxt.beginPath();
        ctxt.moveTo(x2-EPSILON, y2);
        ctxt.lineTo(x1, y3+EPSILON);
        ctxt.lineTo(x1, y2-EPSILON);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor7;
        ctxt.beginPath();
        ctxt.moveTo(x2-EPSILON, y2);
        ctxt.lineTo(x1, y2+EPSILON);
        ctxt.lineTo(x1, y1-EPSILON);
        ctxt.fill();

        ctxt.fillStyle = this.renderColor8;
        ctxt.beginPath();
        ctxt.moveTo(x2, y2+EPSILON);
        ctxt.lineTo(x1-EPSILON, y1);
        ctxt.lineTo(x2+EPSILON, y1);
        ctxt.fill();
    }

    visitFromTop(cell) {
        if(isNaN(this.top) && cell.bottom !== null && this.top !== null) {
            this.top = cell.bottom;
        }
    }

    visitFromLeft(cell) {
        if(isNaN(this.left) && cell.right !== null && this.left !== null) {
            this.left = cell.right;
        }
    }

    visitFromBottom(cell) {
        if(isNaN(this.bottom) && cell.top !== null && this.bottom !== null) {
            this.bottom = cell.top;
        }
    }

    visitFromRight(cell) {
        if(isNaN(this.right) && cell.left !== null && this.right !== null) {
            this.right = cell.left;
        }
    }

    resolve() {
        if(this.resolved) {
            return;
        }

        let state = (
            0b1000 * (!isNaN(this.top)) +
            0b0100 * (!isNaN(this.right)) +
            0b0010 * (!isNaN(this.bottom)) +
            0b0001 * (!isNaN(this.left))
        );

        if(state === 0b0000) {
            return;
        }

        switch(state) {
        case 0b0001:
            this.renderColor1 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.left}, 100%, 50%)`;
            this.top = this.left;
            this.right = this.left;
            this.bottom = this.left;
            break;
        case 0b0010:
            this.renderColor1 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.bottom}, 100%, 50%)`;
            this.top = this.bottom;
            this.right = this.bottom;
            this.left = this.bottom;
            break;
        case 0b0011:
            this.renderColor1 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.left}, 100%, 50%)`;
            this.top = this.left;
            this.right = this.bottom;
            break;
        case 0b0100:
            this.renderColor1 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.right}, 100%, 50%)`;
            this.top = this.right;
            this.bottom = this.right;
            this.left = this.right;
            break;
        case 0b0101:
            this.renderColor1 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.left}, 100%, 50%)`;
            // this.top = null;
            // this.bottom = null;
            break;
        case 0b0110:
            this.renderColor1 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.right}, 100%, 50%)`;
            this.top = this.right;
            this.left = this.bottom;
            break;
        case 0b0111:
            this.renderColor1 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.left}, 100%, 50%)`;
            this.top = null;
            break;
        case 0b1000:
            this.renderColor1 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.top}, 100%, 50%)`;
            this.right = this.top;
            this.bottom = this.top;
            this.left = this.top;
            break;
        case 0b1001:
            this.renderColor1 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.top}, 100%, 50%)`;
            this.right = this.top;
            this.bottom = this.left;
            break;
        case 0b1010:
            this.renderColor1 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.top}, 100%, 50%)`;
            // this.right = null;
            // this.left = null;
            break;
        case 0b1011:
            this.renderColor1 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.top}, 100%, 50%)`;
            this.right = null;
            break;
        case 0b1100:
            this.renderColor1 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.top}, 100%, 50%)`;
            this.bottom = this.right;
            this.left = this.top;
            break;
        case 0b1101:
            this.renderColor1 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.top}, 100%, 50%)`;
            this.bottom = null;
            break;
        case 0b1110:
            this.renderColor1 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.top}, 100%, 50%)`;
            this.left = null;
            break;
        case 0b1111:
            this.renderColor1 = `hsl(${this.top}, 100%, 50%)`;
            this.renderColor2 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor3 = `hsl(${this.right}, 100%, 50%)`;
            this.renderColor4 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor5 = `hsl(${this.bottom}, 100%, 50%)`;
            this.renderColor6 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor7 = `hsl(${this.left}, 100%, 50%)`;
            this.renderColor8 = `hsl(${this.top}, 100%, 50%)`;
            break;
        }

        this.resolved = true;
    }
}
