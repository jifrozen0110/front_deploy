import { Point } from "paper/dist/paper-core";
import comboEffectPath from "@/assets/effects/comboEffect.gif";
import { socket } from "../socket-utils/socket2";
import { getRoomId, getSender } from "../socket-utils/storage";
import { getPuzzleGroup } from "./getPuzzleGroup";
import { uniteTiles } from "./uniteTiles";

const { send } = socket;

export const findNearTileGroup = ({ config }) => {
  config.groupTiles.forEach((tile, tileIndex) => {
    tile[0].onMouseUp = (event) => {
      // 위치 보정 후
      const nearGtiles = []
      for (const gtile of config.groupTiles) {
        if (gtile[1] == tile[1]) {
          findNearTile2({ config, tile: gtile })
            .forEach(idx => {
              const group = config.groupTiles[idx][1]
              nearGtiles.push(...config.groupTiles.filter(gt => gt[1] == group))
            })
        }
      }

      if (nearGtiles.length) {
        const bundleNumSet = new Set(nearGtiles.map(gtile => gtile[1]))
        // let sandData = []
        const moveTiles = bundleNumSet.size == 1 ? config.groupTiles.filter(gtile => gtile[1] == tile[1]) : nearGtiles
        const stdGtile = bundleNumSet.size == 1 ? config.groupTiles.find(gtile => bundleNumSet.has(gtile[1])) : tile
        // sandData = moveTiles.map(gtile => {
        //   gtile[0].position = getNewPoint({ config, stdGtile, targetGtile: gtile })
        //   gtile[1] = stdGtile[1]
        //   return {
        //     x: gtile[0].position.x,
        //     y: gtile[0].position.y,
        //     index: gtile[2],
        //   }
        // })
        moveTiles.forEach(gtile => {
          gtile[0].position = getNewPoint({ config, stdGtile, targetGtile: gtile })
          gtile[1] = stdGtile[1]
        })
        // send(
        //   "/pub/game/puzzle", {},
        //   JSON.stringify({
        //     type: "GAME",
        //     roomId: getRoomId(),
        //     sender: getSender(),
        //     message: "MOUSE_DRAG",
        //     targets: JSON.stringify(sandData),
        //   }),
        // );

        // const addGroupNums = new Set(moveTiles.map(gtile => gtile[1]));
        // [...addGroupNums].forEach(groupNum => {
        //   send(
        //     "/pub/game/puzzle",
        //     {},
        //     JSON.stringify({
        //       type: "GAME",
        //       roomId: getRoomId(),
        //       sender: getSender(),
        //       message: "ADD_PIECE",
        //       targets: `${groupNum},${stdGtile[2]}`,
        //     }),
        //   );
        // })
        moveTiles.forEach(gtile => {
          send(
            "/pub/game/puzzle",
            {},
            JSON.stringify({
              type: "GAME",
              roomId: getRoomId(),
              sender: getSender(),
              message: "ADD_PIECE",
              targets: `${gtile[2]},${stdGtile[2]}`,
            }),
          );
        })

      }

      const puzzleGroup = getPuzzleGroup({ config, paperEvent: event });
      // socket 전송
      send(
        "/pub/game/puzzle",
        {},
        JSON.stringify({
          type: "GAME",
          roomId: getRoomId(),
          sender: getSender(),
          message: "MOUSE_UP",
          targets: JSON.stringify(puzzleGroup),
          position_x: tile[0].position.x,
          position_y: tile[0].position.y,
        }),
      );
    };
  });
};

export const getNewPoint = ({ config, stdGtile, targetGtile }) => {
  const { tilesPerRow, tileWidth } = config
  const stdY = parseInt(stdGtile[2] / tilesPerRow)
  const stdX = stdGtile[2] % tilesPerRow
  const targetY = parseInt(targetGtile[2] / tilesPerRow)
  const targetX = targetGtile[2] % tilesPerRow
  const { position } = stdGtile[0]

  return new Point(
    position.x + (targetX - stdX) * tileWidth,
    position.y + (targetY - stdY) * tileWidth,
  )
}

