import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { configStore } from "../puzzle-core";
import { Color } from "paper/dist/paper-core";
import { socket } from "@/socket-utils/socket2";
import pointerPath from "@/assets/icons/gameRoom/pointer.png";
import { getTeam } from "../socket-utils/storage";
import { colors } from "../puzzle-core/color";

const { initializePuzzle, groupPuzzlePieces, getConfig } = configStore;
const { connect, send, subscribe } = socket;

const myPointer = {x : 0, y : 0}
const prePointer = {x : 0, y : 0}

export default function PuzzleCanvas({ puzzleImg, level, shapes, board, picture, bundles, itemPieces, players }) {
  const canvasRef = useRef(null);
  const currentUrl = window.location.href
  const gameId = currentUrl.substring(currentUrl.lastIndexOf('/')+1)
  const userId = localStorage.getItem('userId')
  const myColor = localStorage.getItem('myColor')
  const team = getTeam()
  
  const mouseMove = (e) => {
    const {offsetX, offsetY} = e.nativeEvent
    myPointer.x = offsetX
    myPointer.y = offsetY
  }

  useEffect(() => {
    if (canvasRef.current) {
      initializePuzzle({ canvasRef, puzzleImg, level, shapes, board, picture });
      const config = getConfig()
      groupPuzzlePieces({ config, bundles })
      if (itemPieces) {
        Object.entries(itemPieces).forEach(([idx, bool]) => {
          if (!bool) {
            config.tiles[idx].strokeColor = colors.PURPLE
            config.tiles[idx].shadowColor = colors.PURPLE
            config.tiles[idx].originStroke = colors.PURPLE
            config.tiles[idx].originShadow = colors.PURPLE
          }
        });
      }

      subscribe(`/topic/game/${gameId}/mouse`, message => {
        const data = JSON.parse(message.body)
        if (data.team == team) {
          if (data.playerId == userId) {
            return
          }
          const pointer = document.getElementById(`user${data.playerId}`)
          if(pointer){
            pointer.style.left = `${data.x}px`
            pointer.style.top = `${data.y}px`
          }
        }
      })

      setInterval(() => {
        if (myPointer.x != prePointer.x || myPointer.y != prePointer.y) {
          send(`/pub/game/${gameId}/mouse`, {}, 
            JSON.stringify({
              playerId : userId,
              x : myPointer.x,
              y : myPointer.y,
              color : myColor,
              team : getTeam(),
            }))
            prePointer.x = myPointer.x
            prePointer.y = myPointer.y
        }
      }, 100);
    }
  }, [canvasRef]);

  return (
    <>
      <div
        id="canvasContainer"
        style={{ position: "relative", display: "flex", justifyContent: "center" }}
      >
        {players?.filter(p => p.playerId != userId)
        .map(p => <Pointer path={pointerPath} id={`user${p.playerId}`} color={p.color} key={`user${p.playerId}`}/>)}
        <Canvas ref={canvasRef} id="canvas" onMouseMove={mouseMove}/>
      </div>
    </>
  );
}

const Pointer = styled.div`
  width: 25px;
  height: 25px;
  position: absolute;
  background: ${(props) => props.color};
  mask: url(${(props)=> props.path}) no-repeat center / contain;
  transition: left 0.1s ease, top 0.1s ease;
  pointer-events: none;
`

const Canvas = styled.canvas`
  width: 1000px;
  height: 750px;
  // width: 2580px;
  // height: 1440px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;
