import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { enemyConfig } from "../../puzzle-core";

const { initializePuzzle, groupPuzzlePieces, getConfig } = enemyConfig;

export default function EnemyPuzzleCanvas({ puzzleImg, level, shapes, board, picture, bundles, itemPieces }) {
  // console.log("img:",puzzleImg);
  // console.log("level:",level);
  // console.log("shapes:",shapes);
  // console.log("board:",board);
  // console.log("picture:",picture);
  const canvasRef = useRef(null);
  const scale = 0.5;

  useEffect(() => {
    if (canvasRef.current) {
      
    const canvas = canvasRef.current;
      // 퍼즐 초기화
      initializePuzzle({ canvasRef, puzzleImg, level, shapes, board, picture });

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
  }, [canvasRef,scale]);

  return (
    <CanvasWrapper id="enemyCanvasContainer" scale={scale}>
      <EnemyCanvas ref={canvasRef} id="enemyCanvas" scale={scale} />
    </CanvasWrapper>
  );
}

const CanvasWrapper = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const EnemyCanvas = styled.canvas`
  width: ${props => props.scale * 1000}px;
  height: ${props => props.scale * 750}px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;
