import Header from "../components/Header";
import { useEffect, useState } from "react";
import { authRequest } from "../apis/requestBuilder";
import { BackGround } from "../components/styled/styled";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import GalleryWall from "@/components/MyPage/GalleryWall";
import { Camera, ChevronLeft, ChevronRight, Swords, Star,  } from "lucide-react";
import { Button } from "@mui/material";

const width = 100;

export default function ProfilePage({goGallery}) {
  const [forUpdate, setForUpdate] = useState(0);
  const [userData, setUserData] = useState({});
  const [gameRecords, setGameRecords] = useState([]);
  const [battleWinRate, setBattleWinRate] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  const [totalDraws, setTotalDraws] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
  const [galleryImages, setGalleryImages] = useState([]);

  const navigate = useNavigate()
  const forceUpdate = () => setForUpdate(forUpdate + 1)

  // getUserInfo를 컴포넌트의 상위 스코프로 이동
  const getUserInfo = async (page = 0) => {
    try {
      const res = await authRequest().get("/api/user/info");
      if (typeof res.data === "string") {
        navigate("/");
      } else {
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("image", res.data.image);
        localStorage.setItem("provider", res.data.provider);
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("userName", res.data.userName);
        setUserData(res.data);

        // 사용자 ID로 게임 기록 및 승률 가져오기
        const userId = res.data.userId;

        // 페이징 요청
        const recordsRes = await authRequest().get(
          `/games/${userId}/records?page=${page}`
        );

        // 백엔드에서 받은 데이터 구조에 따라 상태 변수 설정
        const data = recordsRes.data;

        // teamMates와 opponents를 파싱하여 배열로 변환
        const processedRecords = data.records.map((record) => ({
          ...record,
          teamMates: record.teamMates ? JSON.parse(record.teamMates) : [],
          opponents: record.opponents ? JSON.parse(record.opponents) : [],
        }));

        setBattleWinRate(data.winRate || 0);
        setTotalWins(data.winCount || 0);
        setTotalLosses(data.lossCount || 0);
        setTotalDraws(data.drawCount || 0);
        setTotalGames(data.totalGames || 0);

        setGameRecords(processedRecords);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);

        const galleryRes = await authRequest().get(`/games/${userId}/records/gallery`);
        const galleryData = galleryRes.data;
          
        console.log(galleryData);

        const processedGallery = galleryData.map((record) => ({
          id: record.recordId,
          url: record.puzzleImage,
          roomTitle: record.gameName || "게임 이름 없음",
          description: "추가적인 설명란 필요?", // 필요에 따라 수정 가능
          piece: record.totalPieceCount.toString(),
          pieceCount: record.totalPieceCount,
          clearTime: `${record.battleTimer}초`,
          date: new Date(record.playedAt).toLocaleString(),
          teamMates: record.teamMates ? JSON.parse(record.teamMates) : [],
          opponents: record.opponents ? JSON.parse(record.opponents) : [],
          userTeam: record.userTeam, // 실제 데이터에 따라 설정
        }));

        console.log(processedGallery)
        setGalleryImages(processedGallery);

      }
    } catch (error) {
      console.error("사용자 정보 또는 게임 기록을 가져오는 중 오류 발생:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    getUserInfo(currentPage); // 초기 페이지 요청
  }, [forUpdate]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      getUserInfo(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      getUserInfo(currentPage - 1);
    }
  };

  // const moveGalleryWall = async () => {
  //   navigate(`/user/gallery`);
  // };

  // 게임 모드를 한글로 변환하는 함수
  const getGameModeText = (gameType) => {
    switch (gameType) {
      case "BATTLE":
        return "대전 모드";
      case "COOPERATION":
        return "협동 모드";
      case "SOLO":
        return "솔로 모드";
      default:
        return "알 수 없는 모드";
    }
  };

  return (
    <div style={{ paddingBottom: "50px" }}>
        <InfoWraper style={{ marginTop: "50px", padding: "35px" }}>
          <Profile>
            <div style={{
              backgroundImage: `url(${userData.image})`,
              display: 'inline-block',
              width: width,
              height: width,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: width / 2,
            }}></div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "bold" }}>{userData.userName}</div>
              <div style={{ fontSize: "20px" }}>{userData.email}</div>
            </div>
          </Profile>
        </InfoWraper>

        <InfoWraper style={{ marginTop: "40px" }}>
          <SubSection style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <InfoTitle>
              <Camera size={20} color="#3B82F6" />
              갤러리
              <SubDetail style={{ marginLeft: "10px" }}>{galleryImages.length}</SubDetail>
            </InfoTitle>
            <div
              onClick={() => goGallery()}
              style={{ display: "flex", alignItem: "center", color: "grey", cursor: "pointer" }}
            >
              더보기
              <ChevronRight size={20} style={{ margin: "auto 0" }} />
            </div>
          </SubSection>
          <GalleryWall count={3} data={galleryImages}/>
        </InfoWraper>

        <InfoWraper style={{ zIndex: "0" }}>
          <Battle>
            <SubSection>
              <InfoTitle>
                <Swords size={20} color="#FE5B5E" />
                대전 모드
              </InfoTitle>
            </SubSection>
            <SubSection>
              <Subtitle>전적</Subtitle>
              <SubValue>{totalWins}승 {totalDraws}무 {totalLosses}패</SubValue>
              <SubDetail>{totalGames}게임</SubDetail>
            </SubSection>
            <SubSection>
              <Subtitle>승률</Subtitle>
              <SubValue>{battleWinRate.toFixed(1)}%</SubValue>
            </SubSection>
          </Battle>
        </InfoWraper>

        <InfoWraper style={{ zIndex: "0" }}>
          <SubSection>
            <InfoTitle>
              <Star size={20} color="orange" />
              최근 게임 기록
            </InfoTitle>
          </SubSection>
          <Record>
            {Array.isArray(gameRecords) && gameRecords.length > 0 ? (
              gameRecords.map((record) => (
                <RecordCard key={record.recordId}>
                  <PuzzleImage src={record.puzzleImage} alt="퍼즐 이미지" />
                  <RecordInfo>
                    {/* Record Content */}
                    <RecordContent>
                      <RecordTitle>{record.gameName || "게임 이름 없음"}</RecordTitle>
                      <RecordDetail>{new Date(record.playedAt).toLocaleString()}</RecordDetail>
                      <RecordMode>{getGameModeText(record.gameType)}</RecordMode>
                    </RecordContent>
                    
                    {/* 대전 모드인 경우 팀원 정보 표시 */}
                    {record.gameType === "BATTLE" && (
                      <TeamContainer>
                        <TeamSection>
                          <TeamTitle>With</TeamTitle>
                          <TeamMembers>
                          {record.teamMates && Array.isArray(record.teamMates) && record.teamMates.length > 0 ? (
                            record.teamMates.map((member, index) => (
                              <MemberName key={index}>
                                  {member}
                                  {index < record.teamMates.length - 1 && ","} {/* 마지막 멤버가 아니라면 쉼표 추가 */}
                                </MemberName>
                            ))
                          ) : (
                            <MemberName>팀원 정보 없음</MemberName>
                          )}
                          </TeamMembers>
                        </TeamSection>
                        <TeamSection>
                          <TeamTitle>VS</TeamTitle>
                          <TeamMembers>
                            {record.opponents && Array.isArray(record.opponents) && record.opponents.length > 0 ? (
                              record.opponents.map((member, index) => (
                                <MemberName key={index}>
                                  {member}
                                  {index < record.opponents.length - 1 && ","} {/* 마지막 멤버가 아니라면 쉼표 추가 */}
                                </MemberName>
                              ))
                            ) : (
                              <MemberName>상대 팀원 정보 없음</MemberName>
                            )}
                          </TeamMembers>
                        </TeamSection>
                      </TeamContainer>
                    )}
                  </RecordInfo>

                  {/* 승패 정보 */}
                  <RecordResult
                    style={{
                      color: record.gameStatus === "WIN" ? "#15803D" : record.gameStatus === "DRAW" ? "#A855F7" : "#801515",
                      backgroundColor: record.gameStatus === "WIN" ? "#DCFCE7" : record.gameStatus === "DRAW" ? "#F3E8FF" : "#FCDCDC"
                    }}>
                    {record.gameStatus === "WIN" ? "승리" : record.gameStatus === "DRAW" ? "무승부" : "패배"}
                  </RecordResult>
                </RecordCard>
              ))
            ) : (
              <div>게임 기록이 없습니다.</div>
            )}
          </Record>
          <Navigation>
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              <ChevronLeft size="20" />
            </button>
            <span style={{marginBottom: "3px"}}>
              {currentPage + 1} / {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
              <ChevronRight size="20" />
            </button>
        </Navigation>
        </InfoWraper>
    </div>
  );
}

