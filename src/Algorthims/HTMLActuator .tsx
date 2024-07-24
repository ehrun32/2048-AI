import Tile from "./Tile";
import Grid from "./Grid";

interface Metadata {
  score: number;
  bestScore: number;
  terminated: boolean;
  over: boolean;
  won: boolean;
}

declare const ga: Function;
declare const twttr: any;

class HTMLActuator {
  tileContainer: HTMLElement | null;
  scoreContainer: HTMLElement | null;
  bestContainer: HTMLElement | null;
  messageContainer: HTMLElement | null;
  sharingContainer: HTMLElement | null;
  score: number;

  constructor() {
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");
    this.sharingContainer = document.querySelector(".score-sharing");

    this.score = 0;
  }

  actuate(grid: Grid, metadata: Metadata): void {
    window.requestAnimationFrame(() => {
      if (this.tileContainer) {
        this.clearContainer(this.tileContainer);

        grid.cells.forEach((column) => {
          column.forEach((cell) => {
            if (cell) {
              this.addTile(cell);
            }
          });
        });
      }

      if (this.scoreContainer) {
        this.updateScore(metadata.score);
      }

      if (this.bestContainer) {
        this.updateBestScore(metadata.bestScore);
      }

      if (metadata.terminated) {
        if (metadata.over) {
          this.message(false); // You lose
        } else if (metadata.won) {
          this.message(true); // You win!
        }
      }
    });
  }

  continueGame(): void {
    if (typeof ga !== "undefined") {
      ga("send", "event", "game", "restart");
    }

    this.clearMessage();
  }

  clearContainer(container: HTMLElement): void {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  addTile(tile: Tile): void {
    if (!this.tileContainer) return;

    const wrapper = document.createElement("div");
    const inner = document.createElement("div");
    const position = tile.previousPosition || { x: tile.x, y: tile.y };
    const positionClass = this.positionClass(position);

    const classes = ["tile", "tile-" + tile.value, positionClass];

    if (tile.value > 2048) classes.push("tile-super");

    this.applyClasses(wrapper, classes);

    inner.classList.add("tile-inner");
    inner.textContent = tile.value.toString();

    if (tile.previousPosition) {
      window.requestAnimationFrame(() => {
        classes[2] = this.positionClass({ x: tile.x, y: tile.y });
        this.applyClasses(wrapper, classes); // Update the position
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);

      tile.mergedFrom.forEach((merged) => {
        this.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }

    wrapper.appendChild(inner);
    this.tileContainer.appendChild(wrapper);
  }

  applyClasses(element: HTMLElement, classes: string[]): void {
    element.setAttribute("class", classes.join(" "));
  }

  normalizePosition(position: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    return { x: position.x + 1, y: position.y + 1 };
  }

  positionClass(position: { x: number; y: number }): string {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
  }

  updateScore(score: number): void {
    if (!this.scoreContainer) return;

    this.clearContainer(this.scoreContainer);

    const difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score.toString();

    if (difference > 0) {
      const addition = document.createElement("div");
      addition.classList.add("score-addition");
      addition.textContent = "+" + difference;

      this.scoreContainer.appendChild(addition);
    }
  }

  updateBestScore(bestScore: number): void {
    if (this.bestContainer) {
      this.bestContainer.textContent = bestScore.toString();
    }
  }

  message(won: boolean): void {
    if (!this.messageContainer) return;

    const type = won ? "game-won" : "game-over";
    const message = won ? "You win!" : "Game over!";

    if (typeof ga !== "undefined") {
      ga("send", "event", "game", "end", type, this.score);
    }

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;

    if (this.sharingContainer) {
      this.clearContainer(this.sharingContainer);
      this.sharingContainer.appendChild(this.scoreTweetButton());
      twttr.widgets.load();
    }
  }

  clearMessage(): void {
    if (!this.messageContainer) return;

    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-over");
  }

  scoreTweetButton(): HTMLElement {
    const tweet = document.createElement("a");
    tweet.classList.add("twitter-share-button");
    tweet.setAttribute("href", "https://twitter.com/share");
    tweet.setAttribute("data-via", "gabrielecirulli");
    tweet.setAttribute("data-url", "http://git.io/2048");
    tweet.setAttribute(
      "data-counturl",
      "http://gabrielecirulli.github.io/2048/"
    );
    tweet.textContent = "Tweet";

    const text =
      "I scored " +
      this.score +
      " points at 2048, a game where you " +
      "join numbers to score high! #2048game";
    tweet.setAttribute("data-text", text);

    return tweet;
  }
}

export default HTMLActuator;
