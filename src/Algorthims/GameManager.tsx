import AI from "./AI";
import Grid from "./Grid";
import Tile from "./Tile";

interface InputManager {
  on(event: string, callback: (event?: any) => void): void;
}

interface Actuator {
  actuate(grid: Grid, metadata: any): void;
  continueGame(): void;
}

interface StorageManager {
  getGameState(): any;
  setGameState(gameState: any): void;
  clearGameState(): void;
  getBestScore(): number;
  setBestScore(score: number): void;
}

class GameManager {
  size: number;
  inputManager: InputManager;
  storageManager: StorageManager;
  actuator: Actuator;
  startTiles: number;
  grid!: Grid;
  score!: number;
  over!: boolean;
  won!: boolean;
  keepPlayingFlag!: boolean;
  ai!: AI;
  running!: boolean;

  constructor(
    size: number,
    InputManager: new () => InputManager,
    Actuator: new () => Actuator,
    StorageManager: new () => StorageManager
  ) {
    this.size = size;
    this.inputManager = new InputManager();
    this.storageManager = new StorageManager();
    this.actuator = new Actuator();

    this.startTiles = 2;

    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("keepPlaying", this.keepPlayingGame.bind(this));

    this.inputManager.on("autoRun", () => {
      if (this.isGameTerminated()) {
        this.restart();
      }
      const autoRunButton = document.querySelector(
        ".ai-solver-button"
      ) as HTMLButtonElement;
      if (this.running) {
        this.running = false;
        autoRunButton.innerHTML = "Auto-Run";
      } else {
        this.running = true;
        autoRunButton.innerHTML = "Stop";
        const algoOption = document.querySelector(
          ".algorithm"
        ) as HTMLSelectElement;
        this.ai.algorithm = algoOption.value;
        const depthLimit = document.querySelector(
          ".depth-limit"
        ) as HTMLInputElement;
        this.ai.depthlimit = parseInt(depthLimit.value);
        this.autoRun();
      }
    });

    this.setup();
  }
  restart() {
    this.storageManager.clearGameState();
    this.actuator.continueGame();
    this.setup();
  }

  keepPlayingGame() {
    this.keepPlayingFlag = true;
    this.actuator.continueGame();
    if (this.running) {
      this.autoRun();
    }
  }

  autoRun() {
    const currentMove = this.ai.getBestMove();
    this.move(currentMove);
    if (this.isGameTerminated()) {
      (
        document.querySelector(".ai-solver-button") as HTMLButtonElement
      ).innerHTML = "Auto-Run";
    } else if (this.running) {
      setTimeout(() => this.autoRun(), 30);
    }
  }

  isGameTerminated() {
    return this.over || (this.won && !this.keepPlayingFlag);
  }

  setup() {
    const previousState = this.storageManager.getGameState();

    if (previousState) {
      this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
      this.score = previousState.score;
      this.over = previousState.over;
      this.won = previousState.won;
      this.keepPlayingFlag = previousState.keepPlaying;
    } else {
      this.grid = new Grid(this.size);
      this.score = 0;
      this.over = false;
      this.won = false;
      this.keepPlayingFlag = false;

      this.addStartTiles();
    }

    this.ai = new AI(this.grid);
    this.running = false;
    this.actuate();
  }

  addStartTiles() {
    for (let i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  }

  addRandomTile() {
    if (this.grid.cellsAvailable()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const tile = new Tile(this.grid.randomAvailableCell()!, value);

      this.grid.insertTile(tile);
    }
  }

  actuate() {
    if (this.storageManager.getBestScore() < this.score) {
      this.storageManager.setBestScore(this.score);
    }

    if (this.over) {
      this.storageManager.clearGameState();
    } else {
      this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(this.grid, {
      score: this.score,
      over: this.over,
      won: this.won,
      bestScore: this.storageManager.getBestScore(),
      terminated: this.isGameTerminated(),
    });
  }

  serialize() {
    return {
      grid: this.grid.serialize(),
      score: this.score,
      over: this.over,
      won: this.won,
      keepPlaying: this.keepPlayingFlag,
    };
  }

  prepareTiles() {
    this.grid.eachCell((x, y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  moveTile(tile: Tile, cell: { x: number; y: number }) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  move(direction: number) {
    if (this.isGameTerminated()) return;

    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;

    this.prepareTiles();

    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        const cell = { x, y };
        const tile = this.grid.cellContent(cell);

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.grid.cellContent(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];

            this.grid.insertTile(merged);
            this.grid.removeTile(tile);

            tile.updatePosition(positions.next);

            this.score += merged.value;
          } else {
            this.moveTile(tile, positions.farthest);
          }

          if (!this.positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });

    if (moved) {
      this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true;
      }

      this.actuate();
    }
  }

  getVector(direction: number) {
    const map: { [key: number]: { x: number; y: number } } = {
      0: { x: 0, y: -1 },
      1: { x: 1, y: 0 },
      2: { x: 0, y: 1 },
      3: { x: -1, y: 0 },
    };

    return map[direction];
  }

  buildTraversals(vector: { x: number; y: number }) {
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
    cell: { x: number; y: number },
    vector: { x: number; y: number }
  ) {
    let previous;

    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell,
    };
  }

  movesAvailable() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }

  tileMatchesAvailable() {
    let tile: Tile | null;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({ x, y });

        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            const vector = this.getVector(direction);
            const cell = { x: x + vector.x, y: y + vector.y };

            const other = this.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  positionsEqual(
    first: { x: number; y: number },
    second: { x: number; y: number }
  ) {
    return first.x === second.x && first.y === second.y;
  }
}

export default GameManager;
