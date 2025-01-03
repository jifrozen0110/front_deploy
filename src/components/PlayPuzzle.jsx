import { useCallback, useEffect, useRef, useState } from "react";
import PuzzleCanvas from "./PuzzleCanvas";

const PlayPuzzle = ({ category, shapes, board, picture, bundles, itemPieces, players }) => {
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
        : // : `data:image/jpeg;base64,${picture.encodedString}`;
          picture.encodedString;
    const res = {
      img,
      level: 1,
    };
    setPuzzleInfo({ crossOrigin: "anonymous", img: res.img, level: res.level });

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div style={{
      alignItems: "center",
      display: "flex",
      textAlign: "center",
      width: "100%",
      height: "100%",
    }}>
      <div style={{margin:"0 auto", width:"100%", display:"flex", maxHeight: "calc(100% - 160px)"}}>
        <img
          ref={imgRef}
          id="puzzleImage"
          src={puzzleInfo.img}
          alt="puzzleImage"
          onLoad={onLoad}
          style={{ display: "none" }}
        />
        <img id="empty" src={puzzleInfo.img} alt="emptyImage" style={{ display: "none" }} />
        {loaded && (
          <PuzzleCanvas
            category={category}
            puzzleImg={imgRef}
            level={puzzleInfo.level}
            shapes={shapes}
            board={board}
            picture={picture}
            bundles={bundles}
            itemPieces={itemPieces}
            players={players}
          />
        )}
      </div>
    </div>
  );
};

export default PlayPuzzle;
