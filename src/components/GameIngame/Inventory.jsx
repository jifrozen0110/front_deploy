import React, { useState } from "react";
import "./Inventory.css";

const Inventory = ({slots, useItem}) => {
  const onSlotClick = (index) => {
    console.log("slot click")
    if(slots[index]){
      console.log("send target", index)
      useItem(index)
    }
  }
  return (
    <div className="inventory">
      {slots.map((item, index) => (
        <div
          key={index}
          className={`slot ${item ? "filled" : "empty"}`}
          onClick={() => onSlotClick(index)}
        >
          {item || "+"}
        </div>
      ))}
    </div>
  );
};

export default Inventory;