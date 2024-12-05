import { Point } from "paper/dist/paper-core";
import { socket } from "../socket-utils/socket2";
import { getRoomId, getSender } from "../socket-utils/storage";
import { getPuzzleGroup } from "./getPuzzleGroup";
import { setPuzzleSize } from "./setPuzzleSize";
import { findNearTileGroup, getNewPoint } from "./findNearTileGroup";

import puzzleDownSound from "@/assets/audio/puzzle_up.wav";

const addAudio = (audioPath) => {
  const audio = new Audio(audioPath);
  audio.loop = false;
  audio.volume = 0.5;
  audio.crossOrigin = "anonymous";
  audio.load();
  try {
    audio.play();
  } catch (err) {
    console.log(err);
  }
};

const { send } = socket;

export const setMoveEvent = ({ config }) => {
  moveTile({ config });
  findNearTileGroup({ config });
  return config;
};

let lastExecutionTime = 0;
const interval = 50; // 실행 간격 (40ms)

const moveTile = ({ config }) => {
  config.groupTiles.forEach((gtile, index) => {
    if (gtile[1] === null) {
      gtile[1] = undefined;
    }
  });

  // 모든 타일을 돌면서 마우스 이벤트 등록
  config.groupTiles.forEach((gtile, gtileIdx) => {
    gtile[0].onMouseDown = (event) => {
      console.log("퍼즐을 잡았다");
      addAudio(puzzleDownSound);

      let isGroup = false;
      const group = gtile[1];
      if (group !== undefined) {
        // 그룹이면 해당 그룹의 타일들 모두 앞으로 이동
        config.groupTiles.forEach((tile) => {
          if (tile[1] === group) {
            if (tile[0] !== gtile[0]) {
              isGroup = true;
            }
            tile[0].bringToFront();
          }
        });
      } else {
        // 그룹이 아닐땐 클릭된 타일만 앞으로 이동
        event.target.bringToFront();
      }
      if (!isGroup) {
        setPuzzleSize(gtile[0], 84);
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
          message: "MOUSE_DOWN",
          targets: JSON.stringify(puzzleGroup),
          position_x: gtile[0].position.x,
          position_y: gtile[0].position.y,
        }),
      );
    };

    gtile[0].onMouseDrag = (event) => {
      // 캔버스 사이즈를 벗어나지 않는 범위내로 이동
      const newPosition = {
        x: Math.min(
          Math.max(gtile[0].position._x + event.delta.x, Math.floor(config.tileWidth / 2)),
          config.project.view._viewSize._width - Math.floor(config.tileWidth / 2),
        ),
        y: Math.min(
          Math.max(gtile[0].position._y + event.delta.y, Math.floor(config.tileWidth / 2)),
          config.project.view._viewSize._height - Math.floor(config.tileWidth / 2),
        ),
      };
      gtile[0].position = new Point(newPosition.x, newPosition.y)

      const currentTime = Date.now();
      if (currentTime - lastExecutionTime >= interval) {
        // 지정된 간격(interval)으로 함수 실행

        // socket 전송
        send(
          "/pub/game/puzzle",
          {},
          JSON.stringify({
            type: "GAME",
            roomId: getRoomId(),
            sender: getSender(),
            message: "MOUSE_DRAG",
            targets: JSON.stringify([{ ...newPosition, index: gtile[2] }]),
          }),
        );

        lastExecutionTime = currentTime;
      }

      config.groupTiles
        .forEach(targetGtile => {
          if (targetGtile[1] == gtile[1]) {
            targetGtile[0].position = getNewPoint({ config, stdGtile: gtile, targetGtile })
          }
        })
    };

    gtile[0].onMouseEnter = (event) => {
      //console.log("Enter", event);
    };

    gtile[0].onMouseLeave = (event) => {
      //console.log("Leave");
    };
  });
};
