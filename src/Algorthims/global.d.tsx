// global.d.ts
interface FakeStorage {
  _data: { [key: string]: string };

  setItem(id: string, val: string): void;
  getItem(id: string): string | undefined;
  removeItem(id: string): boolean;
  clear(): void;
}

declare global {
  interface Window {
    fakeStorage: FakeStorage;
  }
}

export {};
