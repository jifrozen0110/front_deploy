// src/components/MyPage/GalleryWall.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { X, Users } from "lucide-react";

const GalleryWall = ({ count = 0, data }) => { // data prop 추가
  const [selectedImage, setSelectedImage] = useState(null);

  // count가 0보다 크면 data를 count만큼 슬라이스, 아니면 전체 데이터를 사용
  const limitedImages = count > 0 ? data.slice(0, count) : data;

  return (
    <Container>
      {/* 갤러리 그리드 */}
      <GalleryGrid>
        {limitedImages.map((image) => (
          <ImageWrapper key={image.id} onClick={() => {
            setSelectedImage(image)}}>
            <ImageContainer>
              <Image src={image.url} alt={image.roomTitle} />
              <ImageOverlay />
              <ImageTitle>
                <h3>{image.roomTitle}</h3>
                <p>{image.pieceCount} 조각</p> {/* pieceCount 추가 */}
              </ImageTitle>
            </ImageContainer>
          </ImageWrapper>
        ))}
      </GalleryGrid>

      {/* 상세 보기 모달 */}
      {selectedImage && (
        <ModalOverlay onClick={() => setSelectedImage(null)}>
          <ModalCard onClick={(e) => e.stopPropagation()}> {/* 이벤트 전파 중지 */}
            <ModalContent>
              <ImageContainerModal>
                <ImageModal src={selectedImage.url} alt={selectedImage.roomTitle} />
              </ImageContainerModal>
              <Details>
                <InfoRow>
                  <span>
                    {selectedImage.pieceCount}피스 {selectedImage.clearTime}
                  </span>
                  <span>{selectedImage.date}</span>
                </InfoRow>
                <Title>
                  <h2>{selectedImage.roomTitle}</h2>
                  <span>{selectedImage.description}</span>
                </Title>

                {/* 함께한 사람들 */}
                <DescriptionBox>
                  <DescriptionHeader>
                    <Users size={20} color="#22C55E" />
                    <span>함께한 사람들</span>
                  </DescriptionHeader>
                  <UserList>
                    {selectedImage.teamMates && selectedImage.teamMates.length > 0 ? (
                      selectedImage.teamMates.map((member, index) => (
                        <MemberBadge key={index}>
                          {member}
                        </MemberBadge>
                      ))
                    ) : (
                      <NoUsersMessage>함께한 사람이 없습니다.</NoUsersMessage>
                    )}
                  </UserList>
                </DescriptionBox>

                {/* 상대한 사람들 */}
                <DescriptionBox>
                  <DescriptionHeader>
                    <Users size={20} color="#EF4444" />
                    <span>상대한 사람들</span>
                  </DescriptionHeader>
                  <UserList>
                    {selectedImage.opponents && selectedImage.opponents.length > 0 ? (
                      selectedImage.opponents.map((member, index) => (
                        <MemberBadge key={index}>
                          {member}
                        </MemberBadge>
                      ))
                    ) : (
                      <NoUsersMessage>상대한 사람이 없습니다.</NoUsersMessage>
                    )}
                  </UserList>
                </DescriptionBox>
              </Details>
            </ModalContent>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default GalleryWall;

// Styled Components
const Container = styled.div``;

const GalleryGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* 반응형 그리드 */
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ImageWrapper = styled.div`
  cursor: pointer;
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 2px 2px 6px 0 rgba(0, 0, 0, 0.25);
  aspect-ratio: 1 / 1;
  border-radius: 12px; /* 모서리 둥글게 */
`;

const ImageContainerModal = styled.div`
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 2px 2px 6px 0 rgba(0, 0, 0, 0.25);
  line-height: 0;
  border-radius: 12px;
`;
const MemberName = styled.div`
  font-size: 14px;
  color: #333333;
`;
const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  border-radius: 12px;

  &:hover {
    transform: scale(1.05);
  }
`;

const ImageModal = styled.img`
  max-height: 50vh;
  max-width: 60vw;
  object-fit: contain;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    max-width: 90vw;
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
  opacity: 0;
  transition: opacity 0.3s;

  ${ImageWrapper}:hover & {
    opacity: 1;
  }
`;

const ImageTitle = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.3s, transform 0.3s;

  h3 {
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
  }

  p {
    color: white;
    font-size: 1rem;
    margin: 4px 0 0;
  }

  ${ImageWrapper}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 16px;
`;

const CloseButton = styled.button`
  position: absolute; /* 모달 내부의 상대적 위치 */
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.8); /* 반투명 배경 */
  border: none;
  border-radius: 50%; /* 둥근 버튼 */
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2); /* 그림자 효과 */
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  z-index: 10; /* 모달 콘텐츠보다 위에 배치 */

  &:hover {
    background: rgba(255, 255, 255, 1); /* hover 시 완전 불투명 */
    transform: scale(1.1); /* 버튼 크기 확대 */
  }

  svg {
    width: 20px;
    height: 20px;
    color: rgba(0, 0, 0, 0.6); /* X 아이콘 색상 */
    transition: color 0.3s;

    &:hover {
      color: rgba(0, 0, 0, 1); /* hover 시 색상 진하게 */
    }
  }
`;

const ModalCard = styled.div`
  position: relative; /* 자식 요소의 위치 기준 */
  background: white;
  min-width: 600px;
  min-height: 700px;
  max-width: 60vw;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  @media (max-width: 768px) {
    max-width: 90vw;
  }
`;


const ModalContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: #606060;
`;

const Title = styled.div`
  h2 {
    font-size: 1.8rem;
    font-weight: bold;
    color: #333;
    margin: 0;
  }

  span {
    font-size: 1rem;
    color: #555;
  }
`;

const DescriptionBox = styled.div`
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
`;

const DescriptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .icon {
    width: 20px;
    height: 20px;
    color: #2563eb;
  }

  span {
    font-weight: bold;
    color: #333;
  }
`;

const MemberBadge = styled.div`
  display: inline-block;
  background-color: #e5e7eb;
  color: #111827;
  padding: 8px 12px;
  margin: 4px;
  border-radius: 9999px; /* 둥근 모서리 */
  font-size: 14px;
  font-weight: 500;
`;

const UserList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #ececec;
  }
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserName = styled.span`
  font-weight: bold;
  color: #333;
`;

const NoUsersMessage = styled.div`
  font-size: 14px;
  color: #707070;
  text-align: center;
  margin-top: 10px;
`;
