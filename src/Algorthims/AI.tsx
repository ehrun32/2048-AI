import Grid from "./Grid";
import Tile from "./Tile";

interface Move {
  move: number;
  score: number;
}

class AI {
  grid: Grid;
  algorithm: string;
  depthlimit: number;
  memo: Record<number, Move>;

  constructor(grid: Grid) {
    this.grid = grid;
    this.algorithm = "expectimax";
    this.depthlimit = 3;
    this.memo = {};
  }

  getBestMove(): number {
    let move = -1;
    let best: Move = { move: -1, score: 0 };

    switch (this.algorithm) {
      case "minimax":
        best = this.getMoveMinimax();
        move = best.move;
        break;
      case "expectimax":
        best = this.getMoveExpectimax();
        move = best.move;
        break;
    }

    document.title = "score: " + best.score;
    if (move === -1 || this.grid.clone().move(move) === -1) {
      do {
        move = Math.floor(Math.random() * 4);
      } while (this.grid.clone().move(move) === -1);
    }
    return move;
  }

  getMoveMaxScore(): number {
    let bestMove = -1;
    let bestScore = 0;
    for (let direction = 0; direction < 4; direction++) {
      const dummyGrid = this.grid.clone();
      const dummyScore = dummyGrid.move(direction);
      if (dummyScore > bestScore) {
        bestMove = direction;
        bestScore = dummyScore;
      }
    }
    return bestMove;
  }

  getMoveMaxScoreAfterKMoves(grid: Grid, k: number): Move {
    if (k === 0) {
      return { move: -1, score: 0 };
    }

    const candidates: number[] = new Array(4).fill(-1);

    for (let direction = 0; direction < 4; direction++) {
      const newGrid = grid.clone();
      let newScore = newGrid.move(direction);

      if (newScore === -1) {
        candidates[direction] = -1;
      } else {
        const availableCells = newGrid.availableCells();
        const nEmptyCells = availableCells.length;
        availableCells.forEach((cell) => {
          const newGrid2 = newGrid.clone();
          newGrid2.insertTile(new Tile(cell, 2));
          newScore +=
            0.9 *
            (1.0 / nEmptyCells) *
            this.getMoveMaxScoreAfterKMoves(newGrid2, k - 1).score;

          const newGrid4 = newGrid.clone();
          newGrid4.insertTile(new Tile(cell, 4));
          newScore +=
            0.1 *
            (1.0 / nEmptyCells) *
            this.getMoveMaxScoreAfterKMoves(newGrid4, k - 1).score;
        });
        candidates[direction] = newScore;
      }
    }

    let bestMove: Move = { move: -1, score: 0 };
    for (let direction = 0; direction < 4; direction++) {
      if (candidates[direction] > bestMove.score) {
        bestMove = { move: direction, score: candidates[direction] };
      }
    }
    return bestMove;
  }

  getMoveYanfaAlgorithm(): number {
    if (this.grid.clone().move(3) !== -1) {
      return 3;
    }
    if (this.grid.clone().move(2) !== -1) {
      return 2;
    }
    if (this.grid.clone().move(0) !== -1) {
      return 0;
    }
    return 1;
  }

  getHeuristic(grid: Grid): number {
    let score = 0;
    const largest = grid.largest();
    grid.eachCell((x, y, cell) => {
      if (!cell) {
        score += 4096;
      } else {
        const distance = Math.min(
          Math.min(x, grid.size - 1 - x),
          Math.min(y, grid.size - 1 - y)
        );
        score -= 10 * distance * cell.value;

        if (cell.value === largest) {
          const xBorder = x === 0 || x === grid.size - 1;
          const yBorder = y === 0 || y === grid.size - 1;
          if (xBorder && yBorder) {
            score += 4096;
          }
        }
      }
    });

    for (let x = 1; x < grid.size; x++) {
      for (let y = 1; y < grid.size; y++) {
        if (grid.cells[x][y] && grid.cells[x][y - 1]) {
          score -=
            10 *
            Math.abs(grid.cells[x][y]!.value - grid.cells[x][y - 1]!.value);
        }
        if (grid.cells[x][y] && grid.cells[x - 1][y]) {
          score -=
            10 *
            Math.abs(grid.cells[x][y]!.value - grid.cells[x - 1][y]!.value);
        }
      }
    }
    return score;
  }

  getHashCode(grid: Grid): number {
    const p = 982451653;
    let hash = 0;
    grid.eachCell((x, y, cell) => {
      const addum = cell ? cell.value : 0;
      hash = 4096 * hash + addum;
      hash %= p;
    });
    return hash;
  }

