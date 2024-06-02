const RESOLUTION = 800;
const GRID_SIZE = 24;
const CELL_SIZE = RESOLUTION / (GRID_SIZE);
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

        let x = Math.round(GRID_SIZE * e.offsetX / rect.width / 2) * 2;
        let y = Math.round(GRID_SIZE * e.offsetY / rect.height / 2) * 2;

        grid.setCell(x, y);
        grid.render(ctxt);
    }

    grid.render(ctxt);
}

function loop() {
    if (frame % 10 === 0) {
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
        for (let i = 0; i < size; i++) {
            let row = [];
            for (let j = 0; j < size; j++) {
                let state = 0b0000;
                if(i > 0) {
                    state |= 0b1000;
                }
                if(j > 0) {
                    state |= 0b0001;
                }
                if(i < size-1) {
                    state |= 0b0010;
                }
                if(j < size-1) {
                    state |= 0b0100;
                }

                row.push(state);
            }
            this.grid.push(row);
        }

        this.regions = [];
    }

    render(ctxt) {
        ctxt.clearRect(0, 0, canvas.width, canvas.height);

        ctxt.beginPath();
        for (let i = 0; i < this.size + 1; i += 2) {
            for (let j = 0; j < this.size + 1; j += 2) {
                ctxt.moveTo(CELL_SIZE * i, 0);
                ctxt.lineTo(CELL_SIZE * i, canvas.height);
                ctxt.moveTo(0, CELL_SIZE * i);
                ctxt.lineTo(canvas.width, CELL_SIZE * i);
            }
        }
        ctxt.stroke();

        for (let region of this.regions) {
            region.render(ctxt);
        }
    }

    setCell(x, y) {
        let hue = Math.floor(360 * Math.random());

        this.regions.push(new Region(x, y, hue));
        this.grid[y][x] &= 0b0000;
        this.grid[y-1][x] &= 0b1101;
        this.grid[y][x+1] &= 0b1110;
        this.grid[y+1][x] &= 0b0111;
        this.grid[y][x-1] &= 0b1011;
    }

    update() {
        for(let region of this.regions) {
            region.update(this.grid);
        }
    }
}

class Region {
    constructor(x, y, hue) {
        this.points = [
            new RegionPoint(x, y - 1),
            new RegionPoint(x + 1, y),
            new RegionPoint(x, y + 1),
            new RegionPoint(x - 1, y)
        ];

        this.hue = hue;
    }

    render(ctxt) {
        ctxt.fillStyle = `hsl(${this.hue}, 100%, 50%)`;

        ctxt.beginPath();
        ctxt.moveTo(this.points[0].x * CELL_SIZE, this.points[0].y * CELL_SIZE);
        for (let i = 1; i < this.points.length; i++) {
            ctxt.lineTo(this.points[i].x * CELL_SIZE, this.points[i].y * CELL_SIZE);
        }
        ctxt.closePath();
        ctxt.fill()
        ctxt.stroke()
    }

    update(grid) {
        this.points = this.points.flatMap(p => p.generateNext(grid));
        for(let i=this.points.length-1;i>=0;i--) {
            let j = (i - 1 + this.points.length) % this.points.length;
            if(this.points[i].equalTo(this.points[j])) {
                this.points.splice(i, 1);
            }
        }
    }
}

class RegionPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equalTo(other) {
        return (this.x === other.x && this.y === other.y);
    }

    generateNext(grid) {
        let state = grid[this.y][this.x];
        grid[this.y][this.x] &= 0b0000;

        switch (state) {
        case 0b0000:
            return [this];
        case 0b0001:
            grid[this.y][this.x-1] &= 0b1011;
            return [new RegionPoint(this.x-1, this.y)];
        case 0b0010:
            grid[this.y+1][this.x] &= 0b0111;
            return [new RegionPoint(this.x, this.y+1)];
        case 0b0011:
            grid[this.y+1][this.x] &= 0b0111;
            grid[this.y][this.x-1] &= 0b1011;
            return [new RegionPoint(this.x, this.y+1), new RegionPoint(this.x-1, this.y)];
        case 0b0100:
            grid[this.y][this.x+1] &= 0b1110;
            return [new RegionPoint(this.x+1, this.y)];
        case 0b0101:
            grid[this.y][this.x+1] &= 0b1110;
            grid[this.y][this.x-1] &= 0b1011;
            return [new RegionPoint(this.x+1, this.y), new RegionPoint(this.x-1, this.y)];
        case 0b0110:
            grid[this.y][this.x+1] &= 0b1110;
            grid[this.y+1][this.x] &= 0b0111;
            return [new RegionPoint(this.x+1, this.y), new RegionPoint(this.x, this.y+1)];
        case 0b0111:
            grid[this.y][this.x+1] &= 0b1110;
            grid[this.y+1][this.x] &= 0b0111;
            grid[this.y][this.x-1] &= 0b1011;
            return [new RegionPoint(this.x+1, this.y), new RegionPoint(this.x, this.y+1), new RegionPoint(this.x-1, this.y)];
        case 0b1000:
            grid[this.y-1][this.x] &= 0b1101;
            return [new RegionPoint(this.x, this.y-1)];
        case 0b1001:
            grid[this.y][this.x-1] &= 0b1011;
            grid[this.y-1][this.x] &= 0b1101;
            return [new RegionPoint(this.x-1, this.y), new RegionPoint(this.x, this.y-1)];
        case 0b1010:
            grid[this.y+1][this.x] &= 0b0111;
            grid[this.y-1][this.x] &= 0b1101;
            return [new RegionPoint(this.x, this.y+1), new RegionPoint(this.x, this.y-1)];
        case 0b1011:
            grid[this.y+1][this.x] &= 0b0111;
            grid[this.y][this.x-1] &= 0b1011;
            grid[this.y-1][this.x] &= 0b1101;
            return [new RegionPoint(this.x, this.y+1), new RegionPoint(this.x-1, this.y), new RegionPoint(this.x, this.y-1)];
        case 0b1100:
            grid[this.y-1][this.x] &= 0b1101;
            grid[this.y][this.x+1] &= 0b1110;
            return [new RegionPoint(this.x, this.y-1), new RegionPoint(this.x+1, this.y)];
        case 0b1101:
            grid[this.y][this.x-1] &= 0b1011;
            grid[this.y-1][this.x] &= 0b1101;
            grid[this.y][this.x+1] &= 0b1110;
            return [new RegionPoint(this.x-1, this.y), new RegionPoint(this.x, this.y-1), new RegionPoint(this.x+1, this.y)];
        case 0b1110:
            grid[this.y-1][this.x] &= 0b1101;
            grid[this.y][this.x+1] &= 0b1110;
            grid[this.y+1][this.x] &= 0b0111;
            return [new RegionPoint(this.x, this.y-1), new RegionPoint(this.x+1, this.y), new RegionPoint(this.x, this.y+1)];

        case 0b1111:
            return [new RegionPoint(this.x, this.y-1), new RegionPoint(this.x+1, this.y), new RegionPoint(this.x, this.y+1), new RegionPoint(this.x-1, this.y)];
        }
    }
}
