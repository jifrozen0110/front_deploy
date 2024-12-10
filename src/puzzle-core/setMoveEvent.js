import { socket } from "../socket-utils/socket2";
import { getRoomId, getSender } from "../socket-utils/storage";
import { setPuzzleSize } from "./setPuzzleSize";
import { findNearTileGroup, getNewPoint, getNewX, getNewY } from "./findNearTileGroup";

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

      if (!event.event?.isTrusted) {
        addAudio(puzzleDownSound);

        const group = gtile[1];
        const targets = config.groupTiles.map(tile => {
          if (tile[1] === group) {
            tile[0].bringToFront();
            return { x: tile[0].position.x, y: tile[0].position.y, index: tile[2] }
          } else {
            return null
          }
        }).filter(Boolean)
        if (targets.length === 1) {
          setPuzzleSize(gtile[0], 84);
        }

        // socket 전송
        send(
          "/pub/game/puzzle",
          {},
          JSON.stringify({
            type: "GAME",
            roomId: getRoomId(),
            sender: getSender(),
            message: "MOUSE_DOWN",
            targets: JSON.stringify(targets),
            position_x: gtile[0].position.x,
            position_y: gtile[0].position.y,
          }),
        );
      }
    };

    gtile[0].onMouseDrag = (event) => {
      if (event.isCustom) {
        const currentTime = Date.now();
        // 캔버스 사이즈를 벗어나지 않는 범위내로 이동
        // 지정된 간격(interval)으로 함수 실행
        if (currentTime - lastExecutionTime >= interval) {
          gtile[0].position.x = Math.min(Math.max(event.point.x, 20), config.project.view._viewSize._width - Math.floor(config.tileWidth / 2))
          gtile[0].position.y = Math.min(Math.max(event.point.y, 20), config.project.view._viewSize._height - Math.floor(config.tileWidth / 2))

          config.groupTiles
            .forEach(targetGtile => {
              if (targetGtile[1] == gtile[1]) {
                targetGtile[0].position.x = getNewX({ config, stdGtile: gtile, targetGtile })
                targetGtile[0].position.y = getNewY({ config, stdGtile: gtile, targetGtile })
              }
            })

          // socket 전송
          send(
            "/pub/game/puzzle",
            {},
            JSON.stringify({
              type: "GAME",
              roomId: getRoomId(),
              sender: getSender(),
              message: "MOUSE_DRAG",
              targets: JSON.stringify([{ x: gtile[0].position.x, y: gtile[0].position.y, index: gtile[2] }]),
            }),
          );

          lastExecutionTime = currentTime;
        }
      }
    };

    gtile[0].onMouseEnter = (event) => {
      //console.log("Enter", event);
    };

    gtile[0].onMouseLeave = (event) => {
      //console.log("Leave");
    };
  });
};

function getMouseX(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  return (event.clientX - rect.left) * scaleX
}
function getMouseY(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  return (event.clientY - rect.top) * scaleY
}