import React from 'react';
import styled from 'styled-components';

const CATEGORIES = [
  { id: "moon", label: "문어" },
  { id: "minjae", label: "민재민재" },
  { id: "jinsang", label: "진상" },
  { id: "gochan", label: "고찬" },
  { id: "inuyasha", label: "이누야샤" },
];

const SidebarButton = styled.button`
  background-color: #f2994a;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  
  &:hover {
    background-color: #e07b24;
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
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
`;

const UserListSidebar = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <RightSidebar>
      <div style={{display : "flex", gap:"10px"}}>
      <SidebarButton>유저 목록</SidebarButton>
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