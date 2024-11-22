import React, { useState } from "react";
import "./Inventory.css";
import { socket } from "@/socket-utils/socket2";
const { send, subscribe } = socket;

const Inventory = ({slots, gameId, team}) => {

  const handleSlotClick = (index) => {
    if(slots[index])
        send(`/pub/game/${gameId}/item/${index}`, {}, team)
  };

  return (
    <div className="inventory">
      {slots.map((item, index) => (
        <div
          key={index}
          className={`slot ${item ? "filled" : "empty"}`}
          onClick={() => handleSlotClick(index)}
        >
          {item || "+"}
        </div>
      ))}
    </div>
  );
};

export default Inventory;