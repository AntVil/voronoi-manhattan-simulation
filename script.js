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
    if (frame % 5 === 0) {
        grid.update();

        grid.render(ctxt);

        if (step === 300) {
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
        for (let i = 0; i < size + 1; i++) {
            let row = [];
            for (let j = 0; j < size + 1; j++) {
                row.push(new GridCell());
            }
            this.grid.push(row);
        }

        this.regions = [];
    }

    setCell(x, y) {
        let hue;
        do {
            hue = Math.floor(360 * Math.random());
        } while (this.regions.includes(hue));

        this.regions.push(hue);
        this.grid[y][x].addRegion(hue);
        this.grid[y - 1][x].addRegion(hue);
        this.grid[y][x + 1].addRegion(hue);
        this.grid[y + 1][x].addRegion(hue);
        this.grid[y][x - 1].addRegion(hue);
    }

    update() {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                this.grid[i][j].update(
                    this.grid[i - 1]?.[j],
                    this.grid[i]?.[j + 1],
                    this.grid[i + 1]?.[j],
                    this.grid[i]?.[j - 1]
                );
            }
        }

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                this.grid[i][j].upgrade();
            }
        }
    }

    computePolygonStart(region) {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j].hasRegion(region)) {
                    return [i, j]
                }
            }
        }
    }

    computeRegions() {
        return this.regions.map((region) => {
            let [y, x] = this.computePolygonStart(region);
            let polygon = [[y, x]];

            // move along top-right side
            while (true) {
                if (this.grid[y]?.[x + 1]?.hasRegion(region) ?? false) {
                    x++;
                } else if (this.grid[y + 1]?.[x + 1]?.hasRegion(region) ?? false) {
                    x++;
                    y++;
                } else if (this.grid[y + 1]?.[x]?.hasRegion(region) ?? false) {
                    y++;
                } else {
                    break;
                }
                polygon.push([y, x]);
            }
            // move along bottom-right side
            while (true) {
                if (this.grid[y + 1]?.[x]?.hasRegion(region) ?? false) {
                    y++;
                } else if (this.grid[y + 1]?.[x - 1]?.hasRegion(region) ?? false) {
                    x--;
                    y++;
                } else if (this.grid[y]?.[x - 1]?.hasRegion(region) ?? false) {
                    x--;
                } else {
                    break;
                }
                polygon.push([y, x]);
            }
            // move along bottom-left side
            while (true) {
                if (this.grid[y]?.[x - 1]?.hasRegion(region) ?? false) {
                    x--;
                } else if (this.grid[y - 1]?.[x - 1]?.hasRegion(region) ?? false) {
                    x--;
                    y--;
                } else if (this.grid[y - 1]?.[x]?.hasRegion(region) ?? false) {
                    y--;
                } else {
                    break;
                }
                polygon.push([y, x]);
            }
            // move along top-left side
            while (y !== polygon[0][0] || x !== polygon[0][1]) {
                if (this.grid[y - 1]?.[x]?.hasRegion(region) ?? false) {
                    y--;
                } else if (this.grid[y - 1]?.[x + 1]?.hasRegion(region) ?? false) {
                    x++;
                    y--;
                } else if (this.grid[y]?.[x + 1]?.hasRegion(region) ?? false) {
                    x++;
                } else {
                    break;
                }
                polygon.push([y, x]);
            }

            return [region, polygon];
        });
    }

    render(ctxt) {
        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        ctxt.lineWidth = 1;
        ctxt.strokeStyle = "#000";
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

        let regions = this.computeRegions();
        for (let [hue, polygon] of regions) {
            ctxt.globalAlpha = 0.2;
            ctxt.beginPath();
            ctxt.strokeStyle = `hsl(${hue}, 100%, 50%)`;
            ctxt.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctxt.moveTo(CELL_SIZE * polygon[0][1], CELL_SIZE * polygon[0][0]);
            for (let i = 1; i < polygon.length; i++) {
                ctxt.lineTo(CELL_SIZE * polygon[i][1], CELL_SIZE * polygon[i][0]);
            }
            ctxt.closePath();
            ctxt.fill();
            ctxt.globalAlpha = 1;
            ctxt.stroke();
        }
    }
}

class GridCell {
    constructor() {
        this.closestDistance = Infinity;
        this.closestRegions = [];
        this.nextClosestDistance = Infinity;
        this.nextClosestRegions = [];
    }

    addRegion(region) {
        this.closestDistance = 0;
        this.nextClosestDistance = 0;
        this.closestRegions.push(region);
        this.nextClosestRegions.push(region);
    }

    isVisited() {
        return this.closestRegions.length > 0;
    }

    hasRegion(region) {
        return this.closestRegions.includes(region);
    }

    update(top, right, bottom, left) {
        this.updateCell(top);
        this.updateCell(right);
        this.updateCell(bottom);
        this.updateCell(left);
    }

    updateCell(otherCell) {
        if (otherCell?.isVisited() ?? false) {
            let candidateDistance = otherCell.closestDistance + 1;
            if (candidateDistance < this.nextClosestDistance) {
                this.nextClosestDistance = candidateDistance;
                this.nextClosestRegions = otherCell.closestRegions.slice();
            }
            else if (candidateDistance === this.nextClosestDistance) {
                for (let region of otherCell.closestRegions) {
                    if (this.nextClosestRegions.includes(region)) {
                        continue;
                    }

                    this.nextClosestRegions.push(region);
                }
            }
        }
    }

    upgrade() {
        this.closestDistance = this.nextClosestDistance;
        this.closestRegions = this.nextClosestRegions.slice();
        // console.log(this.nextClosestRegions)
    }
}
