import Paper from "paper";
import { Point } from "paper/dist/paper-core";
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
export const groupPuzzlePieces = ({ config, bundles }) => {
  updateGroupByBundles({ config, bundles });
  return config;
};

const createPuzzleConfig = () => {
  let config = {};

  const initializePuzzle = ({ puzzleImg, level, shapes, board = [], picture, canvasId="canvas", enemyCanvasScale=1}) => {
    const initializedConfig = initializeConfig({ img: puzzleImg, level, board, shapes, picture, canvasId, enemyCanvasScale});
    const attachedMoveEventConfig = setMoveEvent({ config: initializedConfig });
    const attachedItemToAllPieceConfig = setItemStyleToAllPiece({
      config: attachedMoveEventConfig,
      itemList: searchItemList(board),
    });
    config = attachedItemToAllPieceConfig;
  };

  const enemyIntializePuzzle = ({ puzzleImg, level, shapes, board = [], picture, canvasId="canvas", enemyCanvasScale=1}) => {
    const initializedConfig = initializeConfig({ img: puzzleImg, level, board, shapes, picture, canvasId, enemyCanvasScale});
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

  const lockPuzzle = (x, y, index) => {
    console.log(x, y, index);
    // TODO: "Lock"이 걸려있다는 처리해야함
    // 피그마처럼 유저별로 "색깔"을 지정해두고 border 색깔을 변경하는 것도 좋을듯?
  };

  const movePuzzle = (x, y, index) => {
    config.tiles[index].position = new Point(x, y);
  };

  const unLockPuzzle = (x, y, index) => {
    console.log(x, y, index);
    // TODO: 여기서 Lock에 대한 UI처리를 해제한다.
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
  const usingItemFire = (bundles, targetList, isPlayerTeam, enemyCanvasScale) => {
    updateGroupByBundles({ config, bundles })
    bundles.forEach(bundle => {
      bundle.forEach(({ index, position_x, position_y }) => {
        if (targetList.includes(index)) {
          if(isPlayerTeam){
            config.tiles[index].position = new Point(position_x, position_y)
          }else{
            config.tiles[index].position = new Point(position_x*enemyCanvasScale, position_y*enemyCanvasScale)
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
          if(isPlayerTeam){
            config.tiles[index].position = new Point(position_x, position_y)
          }else{
            config.tiles[index].position = new Point(position_x*enemyCanvasScale, position_y*enemyCanvasScale)
          }
          
        }
      })
    })
  };

  const usingItemFrame = (targetList, bundles = [], isPlayerTeam, enemyCanvasScale) => {
    // TODO: Toast를 통해 액자 아이템을 사용했다는 UI 보여주기
    // TODO: 액자를 사용할 곳이 없다면 UI 보여주기
    const targetSet = new Set(targetList)

    bundles.forEach(bundle => {
      bundle.forEach(({ index, position_x, position_y }) => {
        if (targetSet.has(index)) {
          if(isPlayerTeam){
            config.tiles[index].position = new Point(position_x, position_y)
          }else{
            config.tiles[index].position = new Point(position_x*enemyCanvasScale, position_y*enemyCanvasScale)
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


export const playerConfig = createPuzzleConfig(); 
export const enemyConfig  = createPuzzleConfig();