  getMoveExpectimax(): Move {
    this.memo = {};
    return this.getMoveExpectimaxDFS(this.grid, this.depthlimit);
  }

  findMemoization(grid: Grid): Move | undefined {
    return this.memo[this.getHashCode(grid)];
  }

  addMemoization(grid: Grid, move: number, score: number): void {
    const hash = this.getHashCode(grid);
    this.memo[hash] = { move, score };
  }

  getMoveExpectimaxDFS(grid: Grid, depth: number): Move {
    if (depth === 0) {
      const result = { move: -1, score: this.getHeuristic(grid) };
      this.addMemoization(grid, result.move, result.score);
      return result;
    }

    const memoized = this.findMemoization(grid);
    if (memoized) {
      return memoized;
    }

    const candidates: number[] = new Array(4).fill(-999999);

    for (let direction = 0; direction < 4; direction++) {
      const newGrid = grid.clone();
      let newScore = newGrid.move(direction);

      if (newScore === -1) {
        candidates[direction] = -999999;
      } else {
        const availableCells = newGrid.availableCells();
        const nEmptyCells = availableCells.length;
        newScore = 0;
        availableCells.forEach((cell) => {
          const newGrid2 = newGrid.clone();
          newGrid2.insertTile(new Tile(cell, 2));
          newScore +=
            0.9 *
            (1.0 / nEmptyCells) *
            this.getMoveExpectimaxDFS(newGrid2, depth - 1).score;

          const newGrid4 = newGrid.clone();
          newGrid4.insertTile(new Tile(cell, 4));
          newScore +=
            0.1 *
            (1.0 / nEmptyCells) *
            this.getMoveExpectimaxDFS(newGrid4, depth - 1).score;
        });
        candidates[direction] = newScore;
      }
    }

    let bestMove: Move = { move: 0, score: candidates[0] };
    for (let direction = 1; direction < 4; direction++) {
      if (candidates[direction] > bestMove.score) {
        bestMove = { move: direction, score: candidates[direction] };
      }
    }
    this.addMemoization(grid, bestMove.move, bestMove.score);
    return bestMove;
  }

  getMoveMinimax(): Move {
    let bestMove: Move = { score: -999999, move: -1 };
    const mindepth = Math.floor(this.depthlimit / 2);
    const maxdepth = this.depthlimit;
    for (let depth = mindepth; depth <= maxdepth; depth++) {
      const temp = this.getMoveMinimaxDFS(
        this.grid,
        -999999,
        999999,
        { player: true },
        depth
      );
      if (temp.score > bestMove.score) {
        bestMove = temp;
      }
    }
    return bestMove;
  }

  getMoveMinimaxDFS(
    grid: Grid,
    alpha: number,
    beta: number,
    turn: { player?: boolean; computer?: boolean },
    depth: number
  ): Move {
    if (depth === 0) {
      return { move: -1, score: this.getHeuristic(grid) };
    }

    if (turn.player) {
      let bestMove: Move = { move: -1, score: alpha };
      for (let direction = 0; direction < 4; direction++) {
        const newGrid = grid.clone();
        if (newGrid.move(direction) === -1) {
          continue;
        }
        const result = this.getMoveMinimaxDFS(
          newGrid,
          alpha,
          beta,
          { computer: true },
          depth - 1
        );
        if (result.score > alpha) {
          alpha = Math.max(alpha, result.score);
          bestMove = { move: direction, score: alpha };
        }
        if (beta <= alpha) {
          break;
        }
      }
      return bestMove;
    } else if (turn.computer) {
      let terminated = false;
      for (let x = 0; x < grid.size && !terminated; x++) {
        for (let y = 0; y < grid.size && !terminated; y++) {
          if (!grid.cells[x][y]) {
            const newGrid2 = grid.clone();
            newGrid2.insertTile(new Tile({ x, y }, 2));
            let result = this.getMoveMinimaxDFS(
              newGrid2,
              alpha,
              beta,
              { player: true },
              depth - 1
            );
            beta = Math.min(beta, result.score);
            if (beta <= alpha) {
              terminated = true;
            }

            const newGrid4 = grid.clone();
            newGrid4.insertTile(new Tile({ x, y }, 4));
            result = this.getMoveMinimaxDFS(
              newGrid4,
              alpha,
              beta,
              { player: true },
              depth - 1
            );
            beta = Math.min(beta, result.score);
            if (beta <= alpha) {
              terminated = true;
            }
          }
        }
      }
      return { score: beta, move: -1 };
    }
    return { move: -1, score: 0 };
  }
}

export default AI;
