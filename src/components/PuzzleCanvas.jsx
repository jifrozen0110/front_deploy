import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { playerConfig } from "../puzzle-core";
import { Color } from "paper/dist/paper-core";
import { socket } from "@/socket-utils/socket2";
import pointerPath from "@/assets/icons/gameRoom/pointer2.png";
import { getTeam } from "../socket-utils/storage";
import { colors } from "../puzzle-core/color";

const { initializePuzzle, groupPuzzlePieces, getConfig } = playerConfig;
const { connect, send, subscribe } = socket;

const myPointer = {x : 0, y : 0}
const prePointer = {x : 0, y : 0}

export default function PuzzleCanvas({ puzzleImg, level, shapes, board, picture, bundles, itemPieces, players }) {
  const canvasRef = useRef(null);
  const currentUrl = window.location.href
  const gameId = currentUrl.substring(currentUrl.lastIndexOf('/')+1)
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName')
  const myColor = localStorage.getItem('myColor')
  const team = getTeam()
  
  const mouseMove = (e) => {
    const {offsetX, offsetY} = e.nativeEvent
    myPointer.x = offsetX
    myPointer.y = offsetY
  }

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 1000;
      canvas.height = 750;
      initializePuzzle({ puzzleImg, level, shapes, board, picture });
      const config = getConfig()
      groupPuzzlePieces({ config, bundles })
      if (itemPieces) {
        Object.entries(itemPieces).forEach(([idx, bool]) => {
          if (!bool) {
            config.tiles[idx].children[0].strokeColor = colors.YELLOW
            config.tiles[idx].children[0].shadowColor = colors.YELLOW
            config.tiles[idx].children[0].strokeWidth = 5
            config.tiles[idx].children[0].shadowBlur = 5
            config.tiles[idx].children[0].opacity = 0.5
            config.tiles[idx].children[0].originStroke = colors.YELLOW
            config.tiles[idx].children[0].originShadow = colors.YELLOW
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
              playerName : userName,
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
        .map(p => 
            <Pointer path={pointerPath} id={`user${p.playerId}`} color={p.color} key={`user${p.playerId}`} name={p.playerName}></Pointer>
        )}
        <Canvas ref={canvasRef} id="canvas" onMouseMove={mouseMove}/>
      </div>
    </>
  );
}

const Pointer = ({color, path, name, id,}) => {
  return (
    <div id={id}
    style={{
      position:"absolute",
      pointerEvents:"none",
      transition: "left 0.1s ease, top 0.1s ease",
    }}>
      <div style={{
        width:25,
        height:25,
        background: color,
        mask: `url(${path}) no-repeat center / contain`,
      }}></div>
      <div style={{
        color:"white",
        background: color,
        fontWeight:600,
      }}>{name}</div>
    </div>
  )
}
// const Pointer = styled.div`
//   width: 25px;
//   height: 25px;
//   position: absolute;
//   background: ${(props) => props.color};
//   mask: url(${(props)=> props.path}) no-repeat center / contain;
//   transition: left 0.1s ease, top 0.1s ease;
//   pointer-events: none;
// `

const Canvas = styled.canvas`
  border: 1px solid #ccc;
  border-radius: 10px;
`;
