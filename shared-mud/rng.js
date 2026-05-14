// Mulberry32 seeded PRNG
export class RNG {
  constructor(seed) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed += 0x6D2B79F5;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick(array) {
    return array[this.nextInt(0, array.length - 1)];
  }

  pickWeighted(items, weights) {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  roll(dice, sides) {
    let total = 0;
    for (let i = 0; i < dice; i++) {
      total += this.nextInt(1, sides);
    }
    return total;
  }
}
