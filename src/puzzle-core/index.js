import { Point } from "paper/dist/paper-core";
import { initializeConfig } from "./initializeConfig";
import {
  itemMagnet,
  removeItemStyleToPiece,
  searchItemList,
  setItemStyleToAllPiece,
} from "./item";
import { setMoveEvent } from "./setMoveEvent";
import { uniteTiles } from "./uniteTiles";
import { cleanBorderStyle, switchDirection, updateGroupByBundles } from "./utils";
import { colors } from "./color";
import { getNewX, getNewY } from "./findNearTileGroup";
export const groupPuzzlePieces = ({ config, bundles }) => {
  updateGroupByBundles({ config, bundles });
  return config;
};

const createPuzzleConfig = () => {
  let config = {};

  const initializePuzzle = ({ puzzleImg, level, shapes, board = [], picture, canvasId = "canvas", enemyCanvasScale = 1 }) => {
    const initializedConfig = initializeConfig({ img: puzzleImg, level, board, shapes, picture, canvasId, enemyCanvasScale });
    const attachedMoveEventConfig = setMoveEvent({ config: initializedConfig });
    const attachedItemToAllPieceConfig = setItemStyleToAllPiece({
      config: attachedMoveEventConfig,
      itemList: searchItemList(board),
    });
    config = attachedItemToAllPieceConfig;
  };

  const enemyIntializePuzzle = ({ puzzleImg, level, shapes, board = [], picture, canvasId = "canvas", enemyCanvasScale = 1 }) => {
    const initializedConfig = initializeConfig({ img: puzzleImg, level, board, shapes, picture, canvasId, enemyCanvasScale });
    const attachedItemToAllPieceConfig = setItemStyleToAllPiece({
      config: initializedConfig,
      itemList: searchItemList(board),
    });
    config = attachedItemToAllPieceConfig;
  };

  const initializePuzzle2 = (config2, itemList = []) => {
    const attachedItemToAllPieceConfig = setItemStyleToAllPiece({
      config: config2,
      itemList,
    });

    config = attachedItemToAllPieceConfig;
  };

  const getConfig = () => ({ ...config });

  const lockPuzzle = (index, color) => {
    config.tiles[index].locked = true
    config.tiles[index].children[2].strokeColor = colors[color.toUpperCase()]
    config.tiles[index].children[2].strokeWidth = 3
    config.tiles[index].children[2].shadowBlur = 0
    config.tiles[index].children[2].opacity = 1
    config.tiles[index].children[2].shadowColor = colors[color.toUpperCase()]
    config.tiles[index].bringToFront()

  };

  const movePuzzles = (x, y, index) => {
    config.tiles[index].position = new Point(x, y);
    const myGtile = config.groupTiles[index]
    config.groupTiles
      .forEach(gtile => {
        if (myGtile[1] == gtile[1] && gtile[2] != myGtile[2]) {
          gtile[0].position.x = getNewX({ config, stdGtile: myGtile, targetGtile: gtile })
          gtile[0].position.y = getNewY({ config, stdGtile: myGtile, targetGtile: gtile })
        }
      })
  };

  const unLockPuzzle = (index) => {
    config.tiles[index].locked = false
    config.tiles[index].children[2].strokeColor = config.tiles[index].originStroke ?? colors.DEFAULT_STROKE
    config.tiles[index].children[2].strokeWidth = 1
    config.tiles[index].children[2].opacity = 0
    config.tiles[index].children[2].shadowColor = config.tiles[index].originShadow ?? colors.DEFAULT_SHADOW
  };

  const addPiece = ({ fromIndex, toIndex }, bundles = []) => {
    const fromGroup = config.groupTiles[fromIndex][1];
    const toGroup = config.groupTiles[toIndex][1];
    const moveTiles = config.groupTiles.filter(gtile => gtile[1] == fromGroup)
    const stdGtile = config.groupTiles[toIndex]
    moveTiles.forEach(gtile => {
      gtile[0].position.x = getNewX({ config, stdGtile, targetGtile: gtile })
      gtile[0].position.y = getNewY({ config, stdGtile, targetGtile: gtile })
    })
    if (fromGroup != toGroup) {
      config.groupTiles.forEach(gtile => {
        if (gtile[1] == fromGroup) {
          gtile[1] = toGroup
        }
      })
    }

    const afterCheckItemConfig = removeItemStyleToPiece({
      config,
      fromIndex,
      toIndex,
    });
    config = afterCheckItemConfig;
  };

  const addCombo = (fromIndex, toIndex, direction, bundles = []) => {
    // console.log("addCombo 함수 실행 :", fromIndex, toIndex, direction, dir);
    // console.log(config);

    const nextConfig = uniteTiles({
      config,
      nowIndex: fromIndex,
      preIndex: toIndex,
      isSender: false,
      isCombo: true,
      direction: switchDirection(direction),
    });

    config = cleanBorderStyle({ config: nextConfig });

    // const updatedConfig = updateGroupByBundles({ config: nextConfig, bundles }); // 콤보랑 같이 쓰면 버그가..
    // config = cleanBorderStyle({ config: updatedConfig });
  };
  // 필요한 유틸리티 함수들이 정의되어 있다고 가정합니다.
  // uniteTiles2, updateGroupByBundles, switchDirection, cleanBorderStyle


  // 공격형 아이템 fire
  const usingItemFire = (bundles, targetList, isPlayerTeam, enemyCanvasScale) => {
    updateGroupByBundles({ config, bundles })
    bundles.forEach(bundle => {
      bundle.forEach(({ index, position_x, position_y }) => {
        if (targetList.includes(index)) {
          if (isPlayerTeam) {
            // config.tiles[index].position = new Point(position_x, position_y)
            animateRasterTo(config.tiles[index], new Point(position_x, position_y), 100)
          } else {
            // config.tiles[index].position = new Point(position_x * enemyCanvasScale, position_y * enemyCanvasScale)
            animateRasterTo(config.tiles[index], new Point(position_x * enemyCanvasScale, position_y * enemyCanvasScale), 100)
          }
        }
      })
    })
  };

  // 공격형 아이템 rocket
  const usingItemRocket = (targetList) => {
    config.groupTiles.forEach((gtile) => {
      // target이면 그룹 해제 (undefined)
      if (targetList.includes(gtile[2])) {
        gtile[1] = undefined;

        const randomX = Math.random() * 960 + 20;
        const randomY = Math.random() * 710 + 20;
        config.tiles[gtile[2]].position = new Point(randomX, randomY);
      }
    });
  };

  // 공격형 아이템 earthquake
  const usingItemTyphoon = (targetList, bundles, isPlayerTeam, enemyCanvasScale) => {
    const targetSet = new Set(targetList)

    bundles.forEach(bundle => {
      bundle.forEach(({ index, position_x, position_y }) => {
        if (targetSet.has(index)) {
          if (isPlayerTeam) {
            // config.tiles[index].position = new Point(position_x, position_y)
            animateRasterTo(config.tiles[index], new Point(position_x, position_y), 200)
          } else {
            // config.tiles[index].position = new Point(position_x * enemyCanvasScale, position_y * enemyCanvasScale)
            animateRasterTo(config.tiles[index], new Point(position_x * enemyCanvasScale, position_y * enemyCanvasScale), 200)
          }

        }
      })
    })
  };

  function animateRasterTo(raster, target, duration) {
    const start = raster.position.clone(); // Current position
    const startTime = Date.now(); // Start time

    raster.onFrame = (event) => {
      const elapsed = Date.now() - startTime; // Elapsed time
      const progress = Math.min(elapsed / duration, 1); // Progress as a value between 0 and 1

      // Interpolate the position
      raster.position = start.add(target.subtract(start).multiply(progress));

      // Stop animation when progress reaches 1
      if (progress >= 1) {
        raster.onFrame = null; // Remove the onFrame event
      }
    };
  }

  const usingItemFrame = (targetList, bundles = [], isPlayerTeam, enemyCanvasScale) => {
    // TODO: Toast를 통해 액자 아이템을 사용했다는 UI 보여주기
    // TODO: 액자를 사용할 곳이 없다면 UI 보여주기
    const targetSet = new Set(targetList)

    bundles.forEach(bundle => {
      bundle.forEach(({ index, position_x, position_y }) => {
        if (targetSet.has(index)) {
          if (isPlayerTeam) {
            // config.tiles[index].position = new Point(position_x, position_y)
            animateRasterTo(config.tiles[index], new Point(position_x, position_y), 200)
          } else {
            // config.tiles[index].position = new Point(position_x * enemyCanvasScale, position_y * enemyCanvasScale)
            animateRasterTo(config.tiles[index], new Point(position_x * enemyCanvasScale, position_y * enemyCanvasScale), 200)
          }
        }
      })
    })
    updateGroupByBundles({ config, bundles })
    // config = itemFrame({ config, targetList, bundles });
  };

  const usingItemMagnet = (targetList, bundles = []) => {
    config = itemMagnet({ config, targetList, bundles });
  };

  return {
    initializePuzzle,
    enemyIntializePuzzle,
    initializePuzzle2,
    getConfig,
    lockPuzzle,
    movePuzzles,
    unLockPuzzle,
    addPiece,
    addCombo,
    usingItemFire,
    usingItemRocket,
    usingItemTyphoon,
    usingItemFrame,
    usingItemMagnet,
    groupPuzzlePieces,
  };
};


export const playerConfig = createPuzzleConfig();
export const enemyConfig = createPuzzleConfig();

