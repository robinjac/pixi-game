import { useScale, Sprite, Text, setPosition } from "./shared";

type Button = {
  active: boolean;
  disabled: boolean;
  visible: boolean;
  source: Sprite | Text;
};

function createButton(
  source: Sprite | Text,
  x: number,
  y: number,
  width: number,
  height: number,
  onClick: () => void
): Button {
  source.interactive = true;
  source.visible = true;
  source.cursor = "pointer";

  // Button state
  let active = true;
  let pressed = false;
  let disabled = false;
  let visible = true;

  source.alpha = 1;
  source.width = width;
  source.height = height;

  setPosition(source, x, y);

  const setScale = useScale(source, width, height);

  source.on("pointerdown", () => {
    pressed = true;
    setScale(0.95);
  });

  source.on("pointerup", () => {
    if (pressed) {
      pressed = false;
      setScale(1);
      onClick();
    }
  });

  source.on("pointerover", () => {
    if (!pressed) {
      setScale(1.05);
    }
  });

  source.on("pointerleave", () => {
    setScale(1);
  });

  return {
    source,
    set active(value: boolean) {
      active = value;
      source.alpha = value ? 1 : 0.5;
    },
    get active() {
      return active;
    },
    set disabled(value: boolean) {
      disabled = value;
      source.interactive = !value;
      source.alpha = value ? 0.5 : 1;
    },
    get disabled() {
      return disabled;
    },
    set visible(value: boolean) {
      visible = value;
      source.visible = value;
    },
    get visible() {
      return visible;
    },
  };
}

export { createButton, Button };
