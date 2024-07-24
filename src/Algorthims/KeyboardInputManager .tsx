type Callback = (data?: any) => void;

interface EventMap {
  [event: string]: Callback[];
}

class KeyboardInputManager {
  events: EventMap;
  eventTouchstart: string;
  eventTouchmove: string;
  eventTouchend: string;

  constructor() {
    this.events = {};

    if ((navigator as any).msPointerEnabled) {
      // Internet Explorer 10 style
      this.eventTouchstart = "MSPointerDown";
      this.eventTouchmove = "MSPointerMove";
      this.eventTouchend = "MSPointerUp";
    } else {
      this.eventTouchstart = "touchstart";
      this.eventTouchmove = "touchmove";
      this.eventTouchend = "touchend";
    }

    this.listen();
  }

  on(event: string, callback: Callback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, data?: any): void {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  listen(): void {
    const map: { [key: number]: number } = {
      38: 0, // Up
      39: 1, // Right
      40: 2, // Down
      37: 3, // Left
      75: 0, // Vim up
      76: 1, // Vim right
      74: 2, // Vim down
      72: 3, // Vim left
      87: 0, // W
      68: 1, // D
      83: 2, // S
      65: 3, // A
    };

    document.addEventListener("keydown", (event) => {
      const modifiers =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      const mapped = map[event.which];

      // Ignore the event if it's happening in a text field
      if (this.targetIsInput(event)) return;

      if (!modifiers) {
        if (mapped !== undefined) {
          event.preventDefault();
          this.emit("move", mapped);
        }
      }

      // R key restarts the game
      if (!modifiers && event.which === 82) {
        this.restart(event);
      }
    });

    this.bindButtonPress(".retry-button", this.restart);
    this.bindButtonPress(".restart-button", this.restart);
    this.bindButtonPress(".keep-playing-button", this.keepPlaying);
    this.bindButtonPress(".ai-solver-button", this.autoRun);

    const gameContainer = document.getElementsByClassName(
      "game-container"
    )[0] as HTMLElement;

    let touchStartClientX: number, touchStartClientY: number;

    gameContainer.addEventListener(this.eventTouchstart, (event) => {
      if (!(event instanceof TouchEvent)) return;

      if (
        (!(navigator as any).msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches.length > 1 ||
        this.targetIsInput(event)
      ) {
        return; // Ignore if touching with more than 1 finger or touching input
      }

      if ((navigator as any).msPointerEnabled) {
        touchStartClientX = (event as any).pageX;
        touchStartClientY = (event as any).pageY;
      } else {
        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
      }

      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchmove, (event) => {
      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchend, (event) => {
      if (!(event instanceof TouchEvent)) return;

      if (
        (!(navigator as any).msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0 ||
        this.targetIsInput(event)
      ) {
        return; // Ignore if still touching with one or more fingers or input
      }

      let touchEndClientX: number, touchEndClientY: number;

      if ((navigator as any).msPointerEnabled) {
        touchEndClientX = (event as any).pageX;
        touchEndClientY = (event as any).pageY;
      } else {
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
      }

      const dx = touchEndClientX - touchStartClientX;
      const absDx = Math.abs(dx);

      const dy = touchEndClientY - touchStartClientY;
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        this.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0);
      }
    });
  }

  restart(event: Event): void {
    event.preventDefault();
    this.emit("restart");
  }

  keepPlaying(event: Event): void {
    event.preventDefault();
    this.emit("keepPlaying");
  }

  autoRun(event: Event): void {
    event.preventDefault();
    this.emit("autoRun");
  }

  bindButtonPress(selector: string, fn: (event: Event) => void): void {
    const button = document.querySelector(selector) as HTMLElement;
    button.addEventListener("click", fn.bind(this));
    button.addEventListener(this.eventTouchend, fn.bind(this));
  }

  targetIsInput(event: Event): boolean {
    return (event.target as HTMLElement).tagName.toLowerCase() === "input";
  }
}

export default KeyboardInputManager;
