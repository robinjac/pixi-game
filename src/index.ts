import "./style.css";
import { Assets, Sprite, Text, SpriteSource, Texture, Graphics } from "pixi.js";
import { createButton, Button } from "./button";
import {
  game,
  Tuple,
  takeFirst,
  useScale,
  setPosition,
  repeat,
  Selected,
  gameWidth,
  gameHeight,
} from "./shared";

Text.defaultResolution = 3;
Text.defaultAutoResolution = false;

const otherTextures: Tuple<string>[] = [
  ["blank", "assets/blank.png"],
  ["button", "assets/button2.png"],
  ["mystery", "assets/mystery.png"],
  ["win", "assets/win.png"],
];

const symTextures: Tuple<string>[] = repeat(4)((num) => [
  `sym${num}`,
  `assets/sym${num}.png`,
]);

async function loadGameAssets(): Promise<Record<string, SpriteSource>> {
  const textures: Tuple<string>[] = [...otherTextures, ...symTextures];

  for (const [key, url] of textures) {
    Assets.add(key, url);
  }

  return Assets.load(textures.map(takeFirst));
}

window.onload = async (): Promise<void> => {
  const textures = await loadGameAssets();

  const graphic = new Graphics();

  graphic.beginFill(0x4a2299); // Purple background
  graphic.drawRoundedRect(0, 0, 1136, 640, 16);
  graphic.endFill();

  const bgTexture = game.app.renderer.generateTexture(graphic);

  const background = Sprite.from(bgTexture);
  const button = Sprite.from(textures.button);

  const mystery = Sprite.from(textures.mystery);
  setPosition(mystery, 0.5, 0.16);

  const number = Sprite.from(textures.blank);
  useScale(number)(0.8);
  setPosition(number, 0.5, 0.1);

  // Create win scene
  // const win = Sprite.from(textures.win);

  // Create lose scene
  const youLostText = new Text("Aww you guessed wrong! =(", {
    fill: 0xffffff,
    fontSize: 20,
  });

  setPosition(youLostText, 0.5, 0.45);

  const youWonText = new Text("Guessed correct! :D ", {
    fill: 0xffffff,
    fontSize: 20,
  });

  setPosition(youWonText, 0.5, 0.45);

  const chooseButton = createButton(button, 0.5, 0.92, 160, 140, goToFinal);

  const playAgainButton = createButton(
    new Text("PLAY AGAIN", { fill: 0xffffff, fontSize: 14 }),
    0.5,
    0.86,
    180,
    60,
    goToStart,
  );

  let floatTime = 0;
  const baseY = chooseButton.source.y; // original Y position

  const animateButton = (delta: number) => {
    floatTime += delta * 0.05; // speed of floating

    const floatAmplitude = 5; // how many pixels up and down
    chooseButton.source.y = baseY + Math.sin(floatTime) * floatAmplitude;
  };

  let pulseTime = 0;

  const animateMystery = (delta: number) => {
    pulseTime += delta * 0.1;

    mystery.rotation -= 0.1;

    const scale = 1 + Math.sin(pulseTime) * 0.3; // amplitude +- 30

    mystery.scale.set(scale);
  };

  let fadeTime = 0;
  const fadeDuration = 60; // frames or ticker delta units
  const startY = playAgainButton.source.y - 30; // starting Y position
  const endY = playAgainButton.source.y; // final Y position after slide

  // Initialize
  playAgainButton.source.alpha = 0;
  playAgainButton.source.y = startY;

  const animateFadeSlide = (delta: number) => {
    if (fadeTime < fadeDuration) {
      fadeTime += delta;

      // Fade in
      playAgainButton.source.alpha = Math.min(fadeTime / fadeDuration, 1);

      // Slide down
      playAgainButton.source.y =
        startY + (fadeTime / fadeDuration) * (endY - startY);
    }
  };

  const selectionButtons: Button[] = repeat(4)((num) => {
    const [key] = symTextures[num - 1];
    const sprite = Sprite.from(textures[key]);

    const button = createButton(
      sprite,
      0.21 + num / 8.7,
      0.6,
      102,
      102,
      () => {
        game.select(num as Selected);

        chooseButton.disabled = !game.maxSelectionReached;

        for (const [index, button] of selectionButtons.entries()) {
          button.active =
            chooseButton.disabled || game.hasSelected((index + 1) as Selected);
        }

        if (!chooseButton.disabled) {
          game.app.ticker.add(animateButton);
        } else {
          game.app.ticker.remove(animateButton);
          // Reset position
          chooseButton.source.y = baseY;
        }
      },
    );

    return button;
  });

  function goToFinal() {
    const winnerNumber = (Math.floor(Math.random() * 4) + 1) as Selected;

    const won = game.hasSelected(winnerNumber);

    chooseButton.visible = false;

    for (const button of selectionButtons) {
      button.source.interactive = false;
    }

    game.app.ticker.remove(animateButton);
    game.app.ticker.add(animateMystery);

    setTimeout(() => {
      const [key] = symTextures[winnerNumber - 1];
      number.texture = textures[key] as Texture;

      game.app.ticker.remove(animateMystery);
      mystery.visible = false;

      if (won) {
        setTimeout(() => {
          youWonText.visible = true;

          playAgainButton.source.y = endY;
          playAgainButton.source.alpha = 1;

          setTimeout(() => {
            playAgainButton.visible = true;
            game.app.ticker.add(animateFadeSlide);
          }, 600);

          /*   win.visible = true;
          win.alpha = 0; */

          /*   const animateWin = (delta: number) => {
            win.alpha += 0.1;
            if (win.alpha <= 1) {
              win.alpha += 0.1;
            } else {
              win.alpha = 1;
              game.app.ticker.remove(animateWin);
              playAgainButton.visible = true;
            }
          }; */

          // game.app.ticker.add(animateWin);
        }, 1200);
      } else {
        youLostText.visible = true;

        setTimeout(() => {
          playAgainButton.visible = true;
          game.app.ticker.add(animateFadeSlide);
        }, 600);

        chooseButton.visible = false;
      }
    }, 1000);
  }

  function goToStart() {
    youWonText.visible = false;
    youLostText.visible = false;

    for (const button of selectionButtons) {
      button.disabled = false;
    }

    playAgainButton.visible = false;
    fadeTime = 0;
    playAgainButton.source.alpha = 0;
    playAgainButton.source.y = startY;
    game.app.ticker.remove(animateFadeSlide);

    chooseButton.visible = true;
    chooseButton.disabled = true;

    number.texture = textures.blank as Texture;
    mystery.visible = true;
    mystery.rotation = 0;

    game.clearSelection();
  }

  game.stage.addChild(background);
  game.stage.addChild(chooseButton.source);

  for (const button of selectionButtons) {
    game.stage.addChild(button.source);
  }

  game.stage.addChild(number);
  game.stage.addChild(mystery);

  game.stage.addChild(youLostText);
  game.stage.addChild(youWonText);
  // game.stage.addChild(win);
  game.stage.addChild(playAgainButton.source);

  resizeCanvas();
  goToStart();
};

function resizeCanvas(): void {
  game.app.renderer.resize(window.innerWidth, window.innerHeight);

  game.stage.scale.x = window.innerWidth / gameWidth;
  game.stage.scale.y = window.innerWidth / gameWidth;

  if (game.stage.height >= window.innerHeight) {
    game.stage.scale.x = window.innerHeight / gameHeight;
    game.stage.scale.y = window.innerHeight / gameHeight;

    game.stage.x = (window.innerWidth - game.stage.width) / 2;
  } else {
    game.stage.y = (window.innerHeight - game.stage.height) / 2;
  }
}

document.body.appendChild<HTMLCanvasElement>(
  game.app.view as HTMLCanvasElement,
);

window.addEventListener("resize", resizeCanvas);
