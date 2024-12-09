import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { playerConfig } from "../puzzle-core";
import { Color,  MouseEvent,  Point } from "paper/dist/paper-core";
import { socket } from "@/socket-utils/socket2";
import pointerPath from "@/assets/icons/gameRoom/pointer2.png";
import { getTeam } from "../socket-utils/storage";
import { colors } from "../puzzle-core/color";

const { initializePuzzle, groupPuzzlePieces, getConfig } = playerConfig;
const { connect, send, subscribe } = socket;

const myPointer = {x : 0, y : 0}
const prePointer = {x : 0, y : 0}
let dragTarget = null

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
      canvas.width = 1002;
      canvas.height = 752;
      initializePuzzle({ puzzleImg, level, shapes, board, picture });
      canvas.style.width = `${canvas.parentElement.clientWidth}px`;
      canvas.style.height = `${canvas.parentElement.clientWidth / 4 * 3}px`;
      const config = getConfig()
      groupPuzzlePieces({ config, bundles })
      canvas.style.aspectRatio = '1000 / 750'
      config.project.view._bounds.width = canvas.parentElement.clientWidth
      config.project.view._bounds.height = canvas.parentElement.clientWidth / 4 * 3
      
      config.project.view.onMouseDown = (event) => {
        event.preventDefault()
        event.stopPropagation()
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = 1000 / rect.width;
        
        const correctedX = (event.event.clientX - rect.left) * scaleX;
        const correctedY = (event.event.clientY - rect.top) * scaleX;
        
        const hitResult = config.project.project.hitTest(new Point(correctedX, correctedY));
        if (hitResult?.item?._parent?._parent?.onMouseDown) {
          const customEvent = new MouseEvent(event.type, {
            clientX: correctedX,
            clientY: correctedY,
            bubbles: true,
            cancelable: true,
          });
          customEvent.point = {x: correctedX, y: correctedY};
          customEvent.delta = event.delta;
          customEvent.target = hitResult.item._parent._parent;
          customEvent.currentTarget = hitResult.item._parent._parent;
          dragTarget = hitResult.item._parent._parent
          
          hitResult.item._parent._parent.onMouseDown(customEvent);
        }
      };
      
      config.project.view.onMouseUp = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const rect = canvas.getBoundingClientRect();
        const scaleX = 1000 / rect.width;
        
        const correctedX = (event.event.clientX - rect.left) * scaleX;
        const correctedY = (event.event.clientY - rect.top) * scaleX;
        const tempTarget = dragTarget
        dragTarget = null
        
        if (tempTarget) {
          const customEvent = new MouseEvent(event.type, {
            clientX: correctedX,
            clientY: correctedY,
            bubbles: true,
            cancelable: true,
          });
          customEvent.point = {x: correctedX, y: correctedY};
          customEvent.delta = {x: 0, y: 0};
          customEvent.target = tempTarget;
          customEvent.currentTarget = tempTarget;
          
          tempTarget.onMouseUp(customEvent);
        }
      };
      
      config.project.view.onMouseDrag = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const rect = canvas.getBoundingClientRect();
        const scaleX = 1000 / rect.width;
    
        const correctedX = (event.event.clientX - rect.left) * scaleX;
        const correctedY = (event.event.clientY - rect.top) * scaleX;
    
        if (dragTarget) {
          event.point.x = correctedX
          event.point.y = correctedY
          event.isCustom = true
          event.prevented = false
          event.delta = event.delta;
          event.target = dragTarget;
          event.currentTarget = dragTarget;
          dragTarget.onMouseDrag(event);
        }
      };
      

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

      const scale = 1000 / canvas.parentElement.clientWidth
      subscribe(`/topic/game/${gameId}/mouse`, message => {
        const data = JSON.parse(message.body)
        data.forEach(p => {
          if (p.team == team && p.playerId != userId) {
            const pointer = document.getElementById(`user${p.playerId}`)
            if(pointer){
              pointer.style.left = `${p.x / scale}px`
              pointer.style.top = `${p.y / scale}px`
            }
          }
        })
      })

      setInterval(() => {
        if (myPointer.x != prePointer.x || myPointer.y != prePointer.y) {
          send(`/pub/game/${gameId}/mouse`, {}, 
            JSON.stringify({
              playerId : userId,
              playerName : userName,
              x : myPointer.x * scale,
              y : myPointer.y * scale,
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
        style={{ position: "relative", display: "flex", justifyContent: "center", width: '76%', height:'auto', alignItems:"center", margin: '0 auto' }}
      >
        {players?.filter(p => p.playerId != userId)
        .map(p => 
            <Pointer path={pointerPath} id={`user${p.playerId}`} color={p.color} key={`user${p.playerId}`} name={p.playerName}></Pointer>
        )}
        <Canvas ref={canvasRef} id="canvas" onMouseMove={mouseMove} />
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
        textWrapMode: "nowrap",
      }}>{name}</div>
    </div>
  )
}

const Canvas = styled.canvas`
  border: 1px solid #ccc;
  border-radius: 10px;
`;
