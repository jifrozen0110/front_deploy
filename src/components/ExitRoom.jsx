import { useEffect } from "react";

const useExitRoom = (exitRoom, isGameStatusRef) => {
  const exitDummy = "나가기";

  // 컴포넌트 언마운트 시 실행
  useEffect(() => {
    return () => {
      exitRoom();
    };
  }, [exitDummy]);

  // 창 닫기, 새로고침, 또는 URL 변경 감지
  useEffect(() => {
    const handleBeforeUnload = () => {
      const navigationType = performance.getEntriesByType("navigation")[0]?.type;

      if (navigationType === "reload") {
        // 새로고침 감지: exitRoom 실행 안 함
        return;
      }

      if (!isGameStatusRef.current) {
        // console.log("페이지를 떠납니다. exitRoom 실행");
        exitRoom();
      } else {
        // console.log("exitRoom을 실행하지 않습니다.");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [exitRoom, isGameStatusRef]);
};

export default useExitRoom;
