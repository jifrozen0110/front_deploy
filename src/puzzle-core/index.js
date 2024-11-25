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
  const attachPieces = ({ fromIndex, toIndex, direction }) => {
    // 두 퍼즐 조각을 방향에 따라 결합합니다.
    const unitedConfig = uniteTiles2({
      config,
      preIndex: fromIndex,
      nowIndex: toIndex,
      direction: switchDirection(direction),
    });
    // 번들 정보를 업데이트합니다.
    const updatedConfig = updateGroupByBundles({ config: unitedConfig, bundles });
    // 퍼즐 테두리 스타일을 정리합니다.
    config = cleanBorderStyle({ config: updatedConfig });
  };

  const visited = new Set(); // 이미 처리한 퍼즐 인덱스를 저장합니다.
  const isSameBundle = (bundleSet, puzzleIndex) => bundleSet.has(puzzleIndex);

  // 번들 내의 퍼즐 조각들을 BFS로 순회하며 연결합니다.
  const processBundle = (bundle) => {
    const bundleSet = new Set(bundle.map((puzzle) => puzzle.index));
    const queue = [];

    for (const puzzle of bundle) {
      if (!visited.has(puzzle.index)) {
        visited.add(puzzle.index);
        queue.push(puzzle);
      }

      while (queue.length > 0) {
        const currentPuzzle = queue.shift();
        const {
          index: currentIndex,
          correctTopIndex,
          correctRightIndex,
          correctBottomIndex,
          correctLeftIndex,
        } = currentPuzzle;

        // 주변 퍼즐 인덱스를 가져옵니다 (상, 우, 하, 좌 순서)
        const neighborIndices = [
          correctTopIndex,
          correctRightIndex,
          correctBottomIndex,
          correctLeftIndex,
        ];

        for (let direction = 0; direction < 4; direction += 1) {
          const neighborIndex = neighborIndices[direction];

          // 유효하지 않거나, 같은 번들에 속하지 않거나, 이미 방문한 퍼즐이면 건너뜁니다.
          if (
            neighborIndex === -1 ||
            !isSameBundle(bundleSet, neighborIndex) ||
            visited.has(neighborIndex)
          ) {
            continue;
          }

          visited.add(neighborIndex);
          const neighborPuzzle = bundle.find((p) => p.index === neighborIndex);
          queue.push(neighborPuzzle);

          // 현재 퍼즐과 이웃 퍼즐을 연결합니다.
          attachPieces({
            fromIndex: neighborIndex,
            toIndex: currentIndex,
            direction,
          });
        }
      }
    }
  };

  // 각 번들을 순회하며 퍼즐 조각들을 그룹화합니다.
  for (const bundle of bundles) {
    processBundle(bundle);
  }

  // 그룹화된 퍼즐 상태를 가진 config를 반환합니다.
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
  const usingItemEarthquake = (targetList, deleted) => {
    console.log(targetList, deleted);

    config.groupTiles.forEach((gtile) => {
      if (targetList.includes(gtile[2])) {
        const position = deleted[gtile[2]];
        config.tiles[gtile[2]].position = new Point(position[0], position[1]);
      }
    });
  };

  const usingItemFrame = (targetList, bundles = []) => {
    // TODO: Toast를 통해 액자 아이템을 사용했다는 UI 보여주기
    // TODO: 액자를 사용할 곳이 없다면 UI 보여주기
    config = itemFrame({ config, targetList, bundles });
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
    usingItemEarthquake,
    usingItemFrame,
    usingItemMagnet,
  };
};

export const configStore = createPuzzleConfig();
