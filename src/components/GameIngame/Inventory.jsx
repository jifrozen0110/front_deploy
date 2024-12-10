import React from "react";
import styled from "styled-components";
import boomPath from "@/assets/effects/boom.png";
import squidPath from "@/assets/effects/squid.png";
import tornadoPath from "@/assets/effects/tornado.gif";
import blackholePath from "@/assets/effects/blackhole.png";
import framePath from "@/assets/effects/frame.png";

import { getTeam } from "@/socket-utils/storage";
import { red, blue } from "@mui/material/colors";

// Item 이미지 배열
const itemImgs = [null, boomPath, squidPath, tornadoPath, blackholePath, framePath];

const Inventory = ({ slots, useItem, color }) => {
  const onSlotClick = (index) => {
    if (slots[index]) {
      useItem(index);
    }
  };

  return (
    <InventoryContainer color={color}>
      {slots.map((item, index) => (
        <Slot
          key={index}
          className={`slot ${item ? "filled" : "empty"}`}
          color={color}
          filled={!!item} // styled-components에서만 사용하는 prop
          onClick={() => onSlotClick(index)}
        >
          {item ? (
            <img src={itemImgs[item]} alt={`Item ${item}`} />
          ) : (
            "+" /* 빈 슬롯 */
          )}
        </Slot>
      ))}
    </InventoryContainer>
  );
};

export default Inventory;

const InventoryContainer = styled.div`
  display: flex;
  justify-content: space-around; /* 슬롯 간 간격을 균등하게 */
  align-items: center;
  gap: 10px; /* 슬롯 간의 간격 */
  padding: 10px 30px;
  // border-left: 4px solid ${getTeam() === "red" ? red[400] : blue[400]};
  // border-top: 4px solid ${getTeam() === "red" ? red[400] : blue[400]};
  // border-radius: 10px 0 0 0;
`;

const Slot = styled.div`
  width: 50px;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid ${(props) => props.filled ? (getTeam() === "red" ? red[400] : blue[400]) : "none"}; /* 슬롯 테두리 */
  border-radius: 8px;
  background-color: ${(props) => props.filled ? "white" : props.color === "red" ? "#FFA9AA" : "#9ED0FF"}; /* 배경색 설정 */
  box-shadow: 0 4px 3px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    border-color: ${getTeam() === "red" ? red[400] : blue[400]};
    border: 2px solid ${(props) => getTeam() === "red" ? red[200] : blue[200]}; /* 슬롯 테두리 */
  }
  &:active {
    transform: scale(0.95);
  }

  img {
    max-width: 100%;
    max-height: 100%;
  }
`;