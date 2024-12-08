import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { enemyConfig } from "../../puzzle-core";

const { enemyIntializePuzzle, groupPuzzlePieces, getConfig } = enemyConfig;

export default function EnemyPuzzleCanvas({ puzzleImg, level, shapes, board, picture, bundles, itemPieces, enemyCanvasScale }) {
  const canvasRef = useRef(null);
  const canvasId = "enemyCanvas"

  const scaledBoard = board.map(row => 
    row.map(piece => ({
      ...piece, // 기존 데이터 유지
      position_x: piece.position_x * enemyCanvasScale, // x값에 scale 곱하기
      position_y: piece.position_y * enemyCanvasScale, // y값에 scale 곱하기
    }))
  );
  
  useEffect(() => {
    if (canvasRef.current) {  
      const canvas = canvasRef.current;
      canvas.width = 1000*enemyCanvasScale;
      canvas.height = 750*enemyCanvasScale;
      // 퍼즐 초기화
      enemyIntializePuzzle({  puzzleImg, level, shapes, board : scaledBoard, picture, canvasId, enemyCanvasScale });
      canvas.style.width = `${canvas.parentElement.clientWidth}px`;
      canvas.style.height = `${canvas.parentElement.clientWidth / 4 * 3}px`;

      // 퍼즐 조각 그룹화
      const config = getConfig();
      groupPuzzlePieces({ config, bundles });
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
  width: 100%;
  height: 100%;
  align-items: center;
`;

const EnemyCanvas = styled.canvas`
  border: 1px solid #ccc;
  border-radius: 5px;
`;
