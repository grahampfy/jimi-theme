// Sample JavaScript for theme preview (.js-specific scopes)
import { EventEmitter } from "events";

const MAX = 100;
let counter = 0;

export class Store extends EventEmitter {
  #state = {};

  constructor(initial = {}) {
    super();
    this.#state = { ...initial };
  }

  get(key) {
    return this.#state[key];
  }

  set(key, value) {
    this.#state[key] = value;
    this.emit("change", { key, value });
    return this;
  }
}

function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

const store = new Store({ count: 0 });

store.on("change", ({ key, value }) => {
  console.log(`changed ${key} -> ${value}`);
});

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2).filter((n) => n > 4);
const total = doubled.reduce((acc, n) => acc + n, 0);

const pattern = /^\d{3}-\d{4}$/;
const ok = pattern.test("123-4567");

async function load(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error("failed:", err.message);
    return null;
  }
}

export { debounce, store, load, MAX, counter, total, ok };
