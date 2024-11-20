import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import styled from "styled-components";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import GameCard from "@/components/GameRoomList/GameCard";

export default function GameRoomListBoard({ category, roomList }) {
  
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const makeEmptyRooms = (rooms) => {
    const result = [];
    const totalItems = 10; // 한 페이지에 10개 항목
    for (let i = 0; i < totalItems - rooms.length; i++) {
      result.push(
        <Grid item xs={6} key={`empty ${i}`}>
          <EmptyCard></EmptyCard>
        </Grid>,
      );
    }

    return result;
  };

  useEffect(() => {
    setRooms(roomList?.content ?? []); // roomList가 없으면 빈 배열 반환
    setPage(roomList.pageable?.pageNumber ?? 0);
    setTotalPage(roomList.totalPages); // 페이지당 10개 항목
  }, [roomList]);

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
    palette: {
      purple: {
        light: deepPurple[500],
        main: deepPurple[600],
        dark: deepPurple[700],
        darker: deepPurple[800],
        contrastText: "#fff",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <GridContainer>
          {rooms.map((room) => (
            <Grid item xs={6} key={room.roomId}>
              <GameCard room={room} category={category} />
            </Grid>
          ))}
          {makeEmptyRooms(rooms)}
        </GridContainer>
        <Pagination
          page={page}
          count={totalPage}
          size="large"
          variant="outlined"
          color="purple"
          renderItem={(item) => (
            <PaginationItem
              component={Link}
              to={`/game/${category}${
                item.page === 1 ? "" : `?page=${item.page - 1}`
              }`}
              {...item}
            />
          )}
        />
      </Wrapper>
    </ThemeProvider>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 20px;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2개의 열 */
  grid-auto-rows: 1fr; /* 행 높이를 유연하게 설정 */
  gap: 10px;
  width: 100%;
  height: 100%; /* 부모 컨테이너 높이를 채움 */
`;

const EmptyCard = styled(Card)`
  width: 100%;
  height: 100%; /* 부모 컨테이너의 높이를 채움 */
  border-radius: 8px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.2); /* 반투명 배경 */
  backdrop-filter: blur(40px); /* 블러 효과 */
`;

const GameCardStyled = styled(Card)`
  width: 100%;
  height: 100%; /* 부모 컨테이너의 높이를 채움 */
  background-color: #42a5f5;
  border-radius: 8px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
`;
