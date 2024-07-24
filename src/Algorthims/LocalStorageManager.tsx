// fakeStorage.ts
interface FakeStorage {
  _data: { [key: string]: string };

  setItem(id: string, val: string): void;
  getItem(id: string): string | undefined;
  removeItem(id: string): boolean;
  clear(): void;
}

window.fakeStorage = {
  _data: {},

  setItem(id: string, val: string) {
    this._data[id] = String(val);
  },

  getItem(id: string) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem(id: string) {
    return delete this._data[id];
  },

  clear() {
    this._data = {};
  },
} as FakeStorage;

// LocalStorageManager.ts
class LocalStorageManager {
  bestScoreKey: string;
  gameStateKey: string;
  noticeClosedKey: string;
  storage: Storage | FakeStorage;

  constructor() {
    this.bestScoreKey = "bestScore";
    this.gameStateKey = "gameState";
    this.noticeClosedKey = "noticeClosed";

    const supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.fakeStorage;
  }

  localStorageSupported(): boolean {
    const testKey = "test";
    const storage = window.localStorage;

    try {
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Best score getters/setters
  getBestScore(): number {
    return parseInt(this.storage.getItem(this.bestScoreKey) || "0", 10);
  }

  setBestScore(score: number): void {
    this.storage.setItem(this.bestScoreKey, score.toString());
  }

  // Game state getters/setters and clearing
  getGameState(): any {
    const stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }

  setGameState(gameState: any): void {
    this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
  }

  clearGameState(): void {
    this.storage.removeItem(this.gameStateKey);
  }

  setNoticeClosed(noticeClosed: boolean): void {
    this.storage.setItem(this.noticeClosedKey, JSON.stringify(noticeClosed));
  }

  getNoticeClosed(): boolean {
    return JSON.parse(this.storage.getItem(this.noticeClosedKey) || "false");
  }
}

export default LocalStorageManager;
