import { useEffect, useState } from "react";
import { styled } from "styled-components";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import GameCard from "@/components/GameRoomList/GameCard";
import LeftTriangle from "@/assets/icons/gameRoom/left_triangle.png";
import RightTriangle from "@/assets/icons/gameRoom/right_triangle.png";
import { authRequest } from "../../apis/requestBuilder";

export default function GameRoomListBoard({ category, roomList }) {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false); // 중복 요청 방지

  // 초기 roomList 설정
  useEffect(() => {
    setRooms(roomList?.content ?? []);
    setPage(roomList?.pageable?.pageNumber ?? 0);
    setTotalPage(roomList?.totalPages ?? 0);
  }, [roomList]);

  // 페이지 변경 시 데이터 요청
  useEffect(() => {
    fetchRoomsByPage(page);
  }, [page]);

  // 데이터 요청 함수
  const fetchRoomsByPage = async (currentPage) => {
    if (isFetching) return; // 중복 요청 방지

    setIsFetching(true);
    try {
      const res = await authRequest().get(`/api/rooms?page=${currentPage}`);
      const { data } = res;
      setRooms(data.content ?? []);
      setTotalPage(data.totalPages ?? 0);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // 이전 페이지 이동
  const handlePreviousPage = () => {
    if (page > 0 && !isFetching) {
      setPage(page - 1);
    }
  };

  // 다음 페이지 이동
  const handleNextPage = () => {
    if (page < totalPage - 1 && !isFetching) {
      setPage(page + 1);
    }
  };

  return (
    <Wrapper>
      <GridContainer>
        {rooms.map((room) => (
          <GameCard room={room} category={category} />
        ))}
      </GridContainer>
    </Wrapper>
  );
}

// 스타일 컴포넌트
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
`;

const GridContainer = styled.div`
  width: 100%;
  height: 100%;
  
  overflow-y: auto;
  padding-right: 10px;

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

const EmptyCard = styled(Card)`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.2); /* 반투명 배경 */
  backdrop-filter: blur(40px); /* 블러 효과 */
`;

const PagingContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 50px;
  gap: 10px;
`;

const PageButton = styled(Button)`
  background-color: orange;
  border-radius: 8px;
  padding: 10px 20px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  height: 35px;

  &:hover {
    background-color: darkorange;
  }

  &:disabled {
    background-color: rgba(255, 255, 255, 0.5); /* 반투명 배경 */
    cursor: not-allowed;
  }
`;
