const RESOLUTION = 800;
const GRID_SIZE = 24;
const CELL_SIZE = RESOLUTION / (GRID_SIZE);
const EPSILON = 0;

let canvas;
let ctxt;
let grid;
let frame;
let step = 0;

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

        if(step === 300) {
            return;
        }
        step++
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
        for (let i = 0; i < size+1; i++) {
            let row = [];
            for (let j = 0; j < size+1; j++) {
                let state = 0b0000;
                if(i > 0) {
                    state |= 0b1000;
                }
                if(j > 0) {
                    state |= 0b0001;
                }
                if(i < size) {
                    state |= 0b0010;
                }
                if(j < size) {
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
        ctxt.lineWidth = 1;

        ctxt.beginPath();
        for (let i = 0; i < this.grid.length + 1; i += 2) {
            for (let j = 0; j < this.grid.length + 1; j += 2) {
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
        let nextGrid = this.grid.map(row => row.slice());
        let edgeCaseGrid = this.grid.map(row => row.map(() => 0b0));
        for(let region of this.regions) {
            region.computeEdgeCase(this.grid, edgeCaseGrid);
        }
        for(let region of this.regions) {
            region.update(this.grid, nextGrid, edgeCaseGrid);
        }
        this.grid = nextGrid;
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
        ctxt.lineWidth = 3;

        ctxt.beginPath();
        ctxt.moveTo(this.points[0].x * CELL_SIZE, this.points[0].y * CELL_SIZE);
        for (let i = 1; i < this.points.length; i++) {
            ctxt.lineTo(this.points[i].x * CELL_SIZE, this.points[i].y * CELL_SIZE);
        }
        ctxt.closePath();
        // ctxt.fill()
        ctxt.stroke()

        for(let point of this.points) {
            ctxt.beginPath();
            ctxt.arc(point.x * CELL_SIZE, point.y * CELL_SIZE, 5, 0, 2 * Math.PI);
            ctxt.fill();
        }
    }

    computeEdgeCase(grid1, grid2) {
        for(let point of this.points) {
            point.computeEdgeCase(grid1, grid2);
        }
        for(let i=0;i<grid2.length;i++) {
            for(let j=0;j<grid2[i].length;j++) {
                // console.log("abc!", grid2[i][j])
                if(grid2[i][j] === 0b1) {
                    grid2[i][j] = grid2[i][j] << 1;

                    // console.log("a", grid2[i][j])
                }
            }
        }
    }

    update(grid1, grid2, grid3) {
        this.points = this.points.flatMap(p => p.generateNext(grid1, grid2, grid3));
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

    computeEdgeCase(grid1, grid2) {
        let state = grid1[this.y][this.x];

        // if((state & 0b1000) === 0b1000) {
        //     grid2[this.y-1][this.x] |= 0b1;
        // }
        // if((state & 0b0100) === 0b0100) {
        //     grid2[this.y][this.x+1] |= 0b1;
        // }
        // if((state & 0b0010) === 0b0010) {
        //     grid2[this.y+1][this.x] |= 0b1;
        // }
        // if((state & 0b0001) === 0b0001) {
        //     grid2[this.y][this.x-1] |= 0b1;
        // }

        grid2[this.y][this.x] |= 0b1;
    }

    generateNext(grid1, grid2, grid3) {
        let state = grid1[this.y][this.x];
        grid2[this.y][this.x] &= 0b0000;

        switch (state) {
        case 0b0000:
            return [this];
        case 0b0001:
            grid2[this.y][this.x-1] &= 0b1011;
            return [new RegionPoint(this.x-1, this.y), this];
        case 0b0010:
            grid2[this.y+1][this.x] &= 0b0111;
            return [new RegionPoint(this.x, this.y+1), this];
        case 0b0011:
            grid2[this.y+1][this.x] &= 0b0111;
            grid2[this.y][this.x-1] &= 0b1011;
            if(grid3[this.y][this.x] === 0b11) {
                return [new RegionPoint(this.x, this.y+1), this, new RegionPoint(this.x-1, this.y)];
            } else {
                return [new RegionPoint(this.x, this.y+1), new RegionPoint(this.x-1, this.y)];
            }
        case 0b0100:
            grid2[this.y][this.x+1] &= 0b1110;
            return [new RegionPoint(this.x+1, this.y), this];
        case 0b0101:
            grid2[this.y][this.x+1] &= 0b1110;
            grid2[this.y][this.x-1] &= 0b1011;
            return [new RegionPoint(this.x+1, this.y), this, new RegionPoint(this.x-1, this.y)];
        case 0b0110:
            grid2[this.y][this.x+1] &= 0b1110;
            grid2[this.y+1][this.x] &= 0b0111;
            if(grid3[this.y][this.x] === 0b11) {
                return [new RegionPoint(this.x+1, this.y), this, new RegionPoint(this.x, this.y+1)];
            }else {
                return [new RegionPoint(this.x+1, this.y), new RegionPoint(this.x, this.y+1)];
            }
        case 0b0111:
            grid2[this.y][this.x+1] &= 0b1110;
            grid2[this.y+1][this.x] &= 0b0111;
            grid2[this.y][this.x-1] &= 0b1011;
            return [new RegionPoint(this.x+1, this.y), new RegionPoint(this.x, this.y+1), new RegionPoint(this.x-1, this.y)];
        case 0b1000:
            grid2[this.y-1][this.x] &= 0b1101;
            return [new RegionPoint(this.x, this.y-1), this];
        case 0b1001:
            grid2[this.y][this.x-1] &= 0b1011;
            grid2[this.y-1][this.x] &= 0b1101;
            if(grid3[this.y][this.x] === 0b11) {
                return [new RegionPoint(this.x-1, this.y), this, new RegionPoint(this.x, this.y-1)];
            }else {
                return [new RegionPoint(this.x-1, this.y), new RegionPoint(this.x, this.y-1)];
            }
        case 0b1010:
            grid2[this.y+1][this.x] &= 0b0111;
            grid2[this.y-1][this.x] &= 0b1101;
            return [new RegionPoint(this.x, this.y+1), this, new RegionPoint(this.x, this.y-1)];
        case 0b1011:
            grid2[this.y+1][this.x] &= 0b0111;
            grid2[this.y][this.x-1] &= 0b1011;
            grid2[this.y-1][this.x] &= 0b1101;
            return [new RegionPoint(this.x, this.y+1), new RegionPoint(this.x-1, this.y), new RegionPoint(this.x, this.y-1)];
        case 0b1100:
            grid2[this.y-1][this.x] &= 0b1101;
            grid2[this.y][this.x+1] &= 0b1110;
            if(grid3[this.y][this.x] === 0b11) {
                return [new RegionPoint(this.x, this.y-1), this, new RegionPoint(this.x+1, this.y)];
            }else {
                return [new RegionPoint(this.x, this.y-1), new RegionPoint(this.x+1, this.y)];
            }
        case 0b1101:
            grid2[this.y][this.x-1] &= 0b1011;
            grid2[this.y-1][this.x] &= 0b1101;
            grid2[this.y][this.x+1] &= 0b1110;
            return [new RegionPoint(this.x-1, this.y), new RegionPoint(this.x, this.y-1), new RegionPoint(this.x+1, this.y)];
        case 0b1110:
            grid2[this.y-1][this.x] &= 0b1101;
            grid2[this.y][this.x+1] &= 0b1110;
            grid2[this.y+1][this.x] &= 0b0111;
            return [new RegionPoint(this.x, this.y-1), new RegionPoint(this.x+1, this.y), new RegionPoint(this.x, this.y+1)];

        case 0b1111:
            return [new RegionPoint(this.x, this.y-1), new RegionPoint(this.x+1, this.y), new RegionPoint(this.x, this.y+1), new RegionPoint(this.x-1, this.y)];
        }
    }
}
