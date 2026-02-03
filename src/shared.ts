import { Application, Sprite, Text } from "pixi.js";

type Tuple<a> = [a, a];

const takeFirst = <T>([first]: Tuple<T>): T => first;

const useScale = (source: Sprite | Text, width?: number, height?: number) => {
  const w = width ?? source.width;
  const h = height ?? source.height;

  return (scale: number) => {
    source.width = w * scale;
    source.height = h * scale;
  };
};

const gameWidth = 1136;
const gameHeight = 640;

const app = new Application({
  backgroundColor: 0x00000,
  width: gameWidth,
  height: gameHeight,
});

type Selected = 1 | 2 | 3 | 4

let selectedValue: Selected | null = null;

const game = {
  app,
  stage: app.stage,
  select: (value: Selected) => {
    if (selectedValue === value) {
      selectedValue = null;
    } else {
      selectedValue = value;
    }
  },
  hasSelected: (value: Selected) => selectedValue === value,
  get maxSelectionReached() {
    return selectedValue !== null;
  },
  clearSelection: () => (selectedValue = null),
};

/** Sets the position with normalized coordinates (values 0 - 1) within the game screen */
const setPosition = (source: Sprite | Text, x: number, y: number) => {
  source.anchor.set(0.5);
  source.x = source.width / 2 + (gameWidth - source.width) * x;
  source.y = source.height / 2 + (gameHeight - source.height) * y;
};

const repeat = (length: number) => <T>(fn: (index: number) => T): T[] =>
  Array.from({ length }, (_, index) => fn(index + 1));

export {
  Tuple,
  Sprite,
  Text,
  Selected,
  takeFirst,
  useScale,
  setPosition,
  repeat,
  game,
  gameWidth,
  gameHeight,
};
