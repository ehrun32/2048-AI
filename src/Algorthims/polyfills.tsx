export function applyClassListPolyfill() {
  if (
    typeof window.Element === "undefined" ||
    "classList" in document.documentElement
  ) {
    return;
  }

  const prototype = Array.prototype,
    push = prototype.push,
    splice = prototype.splice,
    join = prototype.join;

  class DOMTokenList {
    el: HTMLElement;
    [index: number]: string;
    length: number;

    constructor(el: HTMLElement) {
      this.el = el;
      this.length = 0;
      // The className needs to be trimmed and split on whitespace to retrieve a list of classes.
      const classes = el.className.replace(/^\s+|\s+$/g, "").split(/\s+/);
      for (let i = 0; i < classes.length; i++) {
        push.call(this, classes[i]);
      }
      this.length = classes.length;
    }

    add(token: string) {
      if (this.contains(token)) return;
      push.call(this, token);
      this.el.className = this.toString();
      this.length++;
    }

    contains(token: string) {
      return this.el.className.indexOf(token) !== -1;
    }

    item(index: number) {
      return this[index] || null;
    }

    remove(token: string) {
      if (!this.contains(token)) return;
      for (let i = 0; i < this.length; i++) {
        if (this[i] === token) {
          splice.call(this, i, 1);
          this.length--;
          break;
        }
      }
      this.el.className = this.toString();
    }

    toString() {
      return join.call(this, " ");
    }

    toggle(token: string) {
      if (!this.contains(token)) {
        this.add(token);
      } else {
        this.remove(token);
      }

      return this.contains(token);
    }
  }

  (window as any).DOMTokenList = DOMTokenList;

  function defineElementGetter(
    obj: any,
    prop: string,
    getter: (this: HTMLElement) => any
  ) {
    if (Object.defineProperty) {
      Object.defineProperty(obj, prop, {
        get: getter,
      });
    } else {
      obj.__defineGetter__(prop, getter);
    }
  }

  defineElementGetter(
    HTMLElement.prototype,
    "classList",
    function (this: HTMLElement) {
      return new (window as any).DOMTokenList(this);
    }
  );
}