const findNearTile2 = ({ config, tile }) => {
  const xTileCount = config.tilesPerRow;
  const yTileCount = config.tilesPerColumn;

  const nowIndex = tile[2];

  // (0: 좌, 1: 우, 2: 상, 3: 하)
  const nextIndexArr = [
    nowIndex % xTileCount === 0 ? -1 : nowIndex - 1,
    (nowIndex + 1) % xTileCount === 0 ? -1 : nowIndex + 1,
    nowIndex - xTileCount < 0 ? -1 : nowIndex - xTileCount,
    nowIndex + xTileCount >= xTileCount * yTileCount ? -1 : nowIndex + xTileCount,
  ];
  return nextIndexArr.filter((nextIndex, index) => {
    return checkUndefined({ config, nowIndex, nextIndex, direction: index })
      && isNear[index]({
        nowTile: tile[0],
        preTile: config.tiles[nextIndex],
        range: config.tileWidth,
        errorRange: config.tileWidth * 0.2,
      })
  })
}

const isNear = [
  ({
    nowTile, preTile, range, errorRange,
  }) => Math.abs(nowTile.position._x - range - preTile.position._x) < errorRange
    && Math.abs(nowTile.position._y - preTile.position._y) < errorRange,
  ({
    nowTile, preTile, range, errorRange,
  }) => Math.abs(preTile.position._x - range - nowTile.position._x) < errorRange
    && Math.abs(nowTile.position._y - preTile.position._y) < errorRange,
  ({
    nowTile, preTile, range, errorRange,
  }) => Math.abs(preTile.position._y + range - nowTile.position._y) < errorRange
    && Math.abs(nowTile.position._x - preTile.position._x) < errorRange,
  ({
    nowTile, preTile, range, errorRange,
  }) => Math.abs(nowTile.position._y + range - preTile.position._y) < errorRange
    && Math.abs(nowTile.position._x - preTile.position._x) < errorRange,
]

const findNearTile = ({ config, tile }, flag = true) => {
  const xTileCount = config.tilesPerRow;
  const yTileCount = config.tilesPerColumn;

  const nowIndex = tile[2];

  const nextIndexArr = [
    nowIndex % xTileCount === 0 ? -1 : nowIndex - 1,
    (nowIndex + 1) % xTileCount === 0 ? -1 : nowIndex + 1,
    nowIndex - xTileCount < 0 ? -1 : nowIndex - xTileCount,
    nowIndex + xTileCount >= xTileCount * yTileCount ? -1 : nowIndex + xTileCount,
  ];

  const tileArr = []; // 맞춰야하는 피스 그룹 들어감 (좌우상하 순)
  const tileShape = []; // 맞춰야하는 피스의 탭 모양 들어감 (좌우상하 순)
  const nowShape = config.shapes[nowIndex];

  nextIndexArr.forEach((nextIndex, index) => {
    // 해당 방향에서 (0: 좌, 1: 우, 2: 상, 3: 하)
    // 피스가 이미 맞춰졌거나 테두리 방향이라면
    if (!checkUndefined({ config, nowIndex, nextIndex, direction: index })) {
      tileArr[index] = undefined;
    } else {
      // 아니라면, 즉 피스가 더 들어와야 한다면
      tileArr[index] = config.tiles[nextIndex];
      tileShape[index] = config.shapes[nextIndex];
    }
  });
  // console.log(tileArr, tileShape);
  tileArr.forEach((nowIndexTile, index) => {
    if (nowIndexTile !== undefined) {
      // console.log(tile);
      // nowIndex, preIndex, nowTile, preTile, nowShape, preShape, dir, flag, width
      fitTiles({
        config,
        nowIndex: tile[2],
        preIndex: nextIndexArr[index],
        nowTile: tile[0],
        preTile: nowIndexTile,
        nowShape,
        preShape: tileShape[index],
        dir: index,
        flag,
        width: tile[0].bounds.width,
      });
    }
  });
};

// 현재 피스에서 상하좌우 각 방향(direction)에서 비어있으면 true 아니면 false 반환
// 왼쪽에 피스가 맞춰져있고, 위쪽이 직선인 피스인 경우
// false true false true 가 반환됨 (위에서 forEach로 4방향 탐색)
const checkUndefined = ({ config, nowIndex, nextIndex, direction }) => {
  let flag = true;
  const xTileCount = config.tilesPerRow;
  const yTileCount = config.tilesPerColumn;
  const groupTiles = config.groupTiles;

  const nowTile = groupTiles[nowIndex];
  const nextTile = groupTiles[nextIndex];
  // console.log(groupTiles, nowIndex, nowTile, nextIndex, nextTile);
  if (nextTile !== undefined && nowTile !== undefined) {
    const nowGroup = nowTile[1];
    const nextGroup = nextTile[1];
    if (nowGroup !== undefined && nextGroup === nowGroup) {
      flag = false;
    }
  }

  if (nowIndex % xTileCount === 0 && direction === 0) {
    flag = false;
  } else if (nowIndex % xTileCount === xTileCount - 1 && direction === 1) {
    flag = false;
  } else if (nowIndex < xTileCount && direction === 2) {
    flag = false;
  } else if (nowIndex >= xTileCount * (yTileCount - 1) && direction === 3) {
    flag = false;
  }

  return flag;
};

