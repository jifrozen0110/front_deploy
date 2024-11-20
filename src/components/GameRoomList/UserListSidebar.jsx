import React from 'react';
import styled from 'styled-components';
import Button from "@mui/material/Button";

const CATEGORIES = [
  { id: "moon", label: "문어" },
  { id: "minjae", label: "민재민재" },
  { id: "jinsang", label: "진상" },
  { id: "gochan", label: "고찬" },
  { id: "inuyasha", label: "이누야샤" },
];

const SidebarButton = styled(Button)`
  background-color: orange;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  
  &:hover {
    background-color: darkorange;
  }
`;

const CategoryList = styled.div`
  margin-top: 20px;
`;

const CategoryButton = styled.button`
  display: block;
  background-color: #3498db;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
  text-align: left;
  width: 200px;

  &:hover {
    background-color: #2980b9;
  }
`;

const RightSidebar = styled.div`
  background-color: rgba(255, 255, 255, 0.6); /* 반투명 배경 */
  backdrop-filter: blur(40px); /* 블러 효과 */
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
`;

const UserListSidebar = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <RightSidebar>
      <div style={{display : "flex", gap:"10px"}}>
      <SidebarButton>친구 목록</SidebarButton>
      </div>
      <CategoryList>
        {/* {CATEGORIES.map((category) => (
          <CategoryButton
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </CategoryButton>
        ))} */}
      </CategoryList>
    </RightSidebar>
  );
};

export default UserListSidebar;