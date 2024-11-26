import React, { useState } from 'react';
import { styled } from 'styled-components';
import Avatar from "@mui/material/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TextField from "@mui/material/TextField";
import { authRequest } from "../../apis/requestBuilder";

// 스타일링 컴포넌트들
const StyledTextField = styled(TextField)`
  margin-bottom: 15px;
  width: 100%;
`;

const FriendsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FriendItem = styled(ListItem)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InviteButton = styled(IconButton)`
  color: #3498db;
`;

const SearchUser = ({ onAddFriend }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchChange = async (e) => {
    const userId = localStorage.userId
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    if (keyword.length > 0) {
      try {
        const res = await authRequest().get(`/api/friend/search?keyword=${keyword}`);
        // 자기 자신은 검색에서 제외
        const filteredResults = res.data.filter((user)=>user.userId !== parseInt(userId));
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("친구 검색 중 오류 발생:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <>
      <StyledTextField
        label="검색할 사용자 이름"
        variant="outlined"
        size="small"
        value={searchKeyword}
        onChange={handleSearchChange}
      />
      {searchResults.length > 0 && (
        <FriendsList>
          {searchResults.map((result) => (
            <FriendItem key={result.userId}>
              <ListItemAvatar>
                <Avatar src={result.userImage} alt={result.userName} />
              </ListItemAvatar>
              <ListItemText primary={result.userName} secondary={result.email} />
              <InviteButton onClick={() => onAddFriend(result.userId)}>
                <PersonAddIcon />
              </InviteButton>
            </FriendItem>
          ))}
        </FriendsList>
      )}
    </>
  );
};

export default SearchUser;
