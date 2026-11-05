"use client";

import React, { useEffect, useRef, useState } from "react";
// นำเข้าไฟล์รูปภาพจากโฟลเดอร์ assets/imgs (ปรับ path ตามโครงสร้างโฟลเดอร์โครงการของคุณ)
import fillImg from "../animation/imgs/fill.jpg";
import basketballImg from "../animation/imgs/basketball.png";
import footballImg from "../animation/imgs/football.png";
import volleyballImg from "../animation/imgs/volleyball.png";
import studenImg from "../animation/imgs/human.gif";

// กำหนด Interface สำหรับ Props เพื่อรองรับ TypeScript และแก้ Error ts(2339)
interface AnimationProps {
  fillWidth?: number;
  fillHeight?: number;
  ballRadius?: number;
  ballVelocity?: number;
  keyEvent?: { key?: string };
}

const Animation: React.FC<AnimationProps> = ({
  fillWidth = 640,
  fillHeight = 480,
  ballRadius = 50,
  ballVelocity = 50,
  keyEvent = {},
}) => {
  // คำนวณค่าภายใน
  const ballDiameter = 2 * ballRadius;
  const maxX = fillWidth - ballDiameter - 8;
  const maxY = fillHeight - ballDiameter - 8;
  const xVelocity = Math.round(ballVelocity * Math.sqrt(2));
  const yVelocity = Math.round(ballVelocity * Math.sqrt(2));
  const frameRate = 25; // FPS
  const frameTime = 1 / frameRate; // วินาที

  // States
  const [running, setRunning] = useState(false);
  const [rotate, setRotate] = useState(0);
  const [ballType, setBallType] = useState<string>("none");

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const [moveLeft, setMoveLeft] = useState(true);
  const [moveDown, setMoveDown] = useState(true);

  // DOM Refs
  const ballRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  // ตรวจสอบ Keyboard Event
  useEffect(() => {
    if (!keyEvent || !keyEvent.key) return;

    if (keyEvent.key === " ") {
      setRunning((prev) => !prev);
    } else if (keyEvent.key === "0") {
      setBallType("none");
    } else if (keyEvent.key === "1") {
      setBallType("basketball");
    } else if (keyEvent.key === "2") {
      setBallType("football");
    } else if (keyEvent.key === "3") {
      setBallType("volleyball");
    } else if (keyEvent.key === "4") {
      setBallType("human");
    }
  }, [keyEvent]);

  // เปลี่ยนรูปพื้นหลังของลูกบอล
  useEffect(() => {
    if (!ballRef.current) return;

    // ฟังก์ชันดึง URL รูปภาพรองรับทั้ง Static Import ของ Next.js และ String Path
    const getImageSrc = (img: any) => (typeof img === "string" ? img : img?.src || "");

    if (ballType === "none") {
      ballRef.current.style.backgroundImage = "";
    } else if (ballType === "basketball") {
      ballRef.current.style.backgroundImage = `url(${getImageSrc(basketballImg)})`;
    } else if (ballType === "football") {
      ballRef.current.style.backgroundImage = `url(${getImageSrc(footballImg)})`;
    } else if (ballType === "volleyball") {
      ballRef.current.style.backgroundImage = `url(${getImageSrc(volleyballImg)})`;
    } else if (ballType === "human") {
      ballRef.current.style.backgroundImage = `url(${getImageSrc(studenImg)})`;
    }
  }, [ballType]);

  // จัดการ Loop คำนวณเฟรม
  useEffect(() => {
    if (running) {
      timer.current = setTimeout(calculateNextFrame, frameTime * 1000);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  });

  const calculateNextFrame = () => {
    // แกน X
    if (moveLeft) {
      setX((prevX) => prevX + xVelocity / frameRate);

      if (x >= maxX) {
        setX((prevX) => prevX - (prevX - maxX));
        setMoveLeft(false);
        return;
      }
      setRotate((prevRotate) => prevRotate + 10);
    } else {
      setX((prevX) => prevX - xVelocity / frameRate);

      if (x <= 0) {
        setX((prevX) => -prevX);
        setMoveLeft(true);
        return;
      }
      setRotate((prevRotate) => prevRotate - 10);
    }

    // แกน Y
    if (moveDown) {
      setY((prevY) => prevY + yVelocity / frameRate);

      if (y >= maxY) {
        setY((prevY) => prevY - (prevY - maxY));
        setMoveDown(false);
      }
    } else {
      setY((prevY) => prevY - yVelocity / frameRate);

      if (y <= 0) {
        setY((prevY) => -prevY);
        setMoveDown(true);
      }
    }
  };

  const bgStyle = typeof fillImg === "string" ? fillImg : (fillImg as any)?.src;

  return (
    <div className="flex flex-col items-center mt-3">
      {/* ชื่อผู้พัฒนา */}

      {/* พื้นที่หลัก (Fill Area) */}
      <div
        className="m-2 border-2 border-black rounded-2xl relative bg-center bg-cover overflow-hidden"
        style={{
          width: `${fillWidth}px`,
          height: `${fillHeight}px`,
          backgroundImage: bgStyle ? `url(${bgStyle})` : "none",
        }}
      >
        {/* ลูกบอล */}
        <div
          ref={ballRef}
          className="border border-black rounded-full absolute bg-cyan-400 bg-center bg-cover transition-transform"
          style={{
            width: `${ballDiameter}px`,
            height: `${ballDiameter}px`,
            top: `${y}px`,
            left: `${x}px`,
            transform: `rotate(${rotate}deg)`,
          }}
        ></div>
      </div>

      {/* แผงควบคุม (Controls) */}
      <div
        className="m-3 flex justify-between items-center"
        style={{ width: `${fillWidth}px` }}
      >
        {/* ปุ่ม Run/Pause */}
        <button
          onClick={() => setRunning(!running)}
          className={`capitalize px-4 py-2 rounded font-medium text-white transition-colors flex items-center gap-1 ${
            running
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {running ? (
            <>
              <span>⏸</span> Pause
            </>
          ) : (
            <>
              <span>▶</span> Run
            </>
          )}
        </button>

        {/* ปุ่มเลือกชนิดลูกบอล */}
        <div className="flex gap-2">
          <button
            onClick={() => setBallType("none")}
            className="capitalize px-3 py-1.5 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white rounded transition-colors"
          >
            none
          </button>
          <button
            onClick={() => setBallType("basketball")}
            className="capitalize px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
          >
            basketball
          </button>
          <button
            onClick={() => setBallType("football")}
            className="capitalize px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
          >
            football
          </button>
          <button
            onClick={() => setBallType("volleyball")}
            className="capitalize px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
          >
            volleyball
          </button>
          <button
            onClick={() => setBallType("human")}
            className="capitalize px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
          >
            Human
          </button>
        </div>
      </div>
    </div>
  );
};

export default Animation;