const sendFitTilePosition = (tile, tileIdx) => {
  // // socket 전송
  send(
    "/pub/game/puzzle",
    {},
    JSON.stringify({
      type: "GAME",
      roomId: getRoomId(),
      sender: getSender(),
      message: "MOUSE_DRAG",
      targets: JSON.stringify([{ x: tile.position.x, y: tile.position.y, index: tileIdx }]),
      position_x: tile.position.x,
      position_y: tile.position.y,
    }),
  );
};

export const fitTiles = ({
  config,
  nowIndex,
  preIndex,
  nowTile,
  preTile,
  nowShape,
  preShape,
  dir,
  flag,
  width,
  isCombo = false,
}) => {
  // const xChange = findXChange(nowShape, preShape, width);

  if (flag === false) {
    // console.log("fitTiles: ", nowIndex, preIndex);
    // console.log("xChange, yChange, xUp, yUp: ", xChange, yChange, xUp, yUp);
  }
  const range = config.tileWidth;
  // 오차 범위
  const errorRange = range * 0.2;
  let uniteFlag = false;

  switch (dir) {
    // 좌
    case 0:
      if (
        (Math.abs(nowTile.position._x - range - preTile.position._x) < errorRange &&
          Math.abs(nowTile.position._y - preTile.position._y) < errorRange) ||
        flag === false
      ) {
        // console.log("좌", nowTile.position, range, xChange, yChange);
        nowTile.position = new Point(
          preTile.position._x + range,
          preTile.position._y,
        );
        uniteFlag = true;

        sendFitTilePosition(nowTile, nowIndex);
      }
      break;
    // 우
    case 1:
      if (
        (Math.abs(preTile.position._x - range - nowTile.position._x) < errorRange &&
          Math.abs(nowTile.position._y - preTile.position._y) < errorRange) ||
        flag === false
      ) {
        // console.log("우", nowTile.position, range, xChange, yChange);
        nowTile.position = new Point(
          preTile.position._x - (range),
          preTile.position._y,
        );
        uniteFlag = true;

        sendFitTilePosition(nowTile, nowIndex);
      }
      break;
    // 상
    case 2:
      if (
        (Math.abs(preTile.position._y + range - nowTile.position._y) < errorRange &&
          Math.abs(nowTile.position._x - preTile.position._x) < errorRange) ||
        flag === false
      ) {
        // console.log("상", nowTile.position, range, xUp, yUp);
        nowTile.position = new Point(preTile.position._x, preTile.position._y + range);
        uniteFlag = true;

        sendFitTilePosition(nowTile, nowIndex);
      }
      break;
    // 하
    case 3:
      if (
        (Math.abs(nowTile.position._y + range - preTile.position._y) < errorRange &&
          Math.abs(nowTile.position._x - preTile.position._x) < errorRange) ||
        flag === false
      ) {
        // console.log("하", nowTile.position, range, xUp, yUp);
        nowTile.position = new Point(
          preTile.position._x,
          preTile.position._y - (range),
        );
        uniteFlag = true;

        sendFitTilePosition(nowTile, nowIndex);
      }
      break;
  }

  if (isCombo) {
    const canvasContainer = document.getElementById("canvasContainer");
    if (canvasContainer) {
      const comboEffect = document.createElement("img");

      comboEffect.src = comboEffectPath;
      comboEffect.style.zIndex = 100;
      comboEffect.style.position = "absolute";
      comboEffect.style.left = `${nowTile.position._x}px`;
      comboEffect.style.top = `${nowTile.position._y}px`;
      comboEffect.style.transform = "translate(-50%, -50%)";

      canvasContainer && canvasContainer.appendChild(comboEffect);

      // console.log(comboEffect);
      setTimeout(() => {
        // console.log("effect 삭제");
        // console.log(comboEffect);
        // console.log(comboEffect.parentNode);
        // console.log(comboEffect.parentElement);
        comboEffect.parentNode.removeChild(comboEffect);
      }, 500);
    }
  }

  // console.log("flag && uniteFlag: ", flag && uniteFlag);
  if (flag && uniteFlag) {
    uniteTiles({ config, nowIndex, preIndex, isSender: true });
  }

  return config;
};
