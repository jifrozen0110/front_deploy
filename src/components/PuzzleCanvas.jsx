import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { configStore } from "../puzzle-core";

const { initializePuzzle, groupPuzzlePieces, getConfig } = configStore;

export default function PuzzleCanvas({ puzzleImg, level, shapes, board, picture, bundles }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      initializePuzzle({ canvasRef, puzzleImg, level, shapes, board, picture });
      groupPuzzlePieces({ config: getConfig(), bundles })
    }
  }, [canvasRef]);

  return (
    <>
      <div
        id="canvasContainer"
        style={{ position: "relative", display: "flex", justifyContent: "center" }}
      >
        <Canvas ref={canvasRef} id="canvas" />
      </div>
    </>
  );
}

const Canvas = styled.canvas`
  width: 1000px;
  height: 750px;
  // width: 2580px;
  // height: 1440px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;
