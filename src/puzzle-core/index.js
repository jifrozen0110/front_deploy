import Paper from "paper";
import { Color, Point } from "paper/dist/paper-core";
import { initializeConfig } from "./initializeConfig";
import {
  itemFire,
  itemFrame,
  itemMagnet,
  removeItemStyleToPiece,
  searchItemList,
  setItemStyleToAllPiece,
} from "./item";
import { setMoveEvent } from "./setMoveEvent";
import { uniteTiles } from "./uniteTiles";
import { cleanBorderStyle, switchDirection, updateGroupByBundles } from "./utils";
import { colors } from "./color";
export const groupPuzzlePieces = ({ config, bundles }) => {
  updateGroupByBundles({ config, bundles });
  return config;
};

const createPuzzleConfig = () => {
  let config = {};

  const initializePuzzle = ({ canvasRef, puzzleImg, level, shapes, board = [], picture }) => {
    // 단계별 config 설정
    Paper.setup(canvasRef.current);
    const initializedConfig = initializeConfig({ img: puzzleImg, level, board, shapes, picture });
    const attachedMoveEventConfig = setMoveEvent({ config: initializedConfig });
    const attachedItemToAllPieceConfig = setItemStyleToAllPiece({
      config: attachedMoveEventConfig,
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
    config.tiles[index].strokeColor = colors[color.toUpperCase()]
    config.tiles[index].shadowColor = colors[color.toUpperCase()]
    config.tiles[index].bringToFront()

  };

  const movePuzzle = (x, y, index) => {
    config.tiles[index].position = new Point(x, y);
  };

  const unLockPuzzle = (index) => {
    config.tiles[index].locked = false
    config.tiles[index].strokeColor = config.tiles[index].originStroke ?? colors.DEFAULT_STROKE
    config.tiles[index].shadowColor = config.tiles[index].originShadow ?? colors.DEFAULT_SHADOW
  };

  const addPiece = ({ fromIndex, toIndex }, bundles = []) => {
    const afterUnitedConfig = uniteTiles({
      config,
      preIndex: fromIndex,
      nowIndex: toIndex,
    });
    const afterCheckItemConfig = removeItemStyleToPiece({
      config: afterUnitedConfig,
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
  const usingItemFire = (bundles, targetList) => {
    updateGroupByBundles({ config, bundles })

    bundles.forEach(bundle => {
      bundle.forEach(({ index, position_x, position_y }) => {
        if (targetList.includes(index)) {
          config.tiles[index].position = new Point(position_x, position_y)
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
  const usingItemTyphoon = (targetList, bundles) => {
    const targetSet = new Set(targetList)

    bundles.forEach(bundle => {
      bundle.forEach(({ index, position_x, position_y }) => {
        if (targetSet.has(index)) {
          config.tiles[index].position = new Point(position_x, position_y)
        }
      })
    })
  };

  const usingItemFrame = (targetList, bundles = []) => {
    // TODO: Toast를 통해 액자 아이템을 사용했다는 UI 보여주기
    // TODO: 액자를 사용할 곳이 없다면 UI 보여주기
    const targetSet = new Set(targetList)

    bundles.forEach(bundle => {
      bundle.forEach(({ index, position_x, position_y }) => {
        if (targetSet.has(index)) {
          config.tiles[index].position = new Point(position_x, position_y)
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
    initializePuzzle2,
    getConfig,
    lockPuzzle,
    movePuzzle,
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

export const configStore = createPuzzleConfig();
