export class GestureClickGuard {
  #phase = 'ready';

  begin() { this.#phase = 'tracking'; }

  drag() { this.#phase = 'dragged'; }

  finish() {
    this.#phase = this.#phase === 'dragged' ? 'blocked' : 'ready';
  }

  cancel() { this.#phase = 'ready'; }

  consume(detail) {
    if (detail === 0) return false;
    const blocked = this.#phase === 'blocked' || this.#phase === 'dragged';
    this.#phase = 'ready';
    return blocked;
  }
}
