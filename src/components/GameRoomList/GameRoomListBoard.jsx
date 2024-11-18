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
        <Grid container spacing={2}>
          {rooms.map((room) => {
            return (
              <Grid item xs={6} key={room.roomId}>
                <GameCard room={room} category={category} />
              </Grid>
            );
          })}
          {makeEmptyRooms(rooms)}
        </Grid>
        <Pagination
          page={page}
          count={totalPage}
          size="large"
          variant="outlined"
          color="purple"
          renderItem={(item) => (
            <PaginationItem
              component={Link}
              to={`/game/${category}${item.page === 1 ? "" : `?page=${item.page-1}`}`}
              // to={`/api/rooms${page === 0 ? "" : `?page=${page}`}`}
              {...item}
            />
          )}
        />
      </Wrapper>
    </ThemeProvider>
  );
}

const Wrapper = styled.div`
  width: 950px;
  margin: 1% auto 5% auto;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 3%;
  padding-bottom: 2%;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const EmptyCard = styled(Card)`
  width: 460px;
  height: 150px;
  background-color: rgba(238, 238, 238, 0.2);
`;