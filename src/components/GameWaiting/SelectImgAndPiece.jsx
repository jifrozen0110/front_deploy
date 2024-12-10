import { useState, useEffect } from "react";
import { styled } from "styled-components";
import {
  Box,
  Button,
  Select,
  Dialog,
  Typography,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import { request, requestFile } from "@/apis/requestBuilder";
import { getSender, getRoomId } from "@/socket-utils/storage";

import { socket } from "@/socket-utils/socket2";
import { useGameInfo } from "../../hooks/useGameInfo";
const { send } = socket;

export default function SelectImgAndPiece({ src, allowedPiece }) {
  const [open, setOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState(`data:image/jpeg;base64,${src}`);

  const { image, setImage } = useGameInfo();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedImg(value);
  };

  useEffect(() => {
    if (src === "짱구.jpg") {
      setSelectedImg(
        "https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp",
      );
      setImage(
        "https://i.namu.wiki/i/1zQlFS0_ZoofiPI4-mcmXA8zXHEcgFiAbHcnjGr7RAEyjwMHvDbrbsc8ekjZ5iWMGyzJrGl96Fv5ZIgm6YR_nA.webp",
      );
    } else {
      setSelectedImg(src);
      setImage(src);
    }
  }, []);

  const theme = createTheme({
    typography: {
      fontFamily: "'Galmuri11', sans-serif",
    },
    palette: {
      purple: {
        light: deepPurple[200],
        main: deepPurple[300],
        dark: deepPurple[400],
        darker: deepPurple[600],
        contrastText: "#fff",
      },
    },
    components: {
      MuiSelect: {
        styleOverrides: {
          root: {
            "& .Mui-selected": {
              backgroundColor: deepPurple[100],
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <InnerBox>
        <ImgButton src={image} onClick={handleClickOpen} />
        <ImgDialog selectedImg={selectedImg} open={open} onClose={handleClose} />
      </InnerBox>
    </ThemeProvider>
  );
}

function ImgDialog({ onClose, selectedImg, open }) {
  const [imageList, setImageList] = useState([]);

  async function fetchImage() {
    try {
      const res = await request.get("/image/list/puzzle");
    } catch (error) {
      console.error("Error fetching image data:", error);
    }
  }

  useEffect(() => {
    fetchImage();
  }, []);

  const handleClose = () => {
    onClose(selectedImg);
  };

  const handleImgClick = async (value, src) => {
    try {
      const res = await request.post(`/game/room/picture`, {
        picture: {
          id: value,
        },
        user: {
          id: getSender(),
        },
        uuid: getRoomId(),
      });

      send(
        `/app/game/message`,
        {},
        JSON.stringify({
          roomId: getRoomId(),
          type: "IMAGE",
        }),
      );
      onClose(src);
    } catch (e) {
      console.log(e);
    }
  };

  const handleFileChange = async (event) => {
    postFile(event.target.files[0]);
  };

  const postFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "sPuzzle");
    const res = await requestFile.post("/image", formData);

    const imgRes = await request.get(`/image/${res.data}`);
    onClose(`data:image/jpeg;base64,${imgRes.data}`);
    fetchImage();
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="md">
      <Typography
        variant="h4"
        sx={{ margin: "5% 10% 2% 10%", fontWeight: "bold", color: "#9575cd" }}
      >
        퍼즐 그림 선택하기
      </Typography>
      <Grid container sx={{ width: "80%", margin: "0 10% 5% 10%" }}>
        {imageList.map((data) => {
          return (
            <Grid key={data.id} item xs={3}>
              <ImgButton
                src={`data:image/jpeg;base64,${data.base64_image}`}
                value={data.base64_image}
                onClick={() =>
                  handleImgClick(data.id, `data:image/jpeg;base64,${data.base64_image}`)
                }
              />
            </Grid>
          );
        })}
        <Grid item xs={3}>
          <PlusButton component="label">
            <AddIcon sx={{ color: "#9575cd", width: "100%" }} />
            <VisuallyHiddenInput
              type="file"
              accept="image/jpeg, image/png"
              onChange={handleFileChange}
            />
          </PlusButton>
        </Grid>
      </Grid>
    </Dialog>
  );
}

const InnerBox = styled(Box)`
  width: 95%;
  padding: 2% 3%;
  margin: 5px 0;
  background-color: rgba(231, 224, 255, 0.7);
  border: 1px solid #c4b6fb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;

  & label.Mui-focused {
    color: ${deepPurple[400]};
  }
`;

const ImgButton = styled.img`
  width: 80%;
  margin: 3% auto 5% auto;
  border: 1px solid #ccc;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    transition: all 0.3s;
    box-shadow: 3px 3px 8px lightgray;
  }
`;

const PlusButton = styled(Button)`
  width: 80%;
  height: 120px;
  margin: 10% auto 5% auto;
  border: 3px solid #d1c4e9;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    transition: all 0.3s;
    background-color: #ede7f6;
    box-shadow: 3px 3px 8px #7e57c2;
  }

  & .MuiSvgIcon-root {
    font-size: 35px;
  }
`;

const VisuallyHiddenInput = styled.input`
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  whitespace: nowrap;
  width: 1;
`;
