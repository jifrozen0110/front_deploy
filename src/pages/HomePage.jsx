import { useState } from "react";
import Header from "../components/Header";
import BattleGameListPage from "./BattleGame/BattleGameListPage";
import Gallery from "./Gallery";
import ProfilePage from "./ProfilePage";
import styled from "styled-components";
import backgroundPath from "@/assets/backgrounds/background.png";

export default function HomePage() {
  const [page, setPage] = useState(0)
  const pageArr = [<BattleGameListPage></BattleGameListPage>,
    <ProfilePage goGallery={() => setPage(2)}></ProfilePage>,
    <Gallery goProfile={() => setPage(1)}></Gallery>]
  return (
    <>
      <Wrapper>
        <Header goProfile={() => setPage(1)} goHome={() => setPage(0)}/>
        {pageArr[page]}
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background-image: url(${backgroundPath});
  background-size: cover;
  background-attachment: fixed;
  user-select: none; /* 텍스트 선택 금지 */

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0; /* 배경 위에 위치 */
    background-color: rgba(0,0,0,0.2);
  }

  > * {
    position: relative; /* 자식 요소를 블러 바깥으로 제외 */
    z-index: 1;
  }
`;