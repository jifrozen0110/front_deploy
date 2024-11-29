import { styled } from "styled-components";
import GameCard from "@/components/GameRoomList/GameCard";

export default function GameRoomListBoard({ category, roomList }) {
  return (
    <Wrapper>
      <GridContainer>
        {roomList.map((room) => (
          <GameCard key={room.roomId} room={room} category={category} />
        ))}
      </GridContainer>
    </Wrapper>
  );
}

// 스타일 컴포넌트
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  overflow: hidden; /* 부모 범위를 초과하지 않도록 설정 */
`;


const GridContainer = styled.div`
  width: 100%;
  height: 100%;
  
  overflow-y: auto;
  padding-right: 10px;
  box-sizing: border-box;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 10px; /* 스크롤바 너비 */
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3); /* 스크롤바 색상 */
    border-radius: 10px; /* 스크롤바 둥글게 */
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.5); /* 스크롤바 hover 효과 */
  }

  &::-webkit-scrollbar-track {
    background: transparent; /* 스크롤 트랙 배경 투명화 */
  }
`;
