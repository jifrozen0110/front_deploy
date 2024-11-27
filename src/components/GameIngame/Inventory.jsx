import React, { useState } from "react";
import "./Inventory.css";
import firePath from "@/assets/effects/fire.gif";
import boomPath from "@/assets/effects/boom.png";
import mudPath from "@/assets/effects/mud.png";
import squidPath from "@/assets/effects/squid.png";
import tornadoPath from "@/assets/effects/tornado.gif";
import bloomPath from "@/assets/effects/blooming.gif";
import blackholePath from "@/assets/effects/blackhole.png";
import twinklePath from "@/assets/effects/twinkle.gif";
import framePath from "@/assets/effects/frame.png";

const itemImgs = [null, boomPath, squidPath, tornadoPath, blackholePath, framePath]

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