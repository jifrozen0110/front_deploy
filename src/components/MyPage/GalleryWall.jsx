import React, { useState } from 'react';
import { styled } from 'styled-components';
import { X, Users } from 'lucide-react';

const GalleryWall = ({count = 0}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    {
      id: 1,
      url: 'https://i.namu.wiki/i/nOXgZWBRaZguCSSys7FwQEdEae7OIo3gU6kMwqQ-52ITBgrmTNxqaOVF68Arm5pxLGUAy08DWHLhZdn_6hyzdg.webp',
      roomTitle: '퍼즐 한 판',
      description: '추가적인 설명란 필요?',
      piece: '300',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50", // 유저 아바타 이미지
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
    {
      id: 2,
      url: 'https://i.pinimg.com/originals/b5/9d/8f/b59d8f8cbb54368862109db8324dc6b8.jpg',
      roomTitle: '너만 오면 고',
      description: '추가적인 설명란 필요?',
      piece: '500',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
    {
      id: 3,
      url: 'https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp',
      roomTitle: '짱구가 좋아',
      description: '추가적인 설명란 필요?',
      piece: '100',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50", // 유저 아바타 이미지
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
    {
      id: 4,
      url: 'https://i.namu.wiki/i/nOXgZWBRaZguCSSys7FwQEdEae7OIo3gU6kMwqQ-52ITBgrmTNxqaOVF68Arm5pxLGUAy08DWHLhZdn_6hyzdg.webp',
      roomTitle: '퍼즐 한 판',
      description: '추가적인 설명란 필요?',
      piece: '300',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50", // 유저 아바타 이미지
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
    {
      id: 5,
      url: 'https://i.pinimg.com/originals/b5/9d/8f/b59d8f8cbb54368862109db8324dc6b8.jpg',
      roomTitle: '너만 오면 고',
      description: '추가적인 설명란 필요?',
      piece: '500',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
    {
      id: 6,
      url: 'https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp',
      roomTitle: '짱구가 좋아',
      description: '추가적인 설명란 필요?',
      piece: '100',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50", // 유저 아바타 이미지
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
    {
      id: 7,
      url: 'https://i.namu.wiki/i/nOXgZWBRaZguCSSys7FwQEdEae7OIo3gU6kMwqQ-52ITBgrmTNxqaOVF68Arm5pxLGUAy08DWHLhZdn_6hyzdg.webp',
      roomTitle: '퍼즐 한 판',
      description: '추가적인 설명란 필요?',
      piece: '300',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50", // 유저 아바타 이미지
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
    {
      id: 8,
      url: 'https://i.pinimg.com/originals/b5/9d/8f/b59d8f8cbb54368862109db8324dc6b8.jpg',
      roomTitle: '너만 오면 고',
      description: '추가적인 설명란 필요?',
      piece: '500',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
    {
      id: 9,
      url: 'https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp',
      roomTitle: '짱구가 좋아',
      description: '추가적인 설명란 필요?',
      piece: '100',
      clearTime: '10:10',
      date: '2024/11/25 10:00',
      whos: [
        {
          id: 1,
          name: "이누야샤",
          avatar: "https://via.placeholder.com/50", // 유저 아바타 이미지
        },
        {
          id: 2,
          name: "카구라",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 3,
          name: "셋쇼마루",
          avatar: "https://via.placeholder.com/50",
        },
        {
          id: 4,
          name: "미로쿠",
          avatar: "https://via.placeholder.com/50",
        },
      ]
    },
  ];

  const limitedImages = count ? images.slice(0, count) : images;

  return (
    <Container>
      {/* 갤러리 그리드 */}
      <GalleryGrid>
        {limitedImages.map((image) => (
          <ImageWrapper
            key={image.id}
            onClick={() => setSelectedImage(image)}
          >
            <ImageContainer>
              <Image src={image.url} alt={image.roomTitle} />
              <ImageOverlay />
              <ImageTitle>
                <h3>{image.roomTitle}</h3>
              </ImageTitle>
            </ImageContainer>
          </ImageWrapper>
        ))}
      </GalleryGrid>

      {/* 상세 보기 모달 */}
      {selectedImage && (
        <ModalOverlay>
          <ModalCard>
            <CloseButton onClick={() => setSelectedImage(null)} style={{zIndex: "1"}}>
              <X color="rgba(0,0,0,0.6)" />
            </CloseButton>
            <ModalContent>
              <ImageContainerModal>
                <ImageModal src={selectedImage.url} alt={selectedImage.roomTitle} />
              </ImageContainerModal>
              <Details>
                <div style={{display: "flex", justifyContent: "space-between", color: "#606060"}}>
                  <span>{selectedImage.piece}피스 {selectedImage.clearTime}</span>
                  <span>{selectedImage.date}</span>
                </div>
                <Title>
                  <h2>{selectedImage.roomTitle}</h2>
                  <span>{selectedImage.description}</span>
                </Title>
                <DescriptionBox>
                  <DescriptionHeader>
                    <Users size={20} color="#22C55E" />
                    <span>함께한 사람들</span>
                  </DescriptionHeader>
                  <UserList>
                    {selectedImage.whos.map((user) => (
                      <UserCard key={user.id}>
                        <UserAvatar src={user.avatar} alt={user.name} />
                        <UserName>{user.name}</UserName>
                      </UserCard>
                    ))}
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
const Container = styled.div`
`;

const GalleryGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const ImageWrapper = styled.div`
  cursor: pointer;
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 2px 2px 6px 0 rgba(0,0,0,0.25);
  aspect-ratio: 1 / 1;
`;

const ImageContainerModal = styled.div`
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 2px 2px 6px 0 rgba(0,0,0,0.25);
  line-height: 0;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
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

const ModalCard = styled.div`
  position: fixed;
  background: white;
  max-width: 60vw;
  max-height: 90vh;
  border-radius: 12px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  z-index: 60;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 6px; /* 스크롤바 너비 */
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


const CloseButton = styled.button`
  position: sticky;
  display: flex;
  justify-content: end;
  top: 5px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  .icon {
    width: 24px;
    height: 24px;
  }
`;

const ModalContent = styled.div`
  padding: 0 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1; /* 남은 공간을 채우도록 설정 */
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.div`
  h2 {
    font-size: 1.8rem;
    font-weight: bold;
    color: #333;
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

const UserList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 8px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  min-width: 100px;
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
