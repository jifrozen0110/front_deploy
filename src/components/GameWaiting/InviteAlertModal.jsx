import { useState } from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";

// 초대 알림 모달 컴포넌트
export default function InviteAlertModal({ isOpen, onClose, inviter, onAccept, onDecline }) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div style={modalStyle}>
        <h2>{`${inviter}님이 초대하셨습니다.`}</h2>
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="primary" onClick={onAccept}>
            수락
          </Button>
          <Button variant="contained" color="secondary" onClick={onDecline}>
            거절
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const modalStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  width: '300px',
  margin: '100px auto',
};
