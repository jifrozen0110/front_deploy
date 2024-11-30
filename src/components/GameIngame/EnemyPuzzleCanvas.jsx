import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { enemyConfig } from "../../puzzle-core";

const { initializePuzzle, groupPuzzlePieces, getConfig } = enemyConfig;

export default function EnemyPuzzleCanvas({ puzzleImg, level, shapes, board, picture, bundles, itemPieces, enemyCanvasScale }) {
  console.log("img:",puzzleImg);
  console.log("level:",level);
  console.log("shapes:",shapes);
  console.log("board:",board);
  console.log("picture:",picture);
  const canvasRef = useRef(null);
  const canvasId = "enemyCanvas"

  const scaledBoard = board.map(row => 
    row.map(piece => ({
      ...piece, // 기존 데이터 유지
      position_x: piece.position_x * enemyCanvasScale, // x값에 scale 곱하기
      position_y: piece.position_y * enemyCanvasScale, // y값에 scale 곱하기
    }))
  );
  console.log("scaledBoard:",scaledBoard)
  
  useEffect(() => {
    if (canvasRef.current) {  
      const canvas = canvasRef.current;
      canvas.width = 1000*enemyCanvasScale;
      canvas.height = 750*enemyCanvasScale;
      // 퍼즐 초기화
      initializePuzzle({  puzzleImg, level, shapes, board : scaledBoard, picture, canvasId, enemyCanvasScale });

      // 퍼즐 조각 그룹화
      const config = getConfig();
      groupPuzzlePieces({ config, bundles });
      // 특수 조각 렌더링
      if (itemPieces) {
        Object.entries(itemPieces).forEach(([idx, bool]) => {
          if (!bool) {
            config.tiles[idx].strokeColor = "rgba(128, 0, 128, 0.8)"; // 보라색 테두리
            config.tiles[idx].shadowColor = "rgba(128, 0, 128, 0.4)";
            config.tiles[idx].originStroke = "rgba(128, 0, 128, 0.4)";
            config.tiles[idx].originShadow = "rgba(128, 0, 128, 0.4)";
          }
        });
      }
    }
  }, [canvasRef,enemyCanvasScale]);

  return (
    <CanvasWrapper id="enemyCanvasContainer" >
      <EnemyCanvas ref={canvasRef} id={canvasId} />
    </CanvasWrapper>
  );
}

const CanvasWrapper = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const EnemyCanvas = styled.canvas`
  border: 1px solid #ccc;
  border-radius: 10px;
`;
