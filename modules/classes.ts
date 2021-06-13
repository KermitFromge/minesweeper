import { IconEmojis, numEmojis } from './emojis'

class Board {
    height: number;
    width: number;
    grid: Tile[][];
    constructor(height: number, width: number) {
        this.height = height;
        this.width = width;
        this.grid = this.createGrid()
    }
    //for use instead of grid[y][x] when value might be null
    getTile(x: number, y: number) {
        if (x >= this.width || x < 0 || y >= this.height || y < 0) {
            return null;
        }
        return this.grid[y][x];
    }
    createGrid() {
        let result = []
        for (let x = 0; x < this.height; x++) {
            let row = [];
            for (let i = 0; i < this.width; i++) {
                row.push(new Tile(0));
            };
            result.push(row);
        };

        return result;
    };
    //formats grid as a string to send in discord
    formatAsString() {
        console.log(this.height, this.width)
        let topNums = '`  '
        for (let i = 0; i < this.width; i++) {
            if (i < 10) { topNums += ' ' + i + ' ' } else { topNums += i + ' ' }
        }
        topNums += '`';
        let result = topNums + '\n';
        for (let y = 0; y < this.height; y++) {
            result += '`' + y + (y >= 10 ? '`' : ' `');
            for (let x = 0; x < this.width; x++) {
                result += this.grid[y][x].display;
            };
            result += '\n';
        };
        return result;
    };
    //gets all the adjacent cells, including diagonals and returns in an array, including nulls so that index->location relationship stays the same
    getAdjacent(x: number, y: number) {
        const xAxis = [-1, 0, 1];
        const yAxis = [-1, 0, 1];
        const result: any[] = [];
        xAxis.forEach(xValue => {
            yAxis.forEach(yValue => {
                result.push(this.getTile(x + xValue, y + yValue));
            });
        });
        //remove own tile from adjacent ones
        result.splice(4, 1)
        return result;
    }
    //generates any amount of mines, finding suitible places until all mines are generated
    generateMines(amount: number, startingX: number, startingY: number) {
        console.log('generating', amount, 'mines');
        let minesLeft = amount;
        while (minesLeft > 0) {
            const ranX = Math.floor(Math.random() * this.width);
            const ranY = Math.floor(Math.random() * this.height);

            const inStartingVicinity = (ranX <= startingX + 1 && ranX >= startingX - 1) && (ranY <= startingY + 1 && ranY >= startingY - 1);

            //regenerates random location if location already has bomb or is in starting click vicinity
            if (this.getTile(ranX, ranY)!.contents === 'bomb' || inStartingVicinity) {
                continue;
            }
            this.grid[ranY][ranX].contents = 'bomb';
            minesLeft -= 1;
        }
        this.updateBoard()
    }
    //reveals all cells
    revealAll() {
        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.height; x++) {
                if (this.grid[y][x].revealed === true) { continue }
                this.grid[y][x].revealed = true;
            }
        }
    }
    //makes each cell update its contents
    updateBoard() {
        console.log('updating');
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const targetGrid: Tile = this.grid[y][x];
                if (targetGrid.contents === 'bomb') { continue }
                let bombCount = 0;
                for (let i of this.getAdjacent(x, y)) {
                    if (i === null) { continue };
                    if (i.contents === 'bomb') {
                        bombCount++;
                    };
                };
                targetGrid.contents = bombCount;
            }
        }
    }
}

class Tile {
    revealed: boolean;
    flagged: boolean;
    contents: any;
    constructor(contents: any) {
        this.revealed = false;
        this.flagged = false;
        this.contents = contents;
    }
    get display() {
        if (this.flagged === true) {
            return IconEmojis.flag;
        } else if (this.revealed === true) {
            if (this.contents === 'bomb') {
                return IconEmojis.bomb
            } else {
                return numEmojis[this.contents];
            }
        } else {
            return IconEmojis.blank;
        }
    }
}

export class Game {
    board: Board;
    numBombs: number;
    state: string;
    constructor(height: number, width: number, numBombs: number) {
        this.board = new Board(height, width);
        this.numBombs = numBombs;
        this.state = 'empty';
    }
    reveal(x: number, y: number) {
        if (this.state === 'empty') { this.board.generateMines(this.numBombs, x, y); this.state = 'mined' }
        const target = this.board.getTile(x, y);
        if (target === null || target.revealed!) { return }
        target.revealed = true;
        if (target.contents === 'bomb') { this.state === 'lost' }
        if (target.contents === 0) {
            const xAxis = [-1, 0, 1];
            const yAxis = [-1, 0, 1];
            for (let yMod of yAxis) {
                for (let xMod of xAxis) {
                    console.log(xMod, yMod);
                    if (xMod === 0 && yMod === 0) {
                        continue;
                    }
                    this.reveal(x + xMod, y + yMod);
                }
            }
        };
    }
    flag(x: number, y: number) {
        this.board.grid[y][x].flagged = true;
    }
    unflag(x: number, y: number) {
        this.board.grid[y][x].flagged = false;
    }

}