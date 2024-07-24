import "./App.css";

export const App = () => {
  return (
    <div className="App">
      <div className="container">
        <div className="heading">
          <h1 className="title">2048</h1>
          <div className="scores-container">
            <div className="score-container">0</div>
            <div className="best-container">0</div>
          </div>
        </div>

        <div className="above-game">
          <p className="game-intro">
            Join the numbers and get to the <strong>2048 tile!</strong>
          </p>
          <a className="restart-button" href="#!">
            New Game
          </a>
        </div>

        <div className="game-container">
          <div className="game-message">
            <p></p>
            <div className="lower">
              <a className="keep-playing-button" href="#!">
                Keep going
              </a>
              <a className="retry-button" href="#!">
                Try again
              </a>
            </div>
          </div>

          <div className="grid-container">
            <div className="grid-row">
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
            </div>
            <div className="grid-row">
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
            </div>
            <div className="grid-row">
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
            </div>
            <div className="grid-row">
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
              <div className="grid-cell"></div>
            </div>
          </div>

          <div className="tile-container"></div>
        </div>

        <div className="ai-block">
          <div style={{ width: "350px", float: "left" }} className="ai-options">
            <div style={{ margin: "5px", padding: "5px" }}>
              <label>Select Algorithm </label>
              <select style={{ float: "right" }} className="algorithm">
                <option value="minimax">Minimax Algorithm</option>
                <option value="expectimax">Expectimax Algorithm</option>
              </select>
            </div>
            <div style={{ margin: "5px", padding: "5px" }}>
              <label>Depth Limit </label>
              <input
                className="depth-limit"
                style={{ float: "right" }}
                type="number"
                min="1"
                max="999"
                defaultValue="3"
              />
            </div>
          </div>
          <div style={{ float: "right", paddingTop: "20px" }}>
            <a className="ai-solver-button" href="#!">
              Auto-Run
            </a>
          </div>
        </div>

        <p className="game-explanation">
          <strong className="important">How to play:</strong> Use your{" "}
          <strong>arrow keys</strong> to move the tiles. When two tiles with the
          same number touch, they <strong>merge into one!</strong>
        </p>
        <hr />
        <p>
          <strong className="important">Note:</strong> This is not the official
          2048. The original 2048 can be found{" "}
          <a href="http://git.io/2048">here</a>.
        </p>
        <hr />
        <p>
          Created by{" "}
          <a
            href="http://gabrielecirulli.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gabriele Cirulli.
          </a>{" "}
          Based on{" "}
          <a
            href="https://itunes.apple.com/us/app/1024!/id823499224"
            target="_blank"
            rel="noopener noreferrer"
          >
            1024 by Veewo Studio
          </a>{" "}
          and conceptually similar to{" "}
          <a
            href="http://asherv.com/threes/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Threes by Asher Vollmer
          </a>
          .
        </p>
        <p>
          AI created by{" "}
          <a
            href="http://github.com/azaky"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ahmad Zaky
          </a>
          , inspired by{" "}
          <a
            href="http://ov3y.github.io/2048-AI/"
            target="_blank"
            rel="noopener noreferrer"
          >
            the original 2048-AI
          </a>{" "}
          and{" "}
          <a
            href="http://stackoverflow.com/questions/22342854/what-is-the-optimal-algorithm-for-the-game-2048/22389702"
            target="_blank"
            rel="noopener noreferrer"
          >
            this thread of Stackoverflow
          </a>
          .
        </p>
      </div>
    </div>
  );
};
