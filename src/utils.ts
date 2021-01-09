import { UA } from './ua';

export function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomUA() {
  return UA[randomRange(0, UA.length)];
}

export function sleep(delay: number) {
  return new Promise(res => {
    setTimeout(() => {
      res(true);
    }, delay);
  });
}