// 스타일 컴포넌트는 기존과 동일하게 유지합니다.
const RecordCard = styled(Button)`
  display: flex;
  align-items: center;
  padding: 0 20px 0 0;
  gap: 20px;
  height: 100px;
  background-color: #f5f5f5;
  border-radius: 10px;
  overflow: hidden;
`;

const PuzzleImage = styled.img`
  width: 160px;
  height: 100%;
  object-fit: cover;
`;

const RecordInfo = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
`;

const RecordContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const RecordTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333333;
`;

const RecordDetail = styled.div`
  font-size: 14px;
  color: #707070;
  margin-top: 4px;
`;

const RecordMode = styled.div`
  font-size: 14px;
  color: #707070;
  margin-top: 4px;
`;

const TeamContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
`;

const TeamSection = styled.div`
  display: flex;
  align-items: center;
`;

const TeamTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
`;

const TeamMembers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const MemberName = styled.div`
  font-size: 14px;
  color: #333333;
`;

const RecordResult = styled.span`
  margin-left: auto;
  padding: 5px 15px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 14px;
`;

const InfoWraper = styled.div`
  padding: 30px 25px;
  border-radius: 10px;
  background: white;
  box-sizing: border-box;
  max-width: 1000px;
  margin: 25px auto 0;
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
`

const Profile = styled.div`
  display: flex;
  gap: 35px;
  width: 100%;
  box-sizing: border-box;
`

const Battle = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-around;
`

const Record = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px; /* 카드 간격 조정 */
`;

const SubSection = styled.div`
  margin-right: auto;
`;

const InfoTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
`;

const Subtitle = styled.span`
  font-size: 16px;
  color: #707070;
`;

const SubValue = styled.span`
  font-size: 24px;
  font-weight: bold;
  color: #1a73e8;
  margin-top: 8px;
  display: block;
`;

const SubDetail = styled.span`
  font-size: 14px;
  color: #606060;
  margin-top: 4px;
  display: block;
`;

const Navigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  button {
    background-color: white;
    color: black;
    border: none;
    margin: 0 10px;
    cursor: pointer;

    &:disabled {
      color: #cccccc;
      cursor: not-allowed;
    }
  }
`;
