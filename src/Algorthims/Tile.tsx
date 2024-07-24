interface Position {
  x: number;
  y: number;
}

class Tile {
  x: number;
  y: number;
  value: number;
  previousPosition: Position | null;
  mergedFrom: Tile[] | null;

  constructor(position: Position, value: number = 2) {
    this.x = position.x;
    this.y = position.y;
    this.value = value;

    this.previousPosition = null;
    this.mergedFrom = null; // Tracks tiles that merged together
  }

  savePosition(): void {
    this.previousPosition = { x: this.x, y: this.y };
  }

  updatePosition(position: Position): void {
    this.x = position.x;
    this.y = position.y;
  }

  serialize(): { position: Position; value: number } {
    return {
      position: {
        x: this.x,
        y: this.y,
      },
      value: this.value,
    };
  }

  clone(): Tile {
    return new Tile({ x: this.x, y: this.y }, this.value);
  }
}

export default Tile;
