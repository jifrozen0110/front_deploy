﻿import React, { useState } from "react";
import "./Inventory.css";
import firePath from "@/assets/effects/fire.gif";
import mudPath from "@/assets/effects/mud.png";

const itemImgs = [null, firePath, mudPath]


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
          {item
          ? <img src={itemImgs[item]} style={{
            maxHeight:"100%",
            maxWidth:"100%"
          }}/>
          : "+"}
        </div>
      ))}
    </div>
  );
};

export default Inventory;