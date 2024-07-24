import Tile from "./Tile";

interface Position {
  x: number;
  y: number;
}

class Grid {
  size: number;
  cells: (Tile | null)[][];

  constructor(size: number, previousState?: (Tile | null)[][]) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
  }

  empty(): (Tile | null)[][] {
    const cells: (Tile | null)[][] = [];

    for (let x = 0; x < this.size; x++) {
      const row: (Tile | null)[] = [];
      for (let y = 0; y < this.size; y++) {
        row.push(null);
      }
      cells.push(row);
    }

    return cells;
  }

  fromState(state: (Tile | null)[][]): (Tile | null)[][] {
    const cells: (Tile | null)[][] = [];

    for (let x = 0; x < this.size; x++) {
      const row: (Tile | null)[] = [];
      for (let y = 0; y < this.size; y++) {
        const tile = state[x][y];
        if (tile) {
          // Assuming that the type of tile is always Tile or null.
          const tileData = tile as Tile;
          row.push(new Tile({ x: tileData.x, y: tileData.y }, tileData.value));
        } else {
          row.push(null);
        }
      }
      cells.push(row);
    }

    return cells;
  }

  randomAvailableCell(): Position | undefined {
    const cells = this.availableCells();

    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  }

  availableCells(): Position[] {
    const cells: Position[] = [];

    this.eachCell((x, y, tile) => {
      if (!tile) {
        cells.push({ x, y });
      }
    });

    return cells;
  }

  eachCell(callback: (x: number, y: number, tile: Tile | null) => void): void {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  }

  cellsAvailable(): boolean {
    return !!this.availableCells().length;
  }

  cellAvailable(cell: Position): boolean {
    return !this.cellOccupied(cell);
  }

  cellOccupied(cell: Position): boolean {
    return !!this.cellContent(cell);
  }

  cellContent(cell: Position): Tile | null {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    } else {
      return null;
    }
  }

  insertTile(tile: Tile): void {
    this.cells[tile.x][tile.y] = tile;
  }

  removeTile(tile: Tile): void {
    this.cells[tile.x][tile.y] = null;
  }

  withinBounds(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  }

  serialize(): {
    size: number;
    cells: ({ position: Position; value: number } | null)[][];
  } {
    const cellState: ({ position: Position; value: number } | null)[][] = [];

    for (let x = 0; x < this.size; x++) {
      const row: ({ position: Position; value: number } | null)[] = [];
      for (let y = 0; y < this.size; y++) {
        row.push(this.cells[x][y] ? this.cells[x][y]!.serialize() : null);
      }
      cellState.push(row);
    }

    return {
      size: this.size,
      cells: cellState,
    };
  }

  clone(): Grid {
    const newGrid = new Grid(this.size);
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (this.cells[x][y]) {
          newGrid.insertTile(this.cells[x][y]!.clone());
        }
      }
    }
    return newGrid;
  }

  move(direction: number): number {
    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;
    let score = 0;

    this.prepareTiles();

    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        const cell = { x, y };
        const tile = this.cellContent(cell);

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.cellContent(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];

            this.insertTile(merged);
            this.removeTile(tile);

            tile.updatePosition(positions.next);

            score += merged.value;
          } else {
            this.moveTile(tile, positions.farthest);
          }

          if (!this.positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });

    if (!moved) score = -1;
    return score;
  }

  prepareTiles(): void {
    this.eachCell((x, y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  moveTile(tile: Tile, cell: Position): void {
    this.cells[tile.x][tile.y] = null;
    this.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  getVector(direction: number): Position {
    const map: { [key: number]: Position } = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 }, // Left
    };

    return map[direction];
  }

  buildTraversals(vector: Position): { x: number[]; y: number[] } {
    const traversals: { x: number[]; y: number[] } = { x: [], y: [] };

    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    if (vector.x === 1) traversals.x.reverse();
    if (vector.y === 1) traversals.y.reverse();

    return traversals;
  }

  findFarthestPosition(
    cell: Position,
    vector: Position
  ): { farthest: Position; next: Position } {
    let previous: Position;

    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.withinBounds(cell) && this.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell, // Used to check if a merge is required
    };
  }

  positionsEqual(first: Position, second: Position): boolean {
    return first.x === second.x && first.y === second.y;
  }

  equals(grid: Grid): boolean {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (!!this.cells[x][y] && !!grid.cells[x][y]) {
          if (this.cells[x][y]!.value !== grid.cells[x][y]!.value) {
            return false;
          }
        }
        if (!!this.cells[x][y] !== !!grid.cells[x][y]) {
          return false;
        }
      }
    }
    return true;
  }

  largest(): number {
    let largest = 0;
    this.eachCell((x, y, cell) => {
      if (cell) {
        if (cell.value > largest) {
          largest = cell.value;
        }
      }
    });
    return largest;
  }
}

export default Grid;
