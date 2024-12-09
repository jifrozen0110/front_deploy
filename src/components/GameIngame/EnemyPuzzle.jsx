import { useCallback, useEffect, useRef, useState } from "react";
import EnemyPuzzleCanvas from "./EnemyPuzzleCanvas";

const EnemyPuzzle = ({ category, shapes, board, picture, bundles, itemPieces,enemyCanvasScale }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const [puzzleInfo, setPuzzleInfo] = useState({
    crossOrigin: "anonymous",
    img: "",
    level: 1,
  });

  const onLoad = () => setLoaded(true);

  const initialize = useCallback(() => {
    const img =
      picture.encodedString === "짱구.jpg"
        ? "https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp"
        : picture.encodedString;

    setPuzzleInfo({ crossOrigin: "anonymous", img, level: 1 });
  }, [picture]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div style={{
      alignItems: "center",
      display: "flex",
      textAlign: "center",
      width: "100%",
      height:"100%",
    }}>
      <div style={{width:'100%',height:'100%'}}>
        <img
          ref={imgRef}
          id="enemyPuzzleImage"
          src={puzzleInfo.img}
          alt="enemyPuzzleImage"
          onLoad={onLoad}
          style={{ display: "none" }}
        />
        {loaded && (
          <EnemyPuzzleCanvas
            category={category}
            puzzleImg={imgRef}
            level={puzzleInfo.level}
            shapes={shapes}
            board={board}
            picture={picture}
            bundles={bundles}
            itemPieces={itemPieces}
            enemyCanvasScale = {enemyCanvasScale}
          />
        )}
      </div>
    </div>
  );
};

export default EnemyPuzzle;
