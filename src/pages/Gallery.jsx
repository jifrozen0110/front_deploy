import { useEffect, useState } from "react";
import { authRequest } from "../apis/requestBuilder";
import { styled } from "styled-components";
import GalleryWall from "@/components/MyPage/GalleryWall";
import { ChevronLeft } from "lucide-react";

export default function Gallery({goProfile}) {
  const [galleryImages, setGalleryImages] = useState([]);
  const [forUpdate, setForUpdate] = useState(0);

  const fetchGalleryData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const galleryRes = await authRequest().get(`/games/${userId}/records/gallery`);
      const galleryData = galleryRes.data;
        
      const processedGallery = galleryData.map((record) => ({
        id: record.recordId,
        url: record.puzzleImage,
        roomTitle: record.gameName || "게임 이름 없음",
        description: "", // 필요에 따라 수정 가능
        piece: record.totalPieceCount.toString(),
        pieceCount: record.totalPieceCount,
        clearTime: `${record.battleTimer}초`,
        date: new Date(record.playedAt).toLocaleString(),
        teamMates: record.teamMates ? JSON.parse(record.teamMates) : [],
        opponents: record.opponents ? JSON.parse(record.opponents) : [],
        userTeam: record.userTeam, // 실제 데이터에 따라 설정
      }));
      setGalleryImages(processedGallery);
    } catch (error) {
      console.error("갤러리 데이터를 가져오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, [forUpdate]);

  return (
    <>
        <InfoWraper style={{ marginTop: "40px" }}>
          <SubSection style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <InfoTitle>
              <div
                onClick={() => goProfile()}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={20} />
                갤러리
              </div>
              <SubDetail style={{ marginLeft: "10px" }}>{galleryImages.length}</SubDetail>
            </InfoTitle>
          </SubSection>
          <GalleryWall data={galleryImages} />
        </InfoWraper>
    </>
  );
}

const InfoWraper = styled.div`
  padding: 30px 25px;
  border-radius: 10px;
  background: white;
  box-sizing: border-box;
  max-width: 1000px;
  margin: 25px auto 0;
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
`;

const SubSection = styled.div`
  margin-right: auto;
`;

const InfoTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  font-weight: bold;
`;

const SubDetail = styled.span`
  font-size: 14px;
  color: #606060;
  margin-top: 4px;
  display: block;
`;
