import { styled } from "styled-components";

export default function ImageIcon({ imageSource, size = "md", onClick }) {
  const width = widthMatcher[size];

  return (
    <Container width={width}>
      <img
        src={imageSource}
        style={{
          cursor: "pointer",
        }}
        onClick={onClick}
      />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: ${({ width }) => width};

  img {
    width: 100%;
  }
`;

const widthMatcher = {
  sm: "30px",
  md: "45px",
  lg: "60px",
};
