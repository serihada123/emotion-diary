"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useId } from "react";
import { getEntryDate, readArchive } from "../lib/archive-storage.mjs";

/* ---------- 캐릭터 이름 ---------- */
const CHARACTER_NAME = "우루루";
const URUURU_IMG = "/images/uruuru.png";
const URUURU_SCROLL_IMG = "/images/uruuru-scroll.png";
const URUURU_EXCLAIM_IMG = "/images/uruuru-exclaim.png";
const URUURU_QUESTION_IMG = "/images/uruuru-question.png";
const URUURU_JOYWAVE_IMG = "/images/uruuru-joywave.png";
const URUURU_HEARTPOSE_IMG = "/images/uruuru-heartpose.png";
const URUURU_SMILEYPOSE_IMG = "/images/uruuru-smileypose.png";
const URUURU_BURSTPOSE_IMG = "/images/uruuru-burstpose.png";
const SKY_BG_IMG = "/images/sky-bg.jpg";

/* ---------- 색상/스타일 토큰 (지금까지 확정된 목업 기준) ---------- */
const COLORS = {
  bg: "#C5E4EF",
  archiveBg: "#F4F1E9",
  navy: "#1B3A5C",
  navyDark: "#123055",
  cream: "#FAEEDA",
  amber: "#EF9F27",
  amberDeep: "#D8A34E",
  ink: "#1A1A1A",
  textSecondary: "#3A4A52",
  textMuted: "#8B8578",
  white: "#FFFFFF",
};

/* ---------- 우루루 캐릭터 (사용자 업로드 리소스 적용, 감정 반응은 CSS 트랜스폼으로 표현) ---------- */
function PenguinCharacter({ reaction, size = 130, pose }) {
  const reactionClass = reaction ? `peng-${reaction}` : "";
  const POSE_IMG = {
    scroll: URUURU_SCROLL_IMG,
    exclaim: URUURU_EXCLAIM_IMG,
    question: URUURU_QUESTION_IMG,
    joywave: URUURU_JOYWAVE_IMG,
    heartpose: URUURU_HEARTPOSE_IMG,
    smileypose: URUURU_SMILEYPOSE_IMG,
    burstpose: URUURU_BURSTPOSE_IMG,
  };
  // 각 리소스마다 캐릭터가 프레임 안에서 차지하는 비율이 달라서, 기본 서있는 캐릭터와
  // 실제 캐릭터 크기가 비슷하게 보이도록 포즈별로 확대 비율을 보정
  const POSE_SCALE = {
    exclaim: 1.0,
    question: 0.6,
    heartpose: 1.4,
    smileypose: 1.32,
    burstpose: 1.35,
  };
  const src = (pose && POSE_IMG[pose]) || URUURU_IMG;
  const scale = pose && POSE_SCALE[pose] ? POSE_SCALE[pose] : 1;
  return (
    <span key={pose || "idle"} className="pose-pop" style={{ display: "block" }}>
      <span className={reactionClass} style={{ display: "block" }}>
        <span style={{ display: "block", transform: `scale(${scale})`, transformOrigin: "bottom center" }}>
          <img
            src={src}
            style={{
              width: size,
              height: "auto",
              display: "block",
            }}
            alt={`${CHARACTER_NAME}가 감정을 듣고 반응하는 모습`}
          />
        </span>
      </span>
    </span>
  );
}

/* ---------- 감정 오브젝트 아이콘 (이야기마다 다른 상징적 형태 - 브리프 8절) ---------- */
const EMOTION_TINT = {
  분노: "#F5C4B3",
  서운함: "#B5D4F4",
  짜증: "#F5C4B3",
  만족: "#C0DD97",
  기쁨: "#F5C4B3",
  허탈함: "#F4C0D1",
  담담함: "#D3D1C7",
  편안함: "#9FE1CB",
  불안: "#CECBF6",
  슬픔: "#B5D4F4",
  지침: "#D3D1C7",
  뿌듯: "#FAC775",
  설레: "#F4C0D1",
  안심: "#9FE1CB",
  홀가분: "#9FE1CB",
};

function lightenHex(hex, amt = 45) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.min(255, r);
  g = Math.min(255, g);
  b = Math.min(255, b);
  return `rgb(${r},${g},${b})`;
}
function darkenHex(hex, amt = 35) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) - amt;
  let g = ((num >> 8) & 0xff) - amt;
  let b = (num & 0xff) - amt;
  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);
  return `rgb(${r},${g},${b})`;
}

function ObjectIcon({ type, size = 60, emotion }) {
  const uid = useId();
  const icons = {
    diary: (
      <>
        <path d="M18 14 L46 14 L46 50 L18 50 Z" fill={COLORS.navy} />
        <path d="M18 14 L22 14 L22 50 L18 50 Z" fill={COLORS.navyDark} />
        <path d="M20 16 L44 16 L44 48 L20 48 Z" fill="#2C5580" opacity="0.4" />
        <path d="M27 14 L27 42 L31 38 L35 42 L35 14 Z" fill="#D85A30" />
        <path d="M27 14 L29 14 L29 38 L27 39 Z" fill="#B0431F" opacity="0.6" />
        <path d="M26 24 L40 24 M26 30 L40 30" stroke="#4A6D96" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      </>
    ),
    letter: (
      <>
        <path d="M18 20 L46 20 L46 44 L18 44 Z" fill="#FFFFFF" stroke="#85B7EB" strokeWidth="1.5" />
        <path d="M18 20 L32 32 L46 20" fill="none" stroke="#378ADD" strokeWidth="1.5" />
        <path d="M18 44 L28 34 M46 44 L36 34" stroke="#85B7EB" strokeWidth="1" opacity="0.6" />
      </>
    ),
    plate: (
      <>
        <ellipse cx="32" cy="38" rx="17" ry="7.5" fill="#F1EFE8" />
        <ellipse cx="32" cy="36" rx="17" ry="7.5" fill="#FFFFFF" stroke={COLORS.amber} strokeWidth="1.5" />
        <ellipse cx="32" cy="34" rx="9" ry="4" fill="#FAC775" opacity="0.7" />
        <ellipse cx="27" cy="32" rx="2.5" ry="1.3" fill="#FFFFFF" opacity="0.8" />
      </>
    ),
    medal: (
      <>
        <path d="M26 14 L38 14 L34 30 L30 30 Z" fill="#D4537E" opacity="0.6" />
        <path d="M27 14 L31 14 L28 28 L26 27 Z" fill="#B03A63" opacity="0.5" />
        <circle cx="32" cy="38" r="13" fill="#F4C0D1" stroke="#D4537E" strokeWidth="1.5" />
        <circle cx="32" cy="38" r="6" fill="#FBEAF0" stroke="#D4537E" strokeWidth="1" />
        <circle cx="28" cy="34" r="2" fill="#FFFFFF" opacity="0.7" />
      </>
    ),
    boat: (
      <>
        <path d="M16 38 L48 38 L41 49 L23 49 Z" fill="#D8A34E" />
        <path d="M16 38 L48 38 L46 42 L18 42 Z" fill="#B5793E" opacity="0.6" />
        <path d="M32 12 L32 38" stroke="#8B8578" strokeWidth="1.5" />
        <path d="M32 14 L45 35 L32 35 Z" fill="#E6F1FB" stroke="#85B7EB" strokeWidth="1" />
        <path d="M32 14 L32 35" stroke="#85B7EB" strokeWidth="0.8" opacity="0.6" />
      </>
    ),
    lantern: (
      <>
        <rect x="23" y="17" width="18" height="27" rx="4" fill="#FAC775" stroke="#EF9F27" strokeWidth="1.5" />
        <rect x="23" y="17" width="7" height="27" rx="3" fill="#FFDCA0" opacity="0.6" />
        <path d="M27 17 L27 10 M37 17 L37 10 M25 10 L39 10" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M27 44 L27 50 M37 44 L37 50" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="29" r="5" fill="#FFF8E8" />
        <circle cx="32" cy="29" r="8" fill="#FFF8E8" opacity="0.3" />
      </>
    ),
    seed: (
      <>
        <path d="M32 47 C32 47 20 38 20 26 C20 18 26 13 32 13 C38 13 44 18 44 26 C44 38 32 47 32 47 Z" fill="#97C459" />
        <path
          d="M32 47 C32 47 24 41 24 32 C24 27 28 24 32 24 C36 24 40 27 40 32 C40 41 32 47 32 47 Z"
          fill="#639922"
          opacity="0.5"
        />
        <path d="M32 47 L32 22" stroke="#3B6D11" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    umbrella: (
      <>
        <path d="M14 30 C14 18 22 12 32 12 C42 12 50 18 50 30 Z" fill="#7F77DD" />
        <path d="M14 30 C14 18 22 12 32 12 L32 30 Z" fill="#534AB7" opacity="0.4" />
        <path d="M32 30 L32 48 C32 51 29 52 27 50" stroke="#3C3489" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M20 27 L32 22 L44 27" stroke="#3C3489" strokeWidth="1" fill="none" opacity="0.4" />
      </>
    ),
    key: (
      <>
        <circle cx="22" cy="24" r="9" fill="none" stroke="#888780" strokeWidth="3.5" />
        <circle cx="22" cy="24" r="9" fill="none" stroke="#B4B2A9" strokeWidth="1.5" />
        <path d="M29 31 L46 48 M40 42 L46 36 M46 48 L51 43" stroke="#888780" strokeWidth="3.5" strokeLinecap="round" />
      </>
    ),
    compass: (
      <>
        <circle cx="32" cy="32" r="18" fill="#FFFFFF" stroke="#888780" strokeWidth="2" />
        <circle cx="32" cy="32" r="14" fill="none" stroke="#D3D1C7" strokeWidth="1" />
        <path d="M32 20 L37 32 L32 44 L27 32 Z" fill="#F0997B" />
        <path d="M32 20 L37 32 L32 32 Z" fill="#D85A30" opacity="0.6" />
      </>
    ),
    candle: (
      <>
        <rect x="26" y="24" width="12" height="24" rx="2" fill="#FAC775" />
        <rect x="26" y="24" width="4" height="24" rx="2" fill="#FFDCA0" opacity="0.7" />
        <path d="M32 24 L32 15" stroke="#8B8578" strokeWidth="1.5" />
        <path d="M32 15 C28 10 32 5 32 5 C32 5 36 10 32 15 Z" fill="#EF9F27" />
        <path d="M32 15 C30 11 32 8 32 8 C32 8 34 11 32 15 Z" fill="#FFF8E8" opacity="0.8" />
      </>
    ),
    bell: (
      <>
        <path d="M32 14 C24 14 20 21 20 30 L20 39 L44 39 L44 30 C44 21 40 14 32 14 Z" fill="#F5C4B3" stroke="#D85A30" strokeWidth="1.5" />
        <path d="M32 14 C27 14 24 19 23 26 L23 37 L28 37 L28 20 C28 17 30 15 32 14 Z" fill="#FFFFFF" opacity="0.4" />
        <circle cx="32" cy="45" r="3.5" fill="#D85A30" />
      </>
    ),
    balloon: (
      <>
        <ellipse cx="32" cy="27" rx="14" ry="17" fill="#F0997B" stroke="#D85A30" strokeWidth="1.2" />
        <ellipse cx="27" cy="20" rx="4" ry="5.5" fill="#FFFFFF" opacity="0.55" />
        <path d="M32 44 L32 50" stroke="#8B8578" strokeWidth="1.5" />
        <path d="M28 50 L36 50 L32 55 Z" fill="#D85A30" />
      </>
    ),
    hourglass: (
      <>
        <path
          d="M22 14 L42 14 L42 18 L32 32 L42 46 L42 50 L22 50 L22 46 L32 32 L22 18 Z"
          fill="#D3D1C7"
          stroke="#888780"
          strokeWidth="1.5"
        />
        <path d="M26 18 L38 18 L32 28 Z" fill="#FAC775" opacity="0.75" />
        <path d="M26 46 L38 46 L32 36 Z" fill="#FAC775" opacity="0.75" />
      </>
    ),
    gift: (
      <>
        <rect x="16" y="26" width="32" height="24" rx="2" fill="#D4537E" stroke="#B03A63" strokeWidth="1" />
        <rect x="16" y="26" width="32" height="7" fill="#B03A63" opacity="0.5" />
        <rect x="29" y="18" width="6" height="32" fill="#FBEAF0" />
        <path d="M32 18 C28 12 20 14 22 20 C24 24 32 22 32 18 Z" fill="#F4C0D1" />
        <path d="M32 18 C36 12 44 14 42 20 C40 24 32 22 32 18 Z" fill="#F4C0D1" />
      </>
    ),
    mushroom: (
      <>
        <path d="M18 28 C18 16 46 16 46 28 C46 30 44 31 32 31 C20 31 18 30 18 28 Z" fill="#D85A30" stroke="#B0431F" strokeWidth="1" />
        <circle cx="26" cy="22" r="2" fill="#FBEAF0" opacity="0.85" />
        <circle cx="38" cy="20" r="1.6" fill="#FBEAF0" opacity="0.85" />
        <rect x="26" y="31" width="12" height="18" rx="4" fill="#FFF8E8" stroke="#D3D1C7" strokeWidth="1" />
      </>
    ),
    trophy: (
      <>
        <path d="M22 16 L42 16 L40 30 C40 36 36 40 32 40 C28 40 24 36 24 30 Z" fill={`url(#gold-${uid})`} stroke="#B8720F" strokeWidth="1.2" />
        <path d="M22 16 L15 16 C15 23 19 26 24 26" fill="none" stroke="#B8720F" strokeWidth="2.2" />
        <path d="M42 16 L49 16 C49 23 45 26 40 26" fill="none" stroke="#B8720F" strokeWidth="2.2" />
        <rect x="29" y="40" width="6" height="6" fill={`url(#gold-${uid})`} />
        <rect x="23" y="46" width="18" height="4" rx="2" fill="#B8720F" />
        <path d="M27 21 L30 26" stroke="#FFF8E8" strokeWidth="1.4" opacity="0.7" strokeLinecap="round" />
      </>
    ),
    coin: (
      <>
        <circle cx="32" cy="32" r="17" fill={`url(#gold-${uid})`} stroke="#B8720F" strokeWidth="2" />
        <circle cx="32" cy="32" r="12" fill="none" stroke="#FFF8E8" strokeWidth="1.5" opacity="0.7" />
        <path d="M32 24 L34.5 30 L41 30 L35.7 34 L37.8 40 L32 36.3 L26.2 40 L28.3 34 L23 30 L29.5 30 Z" fill="#FFF8E8" opacity="0.85" />
      </>
    ),
    potion: (
      <>
        <rect x="27" y="9" width="10" height="6" rx="1.5" fill="#888780" />
        <path d="M28 15 L36 15 L36 23 L42 35 C44 40 39 46 32 46 C25 46 20 40 22 35 L28 23 Z" fill={`url(#mint-${uid})`} stroke="#1F7A5E" strokeWidth="1.2" />
        <path d="M23 36 C25 41 39 41 41 36 L42 38 C43 42 39 47 32 47 C25 47 21 42 22 38 Z" fill="#2E8A69" opacity="0.6" />
        <circle cx="27" cy="20" r="1.3" fill="#FFFFFF" opacity="0.8" />
      </>
    ),
    cake: (
      <>
        <path d="M18 46 L46 46 L38 22 L26 22 Z" fill={`url(#pink-${uid})`} stroke="#B23A63" strokeWidth="1" />
        <path d="M26 22 L38 22 L36 15 L28 15 Z" fill="#FFFFFF" stroke="#D3D1C7" strokeWidth="0.8" />
        <circle cx="32" cy="12" r="2.4" fill="#F27FA0" />
        <path d="M18 46 L46 46 L46 50 L18 50 Z" fill="#B23A63" opacity="0.55" />
        <path d="M23 46 L29 30 M32 46 L32 28 M41 46 L35 30" stroke="#FBEAF0" strokeWidth="1" opacity="0.7" />
      </>
    ),
    dice: (
      <>
        <rect x="17" y="17" width="30" height="30" rx="7" fill="#FFFFFF" stroke="#888780" strokeWidth="1.5" />
        <circle cx="25" cy="25" r="2.3" fill="#3C3489" />
        <circle cx="39" cy="25" r="2.3" fill="#3C3489" />
        <circle cx="32" cy="32" r="2.3" fill="#D85A30" />
        <circle cx="25" cy="39" r="2.3" fill="#3C3489" />
        <circle cx="39" cy="39" r="2.3" fill="#3C3489" />
      </>
    ),
    wand: (
      <>
        <path d="M18 46 L36 28" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 12 L42.8 18.7 L49.5 21.5 L42.8 24.3 L40 31 L37.2 24.3 L30.5 21.5 L37.2 18.7 Z" fill={`url(#gold-${uid})`} stroke="#B8720F" strokeWidth="1" />
        <circle cx="22" cy="42" r="1.6" fill="#FFF8E8" />
        <circle cx="45" cy="14" r="1.3" fill="#FFF8E8" />
      </>
    ),
    crown: (
      <>
        <path d="M15 42 L19 20 L28 31 L32 15 L36 31 L45 20 L49 42 Z" fill={`url(#gold-${uid})`} stroke="#B8720F" strokeWidth="1.3" />
        <rect x="15" y="42" width="34" height="7" rx="2" fill="#B8720F" />
        <circle cx="32" cy="24" r="2.2" fill="#F27FA0" />
        <circle cx="20" cy="30" r="1.5" fill="#F27FA0" />
        <circle cx="44" cy="30" r="1.5" fill="#F27FA0" />
      </>
    ),
    donut: (
      <>
        <circle cx="32" cy="32" r="18" fill="#F4C0D1" stroke="#D4537E" strokeWidth="1.3" />
        <circle cx="32" cy="32" r="6.5" fill="#FBEAF0" />
        <circle cx="25" cy="24" r="1.4" fill="#FFFFFF" />
        <circle cx="40" cy="23" r="1.4" fill="#85B7EB" />
        <circle cx="22" cy="37" r="1.4" fill="#FAC775" />
        <circle cx="42" cy="38" r="1.4" fill="#9FE1CB" />
        <circle cx="34" cy="44" r="1.4" fill="#F27FA0" />
      </>
    ),
    chest: (
      <>
        <rect x="14" y="30" width="36" height="20" rx="3" fill={`url(#gold-${uid})`} stroke="#8B5A12" strokeWidth="1.3" />
        <path d="M14 30 C14 20 50 20 50 30 Z" fill="#B0431F" stroke="#7A2C13" strokeWidth="1.3" />
        <path d="M18 30 C18 23 46 23 46 30 Z" fill="#D85A30" opacity="0.6" />
        <rect x="28" y="30" width="8" height="10" rx="2" fill="#8B5A12" />
        <circle cx="32" cy="35" r="1.6" fill="#FFE9A8" />
        <path d="M14 38 L50 38" stroke="#8B5A12" strokeWidth="1.5" opacity="0.5" />
      </>
    ),
    scroll: (
      <>
        <ellipse cx="16" cy="32" rx="4" ry="14" fill="#F5E9C8" stroke="#C9A227" strokeWidth="1.3" />
        <ellipse cx="48" cy="32" rx="4" ry="14" fill="#F5E9C8" stroke="#C9A227" strokeWidth="1.3" />
        <rect x="16" y="18" width="32" height="28" fill="#FBF3D9" stroke="#C9A227" strokeWidth="1" />
        <path d="M22 26 L42 26 M22 32 L42 32 M22 38 L34 38" stroke="#C9A227" strokeWidth="1.4" opacity="0.6" strokeLinecap="round" />
      </>
    ),
    book: (
      <>
        <rect x="16" y="11" width="32" height="41" rx="2.5" fill={`url(#purple-${uid})`} stroke="#3D3480" strokeWidth="1.3" />
        <rect x="16" y="11" width="7" height="41" rx="1" fill="#3D3480" opacity="0.5" />
        <rect x="27" y="20" width="15" height="3" rx="1.5" fill="#FFF8E8" opacity="0.85" />
        <rect x="27" y="27" width="15" height="3" rx="1.5" fill="#FFF8E8" opacity="0.6" />
        <rect x="27" y="34" width="10" height="3" rx="1.5" fill="#FFF8E8" opacity="0.5" />
      </>
    ),
    map: (
      <>
        <path d="M14 15 L26 11 L38 15 L50 11 L50 47 L38 51 L26 47 L14 51 Z" fill="#F5E9C8" stroke="#C9A227" strokeWidth="1.3" />
        <path d="M26 11 L26 47 M38 15 L38 51" stroke="#C9A227" strokeWidth="1" opacity="0.5" />
        <path d="M19 40 Q26 29 33 34 Q40 39 45 24" stroke="#D85A30" strokeWidth="1.7" fill="none" strokeDasharray="3 2.5" strokeLinecap="round" />
        <circle cx="45" cy="24" r="2.2" fill="#D85A30" />
      </>
    ),
    anchor: (
      <>
        <circle cx="32" cy="15" r="4.2" fill="none" stroke="#8B8785" strokeWidth="2.6" />
        <path d="M32 19 L32 45" stroke="#8B8785" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M20 27 L44 27" stroke="#8B8785" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M32 45 C19 45 15 36 17 29 M32 45 C45 45 49 36 47 29" stroke="#8B8785" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      </>
    ),
    boots: (
      <>
        <path
          d="M23 13 L33 13 L33 33 L43 39 C47 41.5 47 48 42 48 L18 48 L18 19 C18 15.5 20 13 23 13 Z"
          fill="#8B5E3C"
          stroke="#5C3D24"
          strokeWidth="1.3"
        />
        <rect x="23" y="17" width="7" height="4" fill="#5C3D24" opacity="0.5" />
        <path d="M18 43 L42 43" stroke="#5C3D24" strokeWidth="1.3" opacity="0.6" />
      </>
    ),
  };

  const tint = emotion ? EMOTION_TINT[emotion] : "#EDEAE0";
  const glowId = `glow-${uid}`;
  const frameId = `frame-${uid}`;
  const shadowId = `shadow-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="감정 오브젝트">
      <defs>
        <radialGradient id={glowId} cx="42%" cy="32%" r="75%">
          <stop offset="0%" stopColor={lightenHex(tint, 55)} />
          <stop offset="55%" stopColor={tint} />
          <stop offset="100%" stopColor={darkenHex(tint, 20)} />
        </radialGradient>
        <linearGradient id={frameId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor={lightenHex(tint, 25)} />
          <stop offset="100%" stopColor={darkenHex(tint, 30)} />
        </linearGradient>
        <filter id={shadowId} x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.5" />
        </filter>
        <linearGradient id={`gold-${uid}`} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFFBEA" />
          <stop offset="18%" stopColor="#FFE9A8" />
          <stop offset="48%" stopColor="#FAC775" />
          <stop offset="78%" stopColor="#D8912B" />
          <stop offset="100%" stopColor="#8B5A12" />
        </linearGradient>
        <linearGradient id={`purple-${uid}`} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#EFECFF" />
          <stop offset="20%" stopColor="#B3AAFF" />
          <stop offset="50%" stopColor="#7F77DD" />
          <stop offset="80%" stopColor="#4B3FB0" />
          <stop offset="100%" stopColor="#2E2570" />
        </linearGradient>
        <linearGradient id={`mint-${uid}`} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F3FFFB" />
          <stop offset="20%" stopColor="#C9F5E6" />
          <stop offset="50%" stopColor="#9FE1CB" />
          <stop offset="80%" stopColor="#3FA982" />
          <stop offset="100%" stopColor="#1F6B4F" />
        </linearGradient>
        <linearGradient id={`pink-${uid}`} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFF0F5" />
          <stop offset="20%" stopColor="#FAD3E3" />
          <stop offset="50%" stopColor="#F4C0D1" />
          <stop offset="80%" stopColor="#D4537E" />
          <stop offset="100%" stopColor="#8F2E4D" />
        </linearGradient>
        <radialGradient id={`gloss-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {/* 바닥 그림자 (아이템이 살짝 떠 있는 느낌) */}
      <ellipse cx="32" cy="60" rx="22" ry="3.5" fill="rgba(0,0,0,0.18)" />

      {/* 금속/젤리 느낌의 두꺼운 테두리 프레임 */}
      <rect x="1.5" y="2" width="61" height="57" rx="23" fill="rgba(0,0,0,0.22)" />
      <rect x="1.5" y="0.5" width="61" height="57" rx="23" fill={`url(#${frameId})`} />

      {/* 안쪽 유리알 같은 방사형 그라데이션 배경 */}
      <rect x="5" y="4" width="54" height="49" rx="19" fill={`url(#${glowId})`} />

      {/* 반짝이는 별 장식 (게임 아이템 느낌) */}
      <g opacity="0.75" fill="#FFFFFF">
        <path d="M12 13 L13.4 16.2 L16.6 17.6 L13.4 19 L12 22.2 L10.6 19 L7.4 17.6 L10.6 16.2 Z" opacity="0.85" />
        <circle cx="53" cy="14" r="1.6" />
        <circle cx="50" cy="42" r="1.2" opacity="0.6" />
      </g>

      {/* 위쪽 유리 하이라이트 */}
      <path d="M8 8 Q32 -3 56 8 L56 18 Q32 9 8 18 Z" fill="#FFFFFF" opacity="0.5" />

      {/* 아이콘 본체 (입체감을 위한 드롭섀도우 적용) */}
      <g filter={`url(#${shadowId})`}>{icons[type] || icons.diary}</g>

      {/* 아이콘 바로 밑 접지 그림자 (블렌더 렌더링처럼 바닥에 닿은 음영) */}
      <ellipse cx="32" cy="47" rx="15" ry="4" fill="black" opacity="0.22" filter={`url(#blur-${uid})`} />

      {/* 아래쪽 안쪽 그림자로 바닥에 닿은 듯한 깊이감 */}
      <rect x="5" y="42" width="54" height="11" rx="8" fill="black" opacity="0.14" />

      {/* 유리알 스페큘러 하이라이트 (광원이 위에서 비치는 느낌) */}
      <ellipse cx="21" cy="16" rx="11" ry="7" fill={`url(#gloss-${uid})`} transform="rotate(-18 21 16)" />
      <ellipse cx="18" cy="12" rx="3.2" ry="2" fill="#FFFFFF" opacity="0.9" transform="rotate(-18 18 12)" />

      {/* 테두리 광택 라인 */}
      <rect x="1.5" y="0.5" width="61" height="57" rx="23" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
    </svg>
  );
}

/* ---------- 감정 태그 색상 ---------- */
const EMOTION_STYLE = {
  분노: { bg: "#FAECE7", text: "#712B13" },
  서운함: { bg: "#E6F1FB", text: "#0C447C" },
  짜증: { bg: "#FAECE7", text: "#712B13" },
  만족: { bg: "#EAF3DE", text: "#27500A" },
  기쁨: { bg: "#FAECE7", text: "#712B13" },
  허탈함: { bg: "#FBEAF0", text: "#72243E" },
  담담함: { bg: "#F1EFE8", text: "#444441" },
  편안함: { bg: "#E1F5EE", text: "#085041" },
  불안: { bg: "#EEEDFE", text: "#3C3489" },
  슬픔: { bg: "#E6F1FB", text: "#042C53" },
  지침: { bg: "#F1EFE8", text: "#444441" },
  뿌듯: { bg: "#FEF3E0", text: "#8A5A0A" },
  설레: { bg: "#FBEAF0", text: "#72243E" },
  안심: { bg: "#E1F5EE", text: "#085041" },
  홀가분: { bg: "#E1F5EE", text: "#085041" },
};
function EmotionTag({ label }) {
  const s = EMOTION_STYLE[label] || { bg: "#F1EFE8", text: "#444441" };
  return (
    <span
      style={{
        fontSize: 10,
        background: s.bg,
        color: s.text,
        padding: "2px 9px",
        borderRadius: 999,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

/* ---------- 샘플 데이터 (브리프 14절: 실제 API 연결 전, 정해진 샘플로 흐름 검증) ---------- */
const POSITIVE_WORDS = [
  "좋", "행복", "맛있", "신나", "기쁘", "재밌", "재미", "편안", "고맙", "웃",
  "다행", "뿌듯", "감사", "설레", "최고", "짱", "만족", "안심", "홀가분",
  "대박", "꿀잼", "개꿀", "레전드", "굿", "쩐다", "개이득", "핵맛",
];
const NEGATIVE_WORDS = [
  "화나", "짜증", "속상", "열받", "슬프", "힘들", "서운", "우울", "지치", "답답",
  "억울", "불안", "걱정", "무섭", "외로", "허탈", "지겨", "싫", "미치겠", "눈물",
  "빡친", "빡세", "노잼", "노답", "극혐", "꼬였", "망했", "존나 힘들", "개짜증",
  "씨발", "시발", "좆같", "개같", "존나 짜증",
];
/* 명시적 감정 단어가 없어도 문맥으로 자주 쓰이는 신호 (이모티콘/자모/문장부호/초성) */
const POSITIVE_SIGNALS = ["ㅋㅋ", "ㅎㅎ", "!!", "^^", "♡", "❤", "ㅇㅈ", "ㄱㅅ", "ㄳ"];
const NEGATIVE_SIGNALS = ["ㅠㅠ", "ㅜㅜ", "...", "…", "휴", "하…", "하아", "ㅗㅜㅑ"];

/* 인사말 / 짧은 리액션(초성, 줄임말) 감지 - 본격적인 이야기가 아니라 가벼운 반응은 별도로 처리 */
const GREETING_WORDS = ["안녕", "하이", "ㅎㅇ", "헬로", "hello", "hi", "반가워", "방가", "왔어", "있어?"];
function isGreeting(text) {
  const t = text.trim();
  const stripped = t.replace(/[!?.~ㅎㅋㅠㅜ\s]/g, "");
  return stripped.length > 0 && stripped.length <= 8 && GREETING_WORDS.some((w) => stripped.includes(w.replace(/[!?.~\s]/g, "")));
}
const GREETING_REPLIES = [
  "안녕!! 오늘 하루 어땠어?",
  "왔구나아, 반가워!! 오늘은 뭐 하고 지냈어?",
  "안녕 안녕!! 오늘 기분은 좀 어때?",
];

/* 초성/줄임말 등 짧은 리액션 - 이야기가 아니라 대화 중 추임새 */
const CASUAL_REPLIES = {
  "ㅇㅇ": ["오 그렇구나!!", "응응, 계속 말해줘!!", "그래그래, 듣고 있어!"],
  "ㄴㄴ": ["아 그건 아니었구나!", "그래? 아니었어?!"],
  "ㅇㅈ": ["그치그치, 인정이지!!", "완전 인정!!"],
  "ㄱㅅ": ["뭘, 나도 고마워!!", "고맙긴, 언제든 말해!"],
  "ㄳ": ["뭘, 나도 고마워!"],
  "ㅅㄱ": ["오늘도 수고했어!!", "너도 수고 많았어 진짜!"],
  "ㅇㅋ": ["오케이!!", "좋아좋아!!"],
  "ㅂㅂ": ["안녕, 다음에 또 얘기하자!!", "잘 가, 또 얘기하자!!"],
  "ㅋㅋㅋ": ["왜 웃음이 나와?ㅋㅋ 궁금하다", "뭔데 그렇게 웃겨ㅋㅋㅋ 나도 궁금해"],
  "ㅎㅎㅎ": ["기분 좋아 보인다!!", "무슨 좋은 일이야?? 궁금해"],
  "ㅠㅠ": ["왜 그래ㅠㅠ 무슨 일이야?", "괜찮아?ㅠㅠ 무슨 일 있었어?"],
  "ㅜㅜ": ["왜 그래ㅠㅠ 무슨 일이야?", "괜찮아?ㅜㅜ"],
  "몰라": ["모를 수도 있지, 괜찮아!", "그런 날도 있지 뭐."],
  "그냥": ["그냥이라도 괜찮아. 편하게 있어!"],
};
function detectCasual(text) {
  const stripped = text.trim();
  if (stripped.length > 6) return null;
  for (const key of Object.keys(CASUAL_REPLIES)) {
    if (stripped === key || stripped.replace(/[!?.~\s]/g, "") === key) return key;
  }
  return null;
}

function detectSentiment(text) {
  const positiveScore =
    POSITIVE_WORDS.filter((w) => text.includes(w)).length +
    POSITIVE_SIGNALS.filter((w) => text.includes(w)).length;
  const negativeScore =
    NEGATIVE_WORDS.filter((w) => text.includes(w)).length +
    NEGATIVE_SIGNALS.filter((w) => text.includes(w)).length;
  if (positiveScore === 0 && negativeScore === 0) return "neutral";
  return positiveScore >= negativeScore ? "positive" : "negative";
}

/* 대화 주제 감지 (간단한 키워드 매칭 - 실제 AI 연결 전 임시 로직) */
const TOPIC_KEYWORDS = {
  work: ["회사", "팀장", "업무", "야근", "상사", "일이", "직장", "프로젝트"],
  friend: ["친구", "연락", "카톡", "약속", "sns", "SNS"],
  family: ["엄마", "아빠", "가족", "부모님", "형", "언니", "동생"],
  food: ["밥", "먹", "음식", "맛", "요리", "카페"],
  study: ["공부", "시험", "과제", "학교", "수업"],
  health: ["잠", "피곤", "아프", "몸살", "컨디션"],
};
function detectTopic(text) {
  for (const [topic, words] of Object.entries(TOPIC_KEYWORDS)) {
    if (words.some((w) => text.includes(w))) return topic;
  }
  return null;
}

const CHAR_OPENING = "오늘은 무슨 일이 있었어?";

/* 화면 너비에 따른 줄바꿈은 CSS word-break: keep-all이 처리(단어 중간 끊김 방지).
   그와 별개로 두 가지를 추가로 강제한다:
   1) 문자열에 수동으로 넣어둔 \n은 그대로 줄바꿈으로 렌더링 (긴 한 문장이라
      마침표가 끝에 한 번뿐이어서 자동으로 나눌 곳이 없을 때, 의미 단위로
      직접 끊어줄 수 있게 함 - 온보딩 문구 등).
   2) \n으로 나뉜 각 구간 안에서도 문장 종결부호(. ! ?) 뒤에서는 새 줄로 넘어가게 해서
      여러 문장이 한 줄에 뭉쳐 보이지 않고 문장 단위로 읽히게 한다 (대화 말풍선 등). */
function renderBySentence(text) {
  if (!text) return text;
  const lines = text
    .split("\n")
    .flatMap((line) => {
      const sentences = (line.match(/[^.!?]+[.!?]*\s*/g) || [line])
        .map((s) => s.trim())
        .filter(Boolean);
      return sentences.length > 0 ? sentences : [line];
    });
  if (lines.length <= 1) return text;
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ));
}

/* CJK 기본 줄바꿈은 글자 사이 아무 데서나 끊기 때문에("입니다" -> "입니" + "다")
   단어(어절) 중간에서 끊기지 않도록 강제한다. 너무 긴 단일 토큰(URL 등)에 대비해
   overflowWrap도 함께 둔다. */
const KEEP_WORDS_STYLE = { wordBreak: "keep-all", overflowWrap: "break-word" };

const FOLLOWUP_POOL = {
  positive: {
    work: ["헐 대박, 일에서 좋은 일이 있었구나!! 뭐였어?", "오오 회사에서 그런 일이 있으면 하루가 다르지!! 더 말해줄래?", "와 일하다가 그런 순간 만나면 진짜 반갑지!!"],
    friend: ["오 친구랑 좋은 시간 보냈나 보다!! 뭐 했어?", "그 얘기 좀 더 해줘, 완전 궁금하다!!", "누구랑 있었길래 그렇게 좋았어?ㅎㅎ"],
    food: ["오오 맛있는 거 먹었구나!! 뭐 먹었어?", "먹는 얘기 완전 좋다!! 나도 그거 먹으면 하루가 확 풀리더라", "그거 어디서 먹었어?? 나도 궁금하다!!"],
    family: ["가족이랑 좋은 시간 보냈구나!! 뭐 했어?", "그런 날은 마음이 든든하지!! 나도 그런 날 있으면 기분이 오래 가더라."],
    study: ["오 공부하다가 좋은 일이 있었나 보네!! 뭐였어?", "그거 잘 풀렸나 보다, 뭐였는지 말해줄래?!"],
    default: [
      "헐 대박!! 좋은 일이었나 보다. 더 얘기해줄래?",
      "오오 듣기만 해도 나까지 기분 좋아지네!! 무슨 일이었어?",
      "오 뭔데뭔데!! 완전 궁금하다.",
      "진짜?! 완전 좋은 일이네, 자세히 말해줘!!",
    ],
  },
  negative: {
    work: ["헐 회사에서 힘든 일 있었구나ㅠㅠ 무슨 일이었는지 말해줄래?", "일 때문에 지쳤겠다ㅠㅠ 나도 그런 적 있어서 알아. 어떤 일이었어?", "아 그런 날은 유독 힘 빠지지... 무슨 일이었어?"],
    friend: ["친구 때문에 마음이 상했구나ㅠㅠ 무슨 일이었어?", "그런 거면 서운할 만하다!! 더 얘기해줄래?", "친구랑 그런 일 있으면 마음이 복잡하지... 나도 겪어봤어."],
    family: ["가족 얘기구나. 무슨 일 있었어?", "그런 거면 마음이 복잡했겠다ㅠㅠ", "가족 일은 유독 마음이 더 쓰이지, 나도 그래."],
    study: ["공부 때문에 힘들었나 보다ㅠㅠ 무슨 일이었어?", "그거 스트레스 꽤 됐겠다... 나도 시험 앞두면 그러거든."],
    health: ["몸이 안 좋았구나ㅠㅠ 괜찮아?", "컨디션 안 좋으면 마음도 같이 처지지... 무리하지 마."],
    default: [
      "헐 그랬구나ㅠㅠ 무슨 일 때문에 그랬어?",
      "속상했겠다ㅠㅠ 무슨 일이었는지 말해줄래?",
      "헐, 무슨 일인데?? 말해봐!!",
      "아 진짜?! 무슨 일이었는지 말해줘.",
    ],
  },
  neutral: {
    default: ["오 그랬구나, 조금 더 얘기해줄래?", "음, 어떤 하루였는지 더 들려줄래?", "그래서 오늘 하루는 어땠어?"],
  },
};

const DEEPER_POOL = {
  positive: {
    work: [
      "그런 순간이 있으면 그 하루가 통째로 괜찮아지지!! 나도 딱 그런 적 있었어.",
      "그거 듣고 나니까 나까지 기분이 좋아진다!!",
      "일하다가 그런 거 만나면 진짜 오래 기억에 남지, 완전 공감돼.",
    ],
    friend: [
      "그런 사람이 곁에 있다는 게 참 좋은 일이야!! 나도 그런 친구 있는데 진짜 소중해.",
      "그 순간을 같이 나눌 사람이 있어서 다행이다!!",
      "그런 관계는 진짜 소중한 것 같아, 나도 그런 관계 있으면 하루가 다르더라.",
    ],
    default: [
      "작은 일이어도 그게 크게 느껴질 때가 있지!! 나도 그래.",
      "그런 기분, 오래 남았으면 좋겠다!!",
      "그 얘기 들으니까 나까지 기분이 좋아지네ㅎㅎ",
      "그런 하루는 자주 있었으면 좋겠다!! 나도 응원할게.",
    ],
  },
  negative: {
    work: [
      "애쓴 만큼 알아주지 않을 때 제일 힘든 것 같아ㅠㅠ 나도 그런 적 있어서 그 마음 알아.",
      "그 상황이면 누구라도 지쳤을 거야... 진짜 고생했다.",
      "일이 사람을 이렇게 지치게 할 때가 있지, 나도 겪어봐서 알아ㅠㅠ",
    ],
    friend: [
      "기대했던 만큼 서운함도 컸겠다ㅠㅠ",
      "그런 건 시간이 지나도 마음에 남지... 나도 그런 적 있어.",
      "사람 관계에서 오는 서운함은 유독 오래가지, 완전 공감돼.",
    ],
    default: [
      "그런 날은 스스로를 좀 더 다독여줘도 돼!!",
      "혼자 삭이지 않고 얘기해줘서 다행이야ㅠㅠ",
      "그 마음이 완전 이해가 된다... 나도 그런 적 있어.",
      "그런 하루를 견뎌낸 것만으로도 진짜 잘한 거야!!",
      "아 진짜 짜증났겠다ㅠㅠ",
      "그거 완전 화날 만해!! 나였어도 그랬을 거야.",
    ],
  },
  neutral: {
    default: [
      "별일 없어도 그 나름대로 하루긴 하지!!",
      "무던하게 지나간 것도 나쁘지 않아, 나도 그런 날 좋아해.",
      "그런 잔잔한 하루도 있는 거지ㅎㅎ",
      "특별할 게 없어도 하루하루가 쌓이는 거잖아!!",
      "그래 그런 날도 있어야지!!",
    ],
  },
};

/* 대화가 이어지는 느낌을 주는 연결어 (3턴 이상일 때 문장 앞에 붙음) */
const CONNECTORS = ["그니까 말이야,", "듣다 보니,", "음, 그러고 보니,", "그러게,", "계속 듣다 보니까,"];

const CLOSING_POOL = {
  positive: [
    "듣기만 해도 나까지 기분이 좋아지네!!",
    "그런 순간들이 하루를 버티게 해주는 것 같아ㅎㅎ",
    "이야기 들으니까 나도 덩달아 기분이 좋다!!",
    "오늘 하루, 그 기분으로 잘 마무리했으면 좋겠다!!",
  ],
  negative: [
    "많이 힘들었겠다ㅠㅠ 얘기해줘서 고마워.",
    "그 마음, 나한테 털어놔줘서 다행이야ㅠㅠ",
    "혼자 담아두지 않아서 다행이다!!",
    "오늘은 그 마음 그대로 인정해줘도 돼!!",
  ],
  neutral: [
    "오늘 하루가 그런 느낌이었구나.",
    "특별하지 않아도 하루는 하루니까!!",
    "그런 날도 있는 거지ㅎㅎ",
    "무던한 하루도 나름의 몫을 하는 것 같아!!",
  ],
};

function pickLine(pool, exclude) {
  const options = pool.length > 1 && exclude ? pool.filter((l) => l !== exclude) : pool;
  return options[Math.floor(Math.random() * options.length)];
}
function getFollowup(sentiment, topic) {
  const bucket = FOLLOWUP_POOL[sentiment];
  const lines = (topic && bucket[topic]) || bucket.default;
  return pickLine(lines);
}
function getDeeper(sentiment, topic, exclude) {
  const bucket = DEEPER_POOL[sentiment];
  const lines = (topic && bucket[topic]) || bucket.default;
  return pickLine(lines, exclude);
}
function getClosing(sentiment, exclude) {
  return pickLine(CLOSING_POOL[sentiment], exclude);
}

const RESULT_TEMPLATES = {
  positive: [
    {
      objectType: "plate",
      objectName: "온기 남은 한 입",
      oneLine: "별것 아닌 순간이 하루를 기분 좋게 바꾼 순간",
      primaryEmotion: "만족",
      secondaryEmotion: "기쁨",
      characterLine: "오늘의 좋은 기분, 나도 같이 느껴져서 좋다.",
    },
    {
      objectType: "lantern",
      objectName: "마음의 등불",
      oneLine: "잔잔하게 오래 남을 것 같은 따뜻한 순간",
      primaryEmotion: "기쁨",
      secondaryEmotion: "편안함",
      characterLine: "이런 날은 오래 기억하고 싶다.",
    },
    {
      objectType: "seed",
      objectName: "갓 움튼 새싹",
      oneLine: "작은 일이 마음에 좋은 기운을 심어준 순간",
      primaryEmotion: "기쁨",
      secondaryEmotion: "만족",
      characterLine: "작은 일이 이렇게 크게 느껴질 때가 있지.",
    },
    {
      objectType: "candle",
      objectName: "녹아내린 초",
      oneLine: "마음이 따뜻하게 데워진 순간",
      primaryEmotion: "편안함",
      secondaryEmotion: "만족",
      characterLine: "이런 온도의 하루, 참 좋다.",
    },
  ],
  negative: [
    {
      objectType: "diary",
      objectName: "덮어버린 하루",
      oneLine: "읽히지 않은 노력의 흔적",
      primaryEmotion: "분노",
      secondaryEmotion: "서운함",
      characterLine: "일보다 네 노력이 안 보인 것 같아서 더 화났던 거네.",
    },
    {
      objectType: "medal",
      objectName: "빛바랜 메달",
      oneLine: "노력한 만큼 보이지 못했다고 느낀 순간",
      primaryEmotion: "서운함",
      secondaryEmotion: "허탈함",
      characterLine: "애쓴 걸 나는 알아, 그거면 됐어.",
    },
    {
      objectType: "boat",
      objectName: "흔들리는 종이배",
      oneLine: "마음이 불안하게 흔들렸던 순간",
      primaryEmotion: "짜증",
      secondaryEmotion: "분노",
      characterLine: "그 정도면 화날 만했어.",
    },
    {
      objectType: "bell",
      objectName: "소리를 삼킨 종",
      oneLine: "하고 싶은 말을 삼켰던 순간",
      primaryEmotion: "짜증",
      secondaryEmotion: "서운함",
      characterLine: "말하지 못한 것도 마음에 남는 법이지.",
    },
    {
      objectType: "lantern",
      objectName: "흐릿해진 등불",
      oneLine: "잘 보이지 않아 서운했던 순간",
      primaryEmotion: "서운함",
      secondaryEmotion: "슬픔",
      characterLine: "잘 안 보였다고 해서 없었던 건 아니야.",
    },
  ],
  neutral: [
    {
      objectType: "letter",
      objectName: "잔잔히 접힌 하루",
      oneLine: "특별할 것 없지만 그 자체로 담담했던 순간",
      primaryEmotion: "담담함",
      secondaryEmotion: "편안함",
      characterLine: "이런 잔잔한 하루도 나름의 의미가 있는 것 같아.",
    },
    {
      objectType: "lantern",
      objectName: "은은히 흘러간 하루",
      oneLine: "무겁지도 가볍지도 않게 지나간 순간",
      primaryEmotion: "담담함",
      secondaryEmotion: "지침",
      characterLine: "오늘은 그냥 이런 하루였구나.",
    },
    {
      objectType: "medal",
      objectName: "조용히 얻은 메달",
    },
    {
      objectType: "compass",
      objectName: "길 잃은 나침반",
      oneLine: "방향을 잘 모르겠다고 느낀 순간",
      primaryEmotion: "불안",
      secondaryEmotion: "담담함",
      characterLine: "방향을 못 찾는 날도 있는 거야.",
    },
    {
      objectType: "umbrella",
      objectName: "펴지 못한 우산",
      oneLine: "괜히 마음이 움츠러들었던 순간",
      primaryEmotion: "불안",
      secondaryEmotion: "서운함",
      characterLine: "괜히 움츠러드는 날, 나도 있어.",
    },
    {
      objectType: "key",
      objectName: "녹슨 열쇠",
      oneLine: "뭔가 풀리지 않은 채로 남은 순간",
      primaryEmotion: "허탈함",
      secondaryEmotion: "담담함",
      characterLine: "언젠가는 맞는 문을 찾을 거야.",
    },
  ],
};

const DIARY_CLOSING = {
  positive: "그 순간을 떠올리니 지금도 기분이 좋아진다.",
  negative: "지금 다시 생각해도 그때 감정이 다시 올라온다.",
  neutral: "특별할 것 없었지만 그 나름대로 하루를 채운 순간이었다.",
};

function buildResult(sentiment, storyText) {
  const pool = RESULT_TEMPLATES[sentiment];
  const template = pool[Math.floor(Math.random() * pool.length)];
  const cleanedStory = storyText.trim() || "오늘 있었던 일";
  const diaryText = `${cleanedStory} ${DIARY_CLOSING[sentiment]}`;
  return { ...template, diaryText };
}

const INITIAL_ARCHIVE = [
  {
    id: "a1",
    date: "8월 7일",
    objectType: "diary",
    objectName: "읽히지 않은 투명 편지",
    oneLine: "기다리고 있었지만 나만 중요하지 않은 것처럼 느껴진 순간",
    primaryEmotion: "서운함",
    secondaryEmotion: "짜증",
    diaryText: "친구가 내 연락은 확인도 안 하면서 SNS는 올렸다. 별일 아니라고 생각하려 했는데 계속 마음에 걸렸다.",
    characterLine: "기다리게 한 게 화난 건지, 중요하지 않은 것처럼 느껴져서 서운한 건지 조금 다를 것 같아.",
  },
  {
    id: "a2",
    date: "8월 6일",
    objectType: "letter",
    objectName: "덮어버린 하루",
    oneLine: "읽히지 않은 노력의 흔적",
    primaryEmotion: "분노",
    secondaryEmotion: "서운함",
    diaryText:
      "오늘 팀장이 내가 준비한 자료를 제대로 확인하지 않고 다시 하라고 해서 화가 났다. 일 자체보다 내 노력이 가볍게 취급된 느낌이 더 싫었던 것 같다.",
    characterLine: "일보다 네 노력이 안 보인 것 같아서 더 화났던 거네.",
  },
  {
    id: "a3",
    date: "8월 5일",
    objectType: "plate",
    objectName: "온기 남은 한 입",
    oneLine: "별것 아닌 식사가 하루를 기분 좋게 바꾼 순간",
    primaryEmotion: "만족",
    secondaryEmotion: "기쁨",
    diaryText:
      "오늘 먹은 파스타가 정말 맛있었다. 별거 아닌 한 끼였는데, 그 한입 덕분에 하루가 다 괜찮아진 기분이었다.",
    characterLine: "오늘의 좋은 기분은 맛이 있었네, 다행이다.",
  },
  {
    id: "a4",
    date: "8월 4일",
    objectType: "medal",
    objectName: "빛바랜 메달",
    oneLine: "노력한 만큼 보이지 못했다고 느낀 하루",
    primaryEmotion: "서운함",
    secondaryEmotion: "허탈함",
    diaryText: "내가 열심히 준비했는데 아무도 알아주지 않는 것 같았다. 애쓴 게 티가 안 나서 힘이 빠졌다.",
    characterLine: "애쓴 걸 나는 알아, 그거면 됐어.",
  },
  {
    id: "a5",
    date: "8월 2일",
    objectType: "boat",
    objectName: "흔들리는 종이배",
    oneLine: "마음이 계속 불안하게 흔들렸던 순간",
    primaryEmotion: "짜증",
    secondaryEmotion: "분노",
    diaryText: "일정이 계속 바뀌어서 하루 종일 붕 뜬 기분이었다. 뭘 해도 집중이 안 됐다.",
    characterLine: "그 정도면 화날 만했어.",
  },
  {
    id: "a6",
    date: "7월 31일",
    objectType: "lantern",
    objectName: "마음의 등불",
    oneLine: "잔잔하게 오래 남을 것 같은 따뜻한 순간",
    primaryEmotion: "기쁨",
    secondaryEmotion: "편안함",
    diaryText: "오랜만에 가족이랑 저녁을 같이 먹었다. 별 얘기 안 했는데도 마음이 따뜻해졌다.",
    characterLine: "이런 날은 오래 기억하고 싶다.",
  },
  {
    id: "a7",
    date: "7월 29일",
    objectType: "seed",
    objectName: "갓 움튼 새싹",
    oneLine: "작은 일이 마음에 좋은 기운을 심어준 순간",
    primaryEmotion: "기쁨",
    secondaryEmotion: "만족",
    diaryText: "오늘 처음으로 발표를 했는데 생각보다 잘 끝났다. 작은 성취인데 기분이 오래 갔다.",
    characterLine: "작은 일이 이렇게 크게 느껴질 때가 있지.",
  },
  {
    id: "a8",
    date: "7월 27일",
    objectType: "umbrella",
    objectName: "흘러가는 구름",
    oneLine: "무겁지도 가볍지도 않게 지나간 하루",
    primaryEmotion: "담담함",
    secondaryEmotion: "지침",
    diaryText: "오늘은 딱히 좋지도 나쁘지도 않았다. 그냥저냥 흘러간 하루였다.",
    characterLine: "오늘은 그냥 이런 하루였구나.",
  },
  {
    id: "a9",
    date: "7월 25일",
    objectType: "key",
    objectName: "펴지 못한 우산",
    oneLine: "괜히 마음이 움츠러들었던 순간",
    primaryEmotion: "불안",
    secondaryEmotion: "서운함",
    diaryText: "특별한 이유 없이 하루 종일 마음이 편치 않았다. 그냥 조심스러운 기분이었다.",
    characterLine: "괜히 움츠러드는 날, 나도 있어.",
  },
  {
    id: "a10",
    date: "7월 23일",
    objectType: "compass",
    objectName: "녹슨 열쇠",
    oneLine: "뭔가 풀리지 않은 채로 남은 하루",
    primaryEmotion: "허탈함",
    secondaryEmotion: "담담함",
    diaryText: "며칠째 고민하던 문제가 오늘도 풀리지 않았다. 제자리걸음인 기분이다.",
    characterLine: "언젠가는 맞는 문을 찾을 거야.",
  },
  {
    id: "a11",
    date: "7월 21일",
    objectType: "candle",
    objectName: "내려앉은 깃털",
    oneLine: "무심하게 흘러갔지만 나쁘지 않았던 순간",
    primaryEmotion: "편안함",
    secondaryEmotion: "지침",
    diaryText: "오늘은 별일 없이 무난하게 지나갔다. 가끔은 이런 심심한 하루도 괜찮은 것 같다.",
    characterLine: "가볍게 넘어간 하루도 괜찮아.",
  },
  {
    id: "a12",
    date: "7월 19일",
    objectType: "bell",
    objectName: "길 잃은 나침반",
    oneLine: "방향을 잘 모르겠다고 느낀 순간",
    primaryEmotion: "불안",
    secondaryEmotion: "담담함",
    diaryText: "요즘 뭘 하고 싶은지 잘 모르겠다는 생각이 들었다. 그냥 막막한 기분이었다.",
    characterLine: "방향을 못 찾는 날도 있는 거야.",
  },
  {
    id: "a13",
    date: "7월 17일",
    objectType: "balloon",
    objectName: "녹아내린 초",
    oneLine: "마음이 따뜻하게 데워진 순간",
    primaryEmotion: "편안함",
    secondaryEmotion: "만족",
    diaryText: "혼자 좋아하는 음악을 들으면서 차를 마셨다. 별거 아닌데 마음이 편안해졌다.",
    characterLine: "이런 온도의 하루, 참 좋다.",
  },
  {
    id: "a14",
    date: "7월 15일",
    objectType: "hourglass",
    objectName: "흐릿해진 별",
    oneLine: "잘 보이지 않아 서운했던 순간",
    primaryEmotion: "서운함",
    secondaryEmotion: "슬픔",
    diaryText: "내가 한 노력이 아무한테도 눈에 띄지 않는 것 같았다. 조금 쓸쓸한 기분이 들었다.",
    characterLine: "잘 안 보였다고 해서 없었던 건 아니야.",
  },
  {
    id: "a15",
    date: "7월 13일",
    objectType: "gift",
    objectName: "소리를 삼킨 종",
    oneLine: "하고 싶은 말을 삼켰던 순간",
    primaryEmotion: "짜증",
    secondaryEmotion: "서운함",
    diaryText: "하고 싶은 말이 있었는데 결국 못 했다. 삼킨 말이 계속 마음에 남았다.",
    characterLine: "말하지 못한 것도 마음에 남는 법이지.",
  },
  {
    id: "a16",
    date: "7월 12일",
    objectType: "mushroom",
    objectName: "두둥실 뜬 마음",
    oneLine: "오랜만에 마음이 가벼워진 순간",
    primaryEmotion: "기쁨",
    secondaryEmotion: "편안함",
    diaryText: "오랜만에 아무 걱정 없이 하루를 보냈다. 마음이 둥둥 떠다니는 것 같았다.",
    characterLine: "그런 가벼운 기분, 자주 느꼈으면 좋겠다!!",
  },
  {
    id: "a17",
    date: "7월 11일",
    objectType: "trophy",
    objectName: "반짝인 작은 순간",
    oneLine: "사소하지만 오래 기억될 것 같은 순간",
    primaryEmotion: "만족",
    secondaryEmotion: "기쁨",
    diaryText: "별거 아닌 순간이었는데 계속 생각났다. 작지만 반짝이는 하루였다.",
    characterLine: "그런 작은 반짝임들이 쌓여서 하루가 되는 거지!!",
  },
  {
    id: "a18",
    date: "7월 10일",
    objectType: "coin",
    objectName: "따뜻하게 데워진 마음",
    oneLine: "누군가의 다정함이 마음에 남은 순간",
    primaryEmotion: "기쁨",
    secondaryEmotion: "만족",
    diaryText: "친구가 별거 아닌 말을 건넸는데 그게 그렇게 따뜻했다.",
    characterLine: "그런 다정함, 오래 기억에 남지!!",
  },
  {
    id: "a19",
    date: "7월 9일",
    objectType: "potion",
    objectName: "혼자 밝혀둔 등불",
    oneLine: "혼자만의 시간이 오히려 편안했던 순간",
    primaryEmotion: "편안함",
    secondaryEmotion: "담담함",
    diaryText: "오늘은 그냥 혼자 있는 시간이 좋았다. 아무 말 없이도 편안했다.",
    characterLine: "혼자 있는 시간도 소중한 거야.",
  },
  {
    id: "a20",
    date: "7월 8일",
    objectType: "cake",
    objectName: "가볍게 내려앉은 하루",
    oneLine: "무난하게 흘러간 평범한 하루",
    primaryEmotion: "담담함",
    secondaryEmotion: "편안함",
    diaryText: "특별한 일은 없었지만 무난하게 하루가 지나갔다.",
    characterLine: "무난한 하루도 나름의 몫을 하는 거지.",
  },
  {
    id: "a21",
    date: "7월 7일",
    objectType: "dice",
    objectName: "동그랗게 정리된 마음",
    oneLine: "복잡했던 마음이 조금씩 정리된 순간",
    primaryEmotion: "편안함",
    secondaryEmotion: "안심",
    diaryText: "복잡하던 생각들이 오늘은 조금 정리가 됐다.",
    characterLine: "마음이 정리되는 날도 있어야지.",
  },
  {
    id: "a22",
    date: "7월 6일",
    objectType: "wand",
    objectName: "멈춰버린 시간",
    oneLine: "시간이 유독 더디게 갔던 순간",
    primaryEmotion: "지침",
    secondaryEmotion: "허탈함",
    diaryText: "오늘따라 시간이 너무 안 갔다. 몸도 마음도 지쳤다.",
    characterLine: "그런 날은 억지로 힘내지 않아도 돼.",
  },
  {
    id: "a23",
    date: "7월 5일",
    objectType: "crown",
    objectName: "예상 못한 작은 선물",
    oneLine: "생각지도 못한 곳에서 온 기쁨",
    primaryEmotion: "기쁨",
    secondaryEmotion: "설레",
    diaryText: "전혀 예상 못한 순간에 좋은 일이 생겨서 하루 종일 기분이 좋았다.",
    characterLine: "예상 못한 기쁨이 제일 크지!!",
  },
  {
    id: "a24",
    date: "7월 4일",
    objectType: "donut",
    objectName: "바람 따라 흔들린 하루",
    oneLine: "이리저리 휘둘렸던 정신없는 순간",
    primaryEmotion: "불안",
    secondaryEmotion: "짜증",
    diaryText: "오늘은 하루 종일 이 일 저 일에 휘둘리느라 정신이 없었다.",
    characterLine: "그렇게 휘둘리는 날은 진짜 힘들지ㅠㅠ",
  },
  {
    id: "a25",
    date: "7월 3일",
    objectType: "chest",
    objectName: "숨어 자란 하루",
    oneLine: "티 안 나게 조금씩 나아간 순간",
    primaryEmotion: "만족",
    secondaryEmotion: "편안함",
    diaryText: "겉으로는 별일 없어 보였지만 나름 조금씩 나아지고 있다는 걸 느꼈다.",
    characterLine: "티 안 나도 분명 나아가고 있는 거야.",
  },
  {
    id: "a26",
    date: "7월 2일",
    objectType: "scroll",
    objectName: "다 타버린 하루",
    oneLine: "온 힘을 다 쓴 것 같은 순간",
    primaryEmotion: "지침",
    secondaryEmotion: "허탈함",
    diaryText: "오늘 진짜 온 힘을 다 썼다. 다 타버린 느낌이었다.",
    characterLine: "오늘은 푹 쉬어야 해, 진짜 애썼어.",
  },
  {
    id: "a27",
    date: "7월 1일",
    objectType: "book",
    objectName: "혼자 빛난 순간",
    oneLine: "인정받지 못했지만 스스로는 뿌듯했던 순간",
    primaryEmotion: "만족",
    secondaryEmotion: "뿌듯",
    diaryText: "아무도 몰라줬지만 나 스스로는 오늘 하루 잘했다고 느꼈다.",
    characterLine: "너가 알아주면 그걸로 충분해!!",
  },
  {
    id: "a28",
    date: "6월 30일",
    objectType: "map",
    objectName: "심어둔 작은 기대",
    oneLine: "앞으로가 조금 기대되는 순간",
    primaryEmotion: "설레",
    secondaryEmotion: "기쁨",
    diaryText: "오늘 새로운 걸 시작했는데 왠지 기대가 됐다.",
    characterLine: "그 기대감, 소중히 간직해!!",
  },
  {
    id: "a29",
    date: "6월 29일",
    objectType: "anchor",
    objectName: "은은하게 밝힌 밤",
    oneLine: "조용히 마음이 편안해졌던 순간",
    primaryEmotion: "편안함",
    secondaryEmotion: "안심",
    diaryText: "밤에 혼자 있는 시간이 오늘따라 참 편안했다.",
    characterLine: "그런 조용한 밤, 필요할 때가 있지.",
  },
  {
    id: "a30",
    date: "6월 28일",
    objectType: "boots",
    objectName: "펴지 못한 마음",
    oneLine: "괜히 움츠러들었던 순간",
    primaryEmotion: "불안",
    secondaryEmotion: "서운함",
    diaryText: "이유 없이 마음이 움츠러드는 하루였다.",
    characterLine: "괜히 움츠러드는 날, 나도 있어.",
  },
  {
    id: "a31",
    date: "6월 27일",
    objectType: "medal",
    objectName: "찾아낸 열쇠",
    oneLine: "막혔던 문제가 갑자기 풀린 순간",
    primaryEmotion: "만족",
    secondaryEmotion: "홀가분",
    diaryText: "며칠 고민하던 문제가 갑자기 풀렸다. 속이 다 시원했다.",
    characterLine: "풀렸을 때 그 기분, 진짜 최고지!!",
  },
  {
    id: "a32",
    date: "6월 26일",
    objectType: "boat",
    objectName: "다시 맞춰본 방향",
    oneLine: "잠깐 흔들렸지만 다시 중심을 잡은 순간",
    primaryEmotion: "안심",
    secondaryEmotion: "담담함",
    diaryText: "잠깐 방향을 잃은 것 같았는데 다시 마음을 다잡았다.",
    characterLine: "다시 방향 잡은 것만으로도 잘한 거야.",
  },
  {
    id: "a33",
    date: "6월 25일",
    objectType: "lantern",
    objectName: "가볍게 흘려보낸 하루",
    oneLine: "크게 신경 쓰지 않고 넘긴 순간",
    primaryEmotion: "편안함",
    secondaryEmotion: "담담함",
    diaryText: "오늘 있었던 일들을 그냥 가볍게 넘겼다. 그게 편했다.",
    characterLine: "가볍게 넘어간 하루도 괜찮아.",
  },
  {
    id: "a34",
    date: "6월 24일",
    objectType: "seed",
    objectName: "지나가는 구름 같은 하루",
    oneLine: "무겁지도 가볍지도 않았던 순간",
    primaryEmotion: "담담함",
    secondaryEmotion: "지침",
    diaryText: "특별할 것 없이 무던하게 하루가 지나갔다.",
    characterLine: "오늘은 그냥 이런 하루였구나.",
  },
  {
    id: "a35",
    date: "6월 23일",
    objectType: "umbrella",
    objectName: "묵묵히 해낸 하루",
    oneLine: "티 안 나도 스스로 해낸 순간",
    primaryEmotion: "뿌듯",
    secondaryEmotion: "만족",
    diaryText: "오늘도 묵묵히 할 일을 다 해냈다. 스스로가 대견했다.",
    characterLine: "그런 하루하루가 쌓여서 네가 되는 거야!!",
  },
  {
    id: "a36",
    date: "6월 22일",
    objectType: "key",
    objectName: "꾹꾹 눌러쓴 하루",
    oneLine: "복잡한 마음을 글로 정리한 순간",
    primaryEmotion: "담담함",
    secondaryEmotion: "편안함",
    diaryText: "마음이 복잡해서 오늘 있었던 일을 글로 적어봤다. 조금 정리가 됐다.",
    characterLine: "글로 적어보는 것도 마음을 정리하는 좋은 방법이야.",
  },
  {
    id: "a37",
    date: "6월 21일",
    objectType: "candle",
    objectName: "혼자 세운 기록",
    oneLine: "작지만 스스로 해낸 것에 뿌듯했던 순간",
    primaryEmotion: "뿌듯",
    secondaryEmotion: "만족",
    diaryText: "작은 목표였지만 오늘 드디어 해냈다. 아무도 안 알아줘도 뿌듯했다.",
    characterLine: "그 뿌듯함, 온전히 너의 것이야!!",
  },
  {
    id: "a38",
    date: "6월 20일",
    objectType: "bell",
    objectName: "우연히 주운 행운",
    oneLine: "생각지도 못한 좋은 일이 생긴 순간",
    primaryEmotion: "기쁨",
    secondaryEmotion: "설레",
    diaryText: "오늘 우연히 좋은 일이 생겼다. 작은 행운이 하루를 다 바꿔놨다.",
    characterLine: "그런 우연한 행운, 완전 반갑지!!",
  },
  {
    id: "a39",
    date: "6월 19일",
    objectType: "balloon",
    objectName: "천천히 스며든 위로",
    oneLine: "마음이 서서히 나아졌던 순간",
    primaryEmotion: "편안함",
    secondaryEmotion: "안심",
    diaryText: "힘들었던 마음이 오늘은 조금씩 나아지는 게 느껴졌다.",
    characterLine: "천천히 나아지는 것도 나아지는 거야.",
  },
  {
    id: "a40",
    date: "6월 18일",
    objectType: "hourglass",
    objectName: "달콤했던 순간",
    oneLine: "작은 축하가 하루를 특별하게 만든 순간",
    primaryEmotion: "기쁨",
    secondaryEmotion: "만족",
    diaryText: "별거 아닌 이유였지만 다들 축하해줘서 하루가 특별해졌다.",
    characterLine: "그런 달콤한 순간, 자주 있었으면!!",
  },
  {
    id: "a41",
    date: "6월 17일",
    objectType: "gift",
    objectName: "예측 못한 하루",
    oneLine: "어떻게 될지 몰라 조마조마했던 순간",
    primaryEmotion: "불안",
    secondaryEmotion: "설레",
    diaryText: "오늘 일이 어떻게 될지 몰라서 하루 종일 마음을 졸였다.",
    characterLine: "결과가 어떻든, 조마조마했던 그 마음도 수고했어.",
  },
  {
    id: "a42",
    date: "6월 16일",
    objectType: "mushroom",
    objectName: "순식간에 풀린 마법",
    oneLine: "골치 아팠던 일이 한 번에 해결된 순간",
    primaryEmotion: "만족",
    secondaryEmotion: "홀가분",
    diaryText: "며칠을 고민하던 일이 오늘 순식간에 해결됐다. 마법 같았다.",
    characterLine: "그렇게 확 풀리는 순간, 진짜 짜릿하지!!",
  },
  {
    id: "a43",
    date: "6월 15일",
    objectType: "trophy",
    objectName: "스스로에게 씌운 왕관",
    oneLine: "오늘만큼은 나 자신이 자랑스러웠던 순간",
    primaryEmotion: "뿌듯",
    secondaryEmotion: "기쁨",
    diaryText: "오늘 하루는 정말 내가 나를 칭찬해주고 싶었다.",
    characterLine: "너 스스로 인정하는 게 제일 중요해!!",
  },
  {
    id: "a44",
    date: "6월 14일",
    objectType: "coin",
    objectName: "동그랗게 채워진 하루",
    oneLine: "소소하지만 만족스러웠던 하루",
    primaryEmotion: "만족",
    secondaryEmotion: "편안함",
    diaryText: "특별한 건 없었지만 오늘 하루가 꽤 만족스러웠다.",
    characterLine: "동그랗게 잘 채워진 하루였네!!",
  },
];

/* ---------- 감정 → 캐릭터 반응 애니메이션 매핑 ---------- */
const EMOTION_REACTION = {
  분노: "puff",
  서운함: "droop",
  짜증: "shiver",
  만족: "bounce",
  기쁨: "bounce",
  허탈함: "slow",
  담담함: "slow",
  편안함: "droop",
};

/* 앱을 그리는 고정 캔버스 크기 - 브라우저 창 크기에 맞춰 이 캔버스 전체를 축소/확대해서
   보여준다(내부 스크롤 없이 한 화면에 다 보이도록).
   - 데스크톱(넓은 화면)에서는 CANVAS_MARGIN_RATIO만큼 여백을 남기고 캔버스 전체가 다
     보이도록 축소(contain)해서 "떠 있는 폰 화면"처럼 보이게 함.
   - 실제 모바일 기기(좁은 화면 + 터치)에서는 여백 없이, 화면을 완전히 덮도록(cover)
     확대해서 네이티브 앱처럼 화면 전체를 채움 (비율이 안 맞는 만큼만 상/하 또는 좌/우로
     살짝 잘림 - 왜곡은 없음). */
const DESIGN_WIDTH = 420;
const DESIGN_HEIGHT = 840;
const CANVAS_MARGIN_RATIO = 0.08; // 데스크톱: 위아래/좌우 각 8% 정도 여백
const NATIVE_MOBILE_QUERY = "(pointer: coarse) and (max-width: 768px)";

function isNativeMobileMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(NATIVE_MOBILE_QUERY).matches;
}

function computeFitScale(nativeMobile) {
  if (typeof window === "undefined") return 1;
  const marginRatio = nativeMobile ? 0 : CANVAS_MARGIN_RATIO;
  const availableWidth = window.innerWidth * (1 - marginRatio * 2);
  const availableHeight = window.innerHeight * (1 - marginRatio * 2);
  const widthRatio = availableWidth / DESIGN_WIDTH;
  const heightRatio = availableHeight / DESIGN_HEIGHT;
  return nativeMobile ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
}

function computeViewportSize() {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

/* ================= 메인 앱 ================= */
export default function EmotionArchiveApp() {
  const [scale, setScale] = useState(1);
  // 래퍼의 width/height를 CSS 100vw/100dvh 대신 이 값(px)으로 직접 고정한다.
  // 100dvh는 모바일 키보드가 뜨면 브라우저가 실시간으로 줄여버릴 수 있어서,
  // 그 안에서 중앙 정렬된 콘텐츠가 다시 정렬되며 위로 밀리는 원인이 된다.
  // 초기값은 서버 렌더링과 항상 동일한 SSR-안전 기본값으로 두고(0/false), 실제 값은
  // 아래 useLayoutEffect(클라이언트 전용)에서 채운다 - window를 읽는 함수를 그대로
  // useState 초기화 함수로 쓰면 서버는 기본값을, 클라이언트는 실제값을 최초 렌더에
  // 즉시 사용하게 되어 hydration mismatch가 나고, 그 결과 이후 같은 값으로 다시
  // setState해도 React가 "이미 그 값으로 렌더했다"고 보고 실제 DOM을 갱신하지 않는다.
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [nativeMobile, setNativeMobile] = useState(false);
  // 모바일 키보드가 화면 아래쪽을 얼마나(px) 가리고 있는지 - 채팅 입력창을 그만큼
  // 위로 띄워서 키보드 위에 보이게 하는 데 쓴다. 0이면 키보드가 닫혀 있는 것.
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [screen, setScreen] = useState("splash"); // splash | onboarding | chat | processing | result | archive | detail
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [allUserText, setAllUserText] = useState("");
  const [lastUserText, setLastUserText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [charLine, setCharLine] = useState(CHAR_OPENING);
  const [nudge, setNudge] = useState(false);
  const [sessionTopic, setSessionTopic] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); // [{role:'user'|'assistant', text}] - AI 응답용 대화 맥락
  const [isThinking, setIsThinking] = useState(false);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [archive, setArchive] = useState(INITIAL_ARCHIVE);
  const [archiveLoaded, setArchiveLoaded] = useState(false); // 저장소에서 최초 로드 완료 여부 (로드 전 덮어쓰기 방지)
  const [storageError, setStorageError] = useState("");
  const requestBusy = useRef(false);
  const [draftResult, setDraftResult] = useState(RESULT_TEMPLATES.neutral[0]);
  const [detailEntry, setDetailEntry] = useState(null);
  const [processingStage, setProcessingStage] = useState(0); // 0 idle,1 fly,2 react,3 settle,4 done
  const timers = useRef([]);

  // 앱 시작 시 저장된 아카이브 불러오기 (없으면 기본 샘플 데이터 유지)
  useEffect(() => {
    try {
      // 브라우저 저장소는 SSR 이후에만 읽는다. 빈 배열도 사용자의 저장된 상태다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setArchive(readArchive(localStorage.getItem("emotion-archive-entries"), INITIAL_ARCHIVE));
      setArchiveLoaded(true);
    } catch {
      setArchive([]);
      setStorageError("기록을 불러오지 못했어. 기존 기록 보호를 위해 저장을 멈췄어. 브라우저 저장 설정을 확인해줘.");
    }
  }, []);

  // 아카이브가 바뀔 때마다(저장/수정/삭제) 저장소에 반영 (최초 로드 완료 후부터)
  useEffect(() => {
    if (!archiveLoaded) return;
    try {
      localStorage.setItem("emotion-archive-entries", JSON.stringify(archive));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError("");
    } catch {
      setStorageError("기록을 이 기기에 저장하지 못했어. 새로고침하면 방금 변경한 기록이 사라질 수 있어.");
    }
  }, [archive, archiveLoaded]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach(clearTimeout);
  }, []);

  // 브라우저 창 크기가 바뀔 때마다 캔버스 축소/확대 비율 재계산 (스크롤 없이 항상 한 화면에 맞춤)
  // useLayoutEffect: 페인트 전에 동기적으로 반영해서 초기 scale(1) 상태가 화면에 깜빡이지 않도록 함
  useLayoutEffect(() => {
    let lastWidth = window.innerWidth;

    function updateScale() {
      const activeTag = document.activeElement?.tagName;
      const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA";
      const widthChanged = window.innerWidth !== lastWidth;
      lastWidth = window.innerWidth;

      // 모바일 키보드가 올라오면 너비 변화 없이 innerHeight(또는 visualViewport)만 줄어들면서
      // resize 이벤트가 발생한다 - 이때는 실제 회전/창 크기 변경이 아니므로 재계산을 건너뛰어
      // 입력 중 화면 전체가 다시 축소되는 것을 막는다.
      if (isTyping && !widthChanged) return;

      const isNative = isNativeMobileMode();
      setNativeMobile(isNative);
      setScale(computeFitScale(isNative));
      setViewportSize(computeViewportSize());
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    window.visualViewport?.addEventListener("resize", updateScale);
    return () => {
      window.removeEventListener("resize", updateScale);
      window.visualViewport?.removeEventListener("resize", updateScale);
    };
  }, []);

  // 키보드가 열려 있는 동안 캔버스 자체는 위 effect가 그대로 얼려두지만(밀림 방지),
  // 그 결과 입력창이 얼어붙은 캔버스 하단, 즉 키보드에 가려진 자리에 그대로 남는다.
  // visualViewport로 키보드가 가린 실제 높이(px)를 추적해서 입력창만 그만큼 띄운다.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function updateKeyboardOffset() {
      const covered = viewportSize.height - vv.height - vv.offsetTop;
      setKeyboardOffset(covered > 0 ? Math.round(covered) : 0);
    }
    updateKeyboardOffset();
    vv.addEventListener("resize", updateKeyboardOffset);
    vv.addEventListener("scroll", updateKeyboardOffset);
    return () => {
      vv.removeEventListener("resize", updateKeyboardOffset);
      vv.removeEventListener("scroll", updateKeyboardOffset);
    };
  }, [viewportSize.height]);

  // 우루루 성격 프롬프트는 서버(app/api/uruuru-chat)에서 관리 - 클라이언트는 대화 내용만 전달
  async function askUruuru(history, userMessage) {
    const response = await fetch("/api/uruuru-chat", {
      signal: AbortSignal.timeout(30_000),
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: history.map((h) => ({ role: h.role, text: h.text })),
        message: userMessage,
      }),
    });
    if (!response.ok) throw new Error("우루루 응답 요청 실패");
    const data = await response.json();
    if (typeof data.text !== "string" || !data.text.trim()) throw new Error("빈 응답");
    return data.text;
  }

  async function handleSend() {
    const text = inputValue.trim();
    if (!text || requestBusy.current) return;
    requestBusy.current = true;
    setInputValue("");

    const casualKey = detectCasual(text);
    const greetingNow = isGreeting(text) && userMsgCount === 0;

    setLastUserText(text);
    if (!casualKey && !greetingNow) {
      const combined = allUserText + " " + text;
      setAllUserText(combined);
      const nextCount = userMsgCount + 1;
      setUserMsgCount(nextCount);
      const detectedTopic = detectTopic(combined);
      if (!sessionTopic && detectedTopic) setSessionTopic(detectedTopic);
    }

    setIsThinking(true);
    const historyForApi = chatHistory.slice(-10); // 너무 길어지지 않게 최근 대화만 사용
    try {
      const reply = await askUruuru(historyForApi, text);
      setCharLine(reply);
      setChatHistory((h) => [...h, { role: "user", text }, { role: "assistant", text: reply }]);
    } catch {
      // API 호출 실패 시 기존 대사 풀로 자연스럽게 대체 (오프라인/네트워크 제한 환경 대비)
      let fallback;
      if (greetingNow) fallback = pickLine(GREETING_REPLIES);
      else if (casualKey) fallback = pickLine(CASUAL_REPLIES[casualKey], charLine);
      else {
        const sentiment = detectSentiment(allUserText + " " + text);
        const topic = sessionTopic || detectTopic(text);
        fallback = userMsgCount <= 1 ? getFollowup(sentiment, topic) : getDeeper(sentiment, topic, charLine);
      }
      setCharLine(fallback);
      setChatHistory((h) => [...h, { role: "user", text }, { role: "assistant", text: fallback }]);
    } finally {
      requestBusy.current = false;
      setIsThinking(false);
      setNudge(true);
      timers.current.push(setTimeout(() => setNudge(false), 500));
    }
  }

  function resetSession() {
    setInputValue("");
    setUserMsgCount(0);
    setAllUserText("");
    setLastUserText("");
    setCharLine(CHAR_OPENING);
    setSessionTopic(null);
    setChatHistory([]);
  }

  // 대화 -> 감정 오브젝트 변환 프롬프트는 서버(app/api/archive-result)에서 관리
  async function generateArchiveResult(conversationText) {
    const response = await fetch("/api/archive-result", {
      signal: AbortSignal.timeout(35_000),
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationText }),
    });
    if (!response.ok) throw new Error("아카이브 결과 생성 요청 실패");
    const parsed = await response.json();

    // 최소한의 검증: 필수 필드가 다 있는지, objectType/감정이 유효한 값인지 확인
    const validTypes = [
      "diary", "letter", "plate", "medal", "boat", "lantern", "seed", "umbrella", "key",
      "compass", "candle", "bell", "balloon",
      "hourglass", "gift", "mushroom", "trophy", "coin", "potion", "cake", "dice",
      "wand", "crown", "donut", "chest", "scroll", "book", "map", "anchor", "boots",
    ];
    const validEmotions = ["분노", "서운함", "짜증", "만족", "기쁨", "허탈함", "담담함", "편안함", "불안", "슬픔", "지침", "뿌듯", "설레", "안심", "홀가분"];
    if (
      !validTypes.includes(parsed.objectType) ||
      !validEmotions.includes(parsed.primaryEmotion) ||
      !parsed.objectName ||
      !parsed.characterLine ||
      !parsed.diaryText
    ) {
      throw new Error("AI 응답이 유효하지 않음");
    }
    if (!validEmotions.includes(parsed.secondaryEmotion)) parsed.secondaryEmotion = parsed.primaryEmotion;
    return parsed;
  }

  async function startProcessing() {
    if (requestBusy.current || !allUserText.trim()) return;
    requestBusy.current = true;
    setIsGeneratingResult(true);
    let result;
    try {
      result = await generateArchiveResult(allUserText.slice(-20_000));
    } catch {
      // AI 생성 실패 시(네트워크 제한 등) 기존 템플릿 방식으로 자연스럽게 대체
      const sentiment = detectSentiment(allUserText);
      result = buildResult(sentiment, allUserText);
    }
    setIsGeneratingResult(false);
    requestBusy.current = false;

    const cleanedStory = allUserText.trim() || "오늘 있었던 일";
    const sentimentForClosing = detectSentiment(allUserText);
    const diaryText = result.diaryText || `${cleanedStory} ${DIARY_CLOSING[sentimentForClosing] || DIARY_CLOSING.neutral}`;

    setDraftResult({ ...result, diaryText }); // 처리 화면 1단계부터 올바른 감정을 참조하도록 즉시 반영
    setScreen("processing");
    setProcessingStage(1);
    timers.current.push(setTimeout(() => setProcessingStage(2), 1200));
    timers.current.push(setTimeout(() => setProcessingStage(3), 2600));
    timers.current.push(setTimeout(() => setProcessingStage(4), 3300));
    timers.current.push(setTimeout(() => setProcessingStage(5), 4300)); // 가방 속으로 뿅 들어가는 단계
    timers.current.push(setTimeout(() => setScreen("result"), 5300));
  }

  function saveToArchive() {
    if (!archiveLoaded) return;
    const createdAt = new Date().toISOString();
    const newEntry = {
      id: "new-" + Date.now(),
      ...draftResult,
      createdAt,
      date: getEntryDate({ createdAt }),
    };
    setArchive((previous) => [newEntry, ...previous]);
    resetSession();
    setScreen("archive");
  }

  function resetArchive() {
    if (!archiveLoaded) return;
    setArchive(INITIAL_ARCHIVE);
  }

  function openDetail(entry) {
    setDetailEntry(entry);
    setScreen("detail");
  }

  function updateEntry(id, updatedFields) {
    if (!archiveLoaded) return;
    setArchive((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e)));
    setDetailEntry((prev) => (prev && prev.id === id ? { ...prev, ...updatedFields } : prev));
  }

  function deleteEntry(id) {
    if (!archiveLoaded) return;
    setArchive((prev) => prev.filter((e) => e.id !== id));
    setDetailEntry(null);
    setScreen("archive");
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: viewportSize.width || "100vw",
        height: viewportSize.height || "100dvh",
        overflow: "hidden",
        background: COLORS.bg,
        fontFamily: "'Jua', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jua&family=Gaegu:wght@400;700&display=swap');
        @keyframes peng-bounce { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-10px) rotate(-3deg)} 50%{transform:translateY(0)} 75%{transform:translateY(-10px) rotate(3deg)} }
        @keyframes peng-puff { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes peng-shiver { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
        @keyframes peng-droop { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-6deg) translateY(4px)} }
        @keyframes peng-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
        @keyframes peng-gulp { 0%,100%{transform:scale(1)} 40%{transform:scale(1.12,0.92)} 70%{transform:scale(0.95,1.05)} }
        @keyframes bubble-fly { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(60px) scale(0.15);opacity:0} }
        @keyframes card-in { 0%{transform:translateY(16px) scale(0.85);opacity:0} 100%{transform:translateY(0) scale(1);opacity:1} }
        .peng-bounce { animation: peng-bounce 0.6s ease-in-out infinite; }
        .peng-puff { animation: peng-puff 0.45s ease-in-out infinite; }
        .peng-shiver { animation: peng-shiver 0.3s ease-in-out infinite; }
        .peng-droop { animation: peng-droop 2.2s ease-in-out infinite; }
        .peng-slow { animation: peng-slow 2.6s ease-in-out infinite; }
        .peng-idle { animation: peng-idle 3.2s ease-in-out infinite; }
        @keyframes peng-idle { 0%,100%{transform:scale(1)} 50%{transform:scale(1.015)} }
        .peng-gulp { animation: peng-gulp 0.5s ease-in-out; }
        .bubble-fly { animation: bubble-fly 1s cubic-bezier(0.55,0,0.85,0.35) forwards; }
        .card-in { animation: card-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes card-fly-to-bag { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(0,-140px) scale(0.08);opacity:0} }
        .card-fly-to-bag { animation: card-fly-to-bag 0.9s cubic-bezier(0.55,0,0.85,0.35) forwards; }
        @keyframes bag-sparkle-pop { 0%{transform:scale(0) rotate(0deg);opacity:0} 40%{transform:scale(1.3) rotate(20deg);opacity:1} 100%{transform:scale(0) rotate(40deg);opacity:0} }
        .bag-sparkle { animation: bag-sparkle-pop 0.8s ease-out 0.5s forwards; opacity: 0; }
        @keyframes bookmark-pop { 0%{transform:scale(0) translateY(6px);opacity:0} 60%{transform:scale(1.08) translateY(0);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes emote-pop { 0%{transform:scale(0) translateY(6px) rotate(-8deg);opacity:0} 55%{transform:scale(1.2) translateY(-4px) rotate(6deg);opacity:1} 75%{transform:scale(1) translateY(0) rotate(0deg);opacity:1} 100%{transform:scale(0.9) translateY(-2px) rotate(0deg);opacity:0} }
        @keyframes pose-pop { 0%{opacity:0;transform:scale(0.75) translateY(10px)} 55%{opacity:1;transform:scale(1.06) translateY(-3px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        .typing-dots { display: inline-flex; align-items: center; gap: 4px; padding: 3px 0; }
        .typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: ${COLORS.textSecondary}; animation: typing-bounce 1.2s ease-in-out infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing-bounce { 0%,60%,100%{transform:translateY(0);opacity:0.5} 30%{transform:translateY(-4px);opacity:1} }
        .pose-pop { animation: pose-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes item-pop { 0%{opacity:0;transform:scale(0.3) rotate(-14deg)} 45%{opacity:1;transform:scale(1.22) rotate(6deg)} 65%{transform:scale(0.93) rotate(-3deg)} 82%{transform:scale(1.06) rotate(1.5deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes item-idle-bounce { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-5px) rotate(-2deg)} }
        .item-slot {
          animation: item-pop 0.65s cubic-bezier(0.34,1.56,0.64,1) both, item-idle-bounce 2.6s ease-in-out infinite;
          animation-delay: 0s, 0.65s;
          transition: transform 0.35s cubic-bezier(0.34,1.75,0.64,1);
        }
        .item-slot:active { transform: scale(0.82) rotate(-4deg) !important; transition: transform 0.08s ease; animation-play-state: paused; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes splash-float { 0%,100%{transform:translate(0,0) rotate(-4deg)} 30%{transform:translate(7px,-12px) rotate(3deg)} 60%{transform:translate(-6px,-18px) rotate(-3deg)} 85%{transform:translate(4px,-6px) rotate(2deg)} }
        @keyframes roam-a { 0%,100%{transform:translate(0,0) rotate(-5deg)} 25%{transform:translate(90px,60px) rotate(6deg)} 50%{transform:translate(40px,160px) rotate(-4deg)} 75%{transform:translate(-70px,90px) rotate(5deg)} }
        @keyframes roam-b { 0%,100%{transform:translate(0,0) rotate(4deg)} 25%{transform:translate(-80px,100px) rotate(-6deg)} 50%{transform:translate(-30px,-80px) rotate(3deg)} 75%{transform:translate(100px,-40px) rotate(-5deg)} }
        @keyframes roam-c { 0%,100%{transform:translate(0,0) rotate(0deg)} 20%{transform:translate(60px,-120px) rotate(5deg)} 45%{transform:translate(150px,20px) rotate(-3deg)} 70%{transform:translate(30px,130px) rotate(4deg)} }
        @keyframes splash-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .splash-pulse { animation: splash-pulse 1.4s ease-in-out infinite; }
        .emote-pop { animation: emote-pop 1.3s ease-out forwards; }
        @keyframes bookmark-pulse { 0%,100%{box-shadow:0 3px 8px rgba(239,159,39,0.4)} 50%{box-shadow:0 3px 14px rgba(239,159,39,0.75)} }
        .bookmark-pop { animation: bookmark-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, bookmark-pulse 2s ease-in-out 0.6s infinite; }
        .ea-btn { border: none; border-radius: 999px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; }
        .ea-input { border: 0.5px solid #D8D4C7; border-radius: 999px; padding: 8px 14px; font-size: 13px; outline: none; font-family: inherit; color: ${COLORS.ink}; background: ${COLORS.white}; }
        .ea-input::placeholder { color: ${COLORS.textMuted}; opacity: 1; }
        select, input, textarea, button { font-family: inherit; }
        textarea.ea-diary { width: 100%; border: 0.5px solid #E3DCC8; border-radius: 10px; padding: 10px; font-size: 13px; line-height: 1.7; color: ${COLORS.textSecondary}; font-family: inherit; resize: vertical; box-sizing: border-box; }
      `}</style>

      <div
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          flexShrink: 0,
          transform: `scale(${scale})`,
          background: screen === "archive" || screen === "detail" ? COLORS.archiveBg : COLORS.bg,
          overflow: "hidden",
          borderRadius: nativeMobile ? 0 : 32,
          boxShadow: nativeMobile ? "none" : "0 24px 60px rgba(0,0,0,0.32), 0 4px 16px rgba(0,0,0,0.18)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {storageError && <div role="alert" style={{ padding: "8px 14px", background: "#fff3d6", color: COLORS.ink, fontSize: 12 }}>{storageError}</div>}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {screen === "splash" && (
            <SplashScreen onDone={() => setScreen("onboarding")} />
          )}
          {screen === "onboarding" && (
            <OnboardingScreen onDone={() => setScreen("chat")} />
          )}
          {screen === "chat" && (
            <ChatScreen
              charLine={charLine}
              lastUserText={lastUserText}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSend={handleSend}
              showBookmark={userMsgCount >= 2}
              onBookmark={startProcessing}
              nudge={nudge}
              isThinking={isThinking}
              isGeneratingResult={isGeneratingResult}
              scale={scale}
              keyboardOffset={keyboardOffset}
            />
          )}
          {screen === "processing" && (
            <ProcessingScreen
              stage={processingStage}
              lastUserText={lastUserText}
              result={draftResult}
            />
          )}
          {screen === "result" && (
            <ResultScreen
              result={draftResult}
              setResult={setDraftResult}
              onSave={saveToArchive}
            />
          )}
          {screen === "archive" && (
            <ArchiveScreen entries={archive} onOpen={openDetail} onBack={() => setScreen("chat")} onReset={resetArchive} />
          )}
          {screen === "detail" && detailEntry && (
            <DetailScreen
              entry={detailEntry}
              onBack={() => setScreen("archive")}
              onUpdate={updateEntry}
              onDelete={deleteEntry}
            />
          )}
        </div>

        {(screen === "chat" || screen === "archive") && (
          <BottomNav screen={screen} setScreen={setScreen} disabled={isThinking || isGeneratingResult} />
        )}
      </div>
    </div>
  );
}

/* ---------- 대화 중 반응 이모트 (느낌표/물음표/하트 팝업) ---------- */
function FloatingSymbol({ type }) {
  if (!type) return null;
  const symbols = {
    exclaim: (
      <>
        <circle cx="16" cy="16" r="15" fill="#EF9F27" />
        <rect x="13" y="7" width="6" height="14" rx="3" fill="#FFFFFF" />
        <circle cx="16" cy="25" r="3.2" fill="#FFFFFF" />
      </>
    ),
    question: (
      <>
        <circle cx="16" cy="16" r="15" fill="#3C3489" />
        <path
          d="M11 12 C11 8.5 13.5 6.5 16.2 6.5 C19 6.5 21.2 8.4 21.2 11.2 C21.2 13.6 19.6 14.7 18.1 15.7 C16.8 16.6 16.3 17.3 16.3 19"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="16.2" cy="24" r="2.6" fill="#FFFFFF" />
      </>
    ),
    heart: (
      <path
        d="M16 27 C6 20 3 14 3 9.5 C3 5.9 6 3 9.6 3 C12.4 3 14.8 4.7 16 7.3 C17.2 4.7 19.6 3 22.4 3 C26 3 29 5.9 29 9.5 C29 14 26 20 16 27 Z"
        fill="#F27FA0"
      />
    ),
  };
  return (
    <div className="emote-pop" style={{ position: "absolute", top: -30, right: -6, zIndex: 4, pointerEvents: "none" }}>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        {symbols[type]}
      </svg>
    </div>
  );
}


/* ---------- 화면 1: 메인 대화 ---------- */
/* ---------- 화면 0: 시작(온보딩) ---------- */
/* ---------- 스플래시(타이틀) 화면 ---------- */
/* ---------- 스플래시용 심플 장식 아이콘 (아카이브 아이템과 무관한 귀여운 요소) ---------- */
/* ---------- 스플래시용 우루루 실루엣 아이콘 (흰색 라인 드로잉) ---------- */
function PenguinLineIcon({ size = 32, opacity = 0.6 }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" aria-hidden="true">
      <g fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
        {/* 정수리 깃털 */}
        <path d="M17 3 C18 5 18 6.5 17 8 M23 3 C22 5 22 6.5 23 8" />
        {/* 몸통 실루엣 */}
        <path d="M9 42 C7 24 10 9 20 9 C30 9 33 24 31 42 Z" />
        {/* 날개 (아래로 늘어뜨린 자세) */}
        <path d="M9 28 C6 32 5.5 36.5 7.5 39.5" />
        <path d="M31 28 C34 32 34.5 36.5 32.5 39.5" />
        {/* 동그란 눈 (우루루 상징) */}
        <circle cx="15.5" cy="19" r="2.1" fill="#FFFFFF" stroke="none" />
        <circle cx="24.5" cy="19" r="2.1" fill="#FFFFFF" stroke="none" />
        {/* 부리 */}
        <path d="M18.3 23.5 Q20 25.5 21.7 23.5" />
      </g>
    </svg>
  );
}

function SplashScreen({ onDone }) {
  // roam: 화면 전체를 크게 가로지르는 이동 패턴 3종류를 번갈아 적용해 불규칙해 보이게 함
  const roams = ["roam-a", "roam-b", "roam-c"];
  const floaters = [
    { top: "6%", left: "10%", size: 30, delay: 0, dur: 7.5, op: 0.55 },
    { top: "12%", left: "72%", size: 22, delay: 0.6, dur: 8.5, op: 0.4 },
    { top: "48%", left: "6%", size: 26, delay: 1.1, dur: 9.2, op: 0.45 },
    { top: "58%", left: "82%", size: 32, delay: 0.3, dur: 7.8, op: 0.5 },
    { top: "28%", left: "88%", size: 18, delay: 1.6, dur: 8.0, op: 0.35 },
    { top: "76%", left: "40%", size: 24, delay: 0.8, dur: 8.8, op: 0.4 },
    { top: "20%", left: "38%", size: 16, delay: 1.9, dur: 7.2, op: 0.3 },
    { top: "4%", left: "48%", size: 20, delay: 2.2, dur: 8.3, op: 0.35 },
    { top: "38%", left: "20%", size: 28, delay: 1.3, dur: 9.6, op: 0.45 },
    { top: "66%", left: "60%", size: 18, delay: 0.4, dur: 7.9, op: 0.35 },
    { top: "88%", left: "16%", size: 24, delay: 2.6, dur: 8.6, op: 0.4 },
    { top: "84%", left: "70%", size: 20, delay: 1.7, dur: 9.0, op: 0.35 },
  ];

  return (
    <div
      onClick={onDone}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background: `${COLORS.bg} url(${SKY_BG_IMG}) center bottom / cover no-repeat`,
      }}
    >
      {floaters.map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: f.top,
            left: f.left,
            animation: `${roams[i % roams.length]} ${f.dur}s ease-in-out ${f.delay}s infinite`,
          }}
        >
          <PenguinLineIcon size={f.size} opacity={f.op} />
        </div>
      ))}

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h1
          style={{
            fontFamily: "'Jua', 'Gaegu', sans-serif",
            fontSize: 44,
            margin: 0,
            letterSpacing: 1,
            color: COLORS.ink,
          }}
        >
          감정일기
        </h1>
      </div>

      <div
        className="splash-pulse"
        style={{
          position: "absolute",
          bottom: 34,
          background: "rgba(255,255,255,0.7)",
          borderRadius: 999,
          padding: "9px 22px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <span style={{ fontSize: 13, color: COLORS.ink, fontWeight: 700 }}>눌러서 시작하기</span>
      </div>
    </div>
  );
}


function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      kind: "hero",
      title: `안녕, 나는 ${CHARACTER_NAME}야!!`,
      body: "오늘 있었던 일이나 지금 기분,\n편하게 나한테 들려줘.",
    },
    {
      kind: "object",
      title: "이야기가 감정 오브젝트가 돼",
      body: "너의 이야기를 듣고,\n그 감정에 어울리는 작은 오브젝트와 짧은 일기로 남겨줄게.",
    },
    {
      kind: "archive",
      title: "차곡차곡 쌓인 감정 아카이브",
      body: "쌓인 기록은 날짜별, 감정별로\n언제든 다시 꺼내볼 수 있어.",
    },
  ];
  const total = steps.length;
  const cur = steps[step];
  const isLast = step === total - 1;

  // 좌우 스와이프로도 단계 이동 - 버튼은 그대로 두고 제스처를 추가로 지원한다.
  const touchStartRef = useRef(null);
  const SWIPE_THRESHOLD = 40; // 이 정도(px) 이상 수평 이동해야 스와이프로 인정

  function handleTouchStart(e) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // 수직 이동이 더 크면(위아래 스크롤 의도) 무시
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) {
      // 마지막 단계에서는 다음 단계가 없으니, "시작하기" 버튼과 동일하게 온보딩을 종료한다.
      if (isLast) onDone();
      else setStep(step + 1);
    } else if (step > 0) {
      setStep(step - 1);
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStartRef.current = null; }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: `${COLORS.bg} url(${SKY_BG_IMG}) center bottom / cover no-repeat`,
        // 이 화면은 세로 스크롤이 필요 없으므로 touchAction을 완전히 꺼서 브라우저가
        // 살짝 대각선으로 움직이는 스와이프를 세로 팬(스크롤) 제스처로 가로채
        // touchend 대신 touchcancel을 발생시키는 것을 막는다 - 이게 "가끔 스와이프가
        // 씹히는" 버그의 원인이었다.
        touchAction: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 16px 0" }}>
        {!isLast && (
          <button
            onClick={onDone}
            style={{
              border: "none",
              background: "none",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              textShadow: "0 1px 3px rgba(0,0,0,0.35)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            건너뛰기
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 28px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 22 }}>
          {cur.kind === "hero" && <PenguinCharacter reaction="idle" size={190} />}
          {cur.kind === "object" && (
            <div style={{ display: "flex", gap: 14 }}>
              <ObjectIcon type="candle" size={64} emotion="편안함" />
              <ObjectIcon type="trophy" size={64} emotion="기쁨" />
              <ObjectIcon type="letter" size={64} emotion="서운함" />
            </div>
          )}
          {cur.kind === "archive" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                background: "rgba(255,255,255,0.55)",
                borderRadius: 18,
                padding: 14,
              }}
            >
              {["candle", "trophy", "letter", "boat", "key", "feather"].map((t) => (
                <ObjectIcon key={t} type={t} size={48} emotion="편안함" />
              ))}
            </div>
          )}
        </div>

        <h2
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: COLORS.ink,
            margin: "0 0 10px",
            textShadow: "0 1px 6px rgba(255,255,255,0.6)",
            ...KEEP_WORDS_STYLE,
          }}
        >
          {renderBySentence(cur.title)}
        </h2>
        <p style={{ fontSize: 14, color: "#3A4550", lineHeight: 1.6, margin: 0, maxWidth: 260, ...KEEP_WORDS_STYLE }}>
          {renderBySentence(cur.body)}
        </p>
        {cur.kind === "hero" && (
          <p style={{ fontSize: 12, color: "#3A4550", margin: "16px 0 0", ...KEEP_WORDS_STYLE }}>
            1인 개발자가 직접 만든 감정일기예요.
          </p>
        )}
        {cur.kind === "archive" && <StorageNotice />}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingBottom: 14 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? COLORS.ink : "rgba(255,255,255,0.7)",
              transition: "width 0.2s",
            }}
          />
        ))}
      </div>

      <div style={{ padding: isLast ? "0 24px 52px" : "0 24px 28px" }}>
        <button
          onClick={() => (isLast ? onDone() : setStep(step + 1))}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 999,
            background: COLORS.ink,
            color: COLORS.white,
            fontSize: isLast ? 17 : 15,
            fontWeight: 700,
            padding: isLast ? "18px 0" : "13px 0",
            cursor: "pointer",
          }}
        >
          {isLast ? "시작하기" : "다음"}
        </button>
      </div>
    </div>
  );
}


function ChatScreen({ charLine, lastUserText, inputValue, setInputValue, onSend, showBookmark, onBookmark, nudge, isThinking, isGeneratingResult, scale, keyboardOffset }) {
  const composing = useRef(false);
  const safeScale = scale > 0 ? scale : 1;
  // 캔버스 전체가 transform: scale()로 축소되어 있어도, 입력창 글씨는 화면상 항상 최소
  // 16px 이상으로 보이도록 스케일의 역수를 곱해 보정한다(iOS 자동 확대 방지 효과도 겸함).
  const inputFontSize = 16 / safeScale;
  // keyboardOffset(실제 화면 px)만큼 입력창 바를 위로 띄운다. 캔버스 자체는
  // transform: scale()로 축소돼 있으므로, 화면상 실제로 keyboardOffset만큼만
  // 움직이려면 캔버스 좌표계(디자인 px) 기준으로는 scale로 나눈 만큼 옮겨야 한다.
  const inputBarLift = keyboardOffset > 0 ? keyboardOffset / safeScale : 0;
  // 캐릭터/말풍선 쪽은 입력창보다 이 만큼 더 위로 밀어서, 키보드가 떠 있는 동안에도
  // 텍스트끼리 겹치지 않을 최소한의 간격을 항상 확보한다. 입력창과 정확히 같은 값만
  // 쓰면 스케일 반올림이나 렌더 타이밍 차이로 둘이 살짝 겹치는 경우가 있었다.
  const KEYBOARD_CONTENT_GAP = 28;
  const contentLift = inputBarLift > 0 ? inputBarLift + KEYBOARD_CONTENT_GAP : 0;
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Pretendard', 'Noto Sans KR', system-ui, sans-serif",
        background: `${COLORS.bg} url(${SKY_BG_IMG}) center bottom / cover no-repeat`,
      }}
    >
      <div style={{ padding: "20px 16px 10px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 3 }}>
        <span style={{ fontSize: 16, color: "#FFFFFF", fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>{CHARACTER_NAME}와 오늘 이야기</span>
      </div>

      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "4px 20px 28px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // 입력창과 함께(그리고 조금 더) 위로 밀어야 캐릭터가 떠오른 입력창 뒤로
            // 가려지거나 겹치지 않는다 - 입력창만 translateY하면 흰 배경 입력창이
            // 캐릭터/말풍선 위로 겹쳐 올라오면서 텍스트가 침범해 보이거나 캐릭터가
            // 사라진 것처럼 보였다.
            transform: contentLift > 0 ? `translateY(-${contentLift}px)` : undefined,
            transition: "transform 0.22s ease-out",
          }}
        >
        {lastUserText && (
          <div
            style={{
              background: COLORS.white,
              border: `2.5px solid ${COLORS.ink}`,
              borderRadius: 18,
              padding: "10px 18px",
              fontSize: 13.5,
              fontWeight: 500,
              color: COLORS.ink,
              maxWidth: 230,
              textAlign: "center",
              lineHeight: 1.5,
              boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
              marginBottom: 10,
              ...KEEP_WORDS_STYLE,
            }}
          >
            {renderBySentence(lastUserText)}
          </div>
        )}

        <div style={{ position: "relative" }}>
          <div
            style={{
              background: COLORS.white,
              border: `2.5px solid ${COLORS.ink}`,
              borderRadius: 18,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 500,
              color: COLORS.ink,
              maxWidth: 230,
              textAlign: "center",
              boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
              ...KEEP_WORDS_STYLE,
            }}
          >
            {isThinking ? (
              <span className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              renderBySentence(charLine)
            )}
          </div>
        </div>

        <div style={{ position: "relative", marginTop: 16 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 4,
              transform: "translateX(-50%)",
              zIndex: 0,
              width: 155,
              height: 28,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(10,15,20,0.42) 0%, rgba(10,15,20,0.24) 45%, rgba(10,15,20,0) 78%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <PenguinCharacter reaction={nudge ? "bounce" : "idle"} size={260} />
          </div>
        </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: COLORS.white,
          borderRadius: "20px 20px 0 0",
          padding: "12px 16px 40px",
          transform: inputBarLift > 0 ? `translateY(-${inputBarLift}px)` : undefined,
          boxShadow: inputBarLift > 0 ? "0 -4px 16px rgba(0,0,0,0.12)" : undefined,
          // keyboardOffset은 visualViewport resize 이벤트로 뒤늦게, 값이 순간적으로 바뀌며
          // 들어온다. transition 없이 즉시 translateY를 적용하면 키보드가 올라오는 동안
          // 캐릭터가 잠깐 보였다가 입력창이 그 위로 "뚝" 튀어 덮는 것처럼 보여 깜빡이는
          // 느낌을 준다. 짧은 transition으로 부드럽게 밀어 올려 겹침이 자연스러운
          // 슬라이드처럼 보이게 한다.
          transition: "transform 0.22s ease-out, box-shadow 0.22s ease-out",
        }}
      >
        {showBookmark && (
          <button
            aria-label="이야기 남기기"
            onClick={onBookmark}
            disabled={isThinking || isGeneratingResult}
            className="ea-btn bookmark-pop"
            style={{
              position: "absolute",
              right: 16,
              top: -46,
              zIndex: 5,
              background: COLORS.amber,
              color: COLORS.ink,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 999,
              boxShadow: "0 3px 8px rgba(239,159,39,0.4)",
              fontSize: 12.5,
              fontWeight: 600,
              opacity: isGeneratingResult ? 0.6 : 1,
              cursor: isGeneratingResult ? "default" : "pointer",
            }}
          >
            {isGeneratingResult ? (
              <span className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 64 64" role="img" aria-hidden="true">
                  <path d="M18 14 L46 14 L46 50 L18 50 Z" fill={COLORS.white} />
                  <path d="M18 14 L22 14 L22 50 L18 50 Z" fill="#D8A34E" />
                  <path d="M27 14 L27 42 L31 38 L35 42 L35 14 Z" fill="#D85A30" />
                </svg>
                이야기 남기기
              </>
            )}
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            className="ea-input"
            style={{ flex: 1, fontSize: inputFontSize }}
            type="text"
            placeholder="편하게 이야기해줘"
            value={inputValue}
            maxLength={2000}
            disabled={isThinking || isGeneratingResult}
            onCompositionStart={() => { composing.current = true; }}
            onCompositionEnd={() => { composing.current = false; }}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !composing.current && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button
            aria-label="전송"
            disabled={isThinking || isGeneratingResult || !inputValue.trim()}
            onClick={onSend}
            className="ea-btn"
            style={{
              width: 34,
              height: 34,
              background: COLORS.ink,
              color: COLORS.cream,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 화면 2: 감정 처리 (흡수 → 반응 → 오브젝트 등장) ---------- */
function ProcessingScreen({ stage, lastUserText, result }) {
  const reaction = EMOTION_REACTION[result.primaryEmotion] || "bounce";
  const label =
    stage === 1
      ? "이야기를 받아들이는 중"
      : stage === 2
      ? `같이 ${result.primaryEmotion}을 느껴`
      : stage === 3
      ? "감정을 정리하는 중"
      : stage === 5
      ? `${CHARACTER_NAME}에게 흡수되는 중`
      : "오브젝트가 완성됐어";

  const CHAR_SIZE = 130;
  // 흡수되는 지점 (캐릭터 중심 부근)
  const absorbX = CHAR_SIZE * 0.5;
  const absorbY = CHAR_SIZE * 0.45;

  // 특별 포즈: 감정을 정리하는 단계엔 두루마리 포즈
  const charPose = stage === 3 ? "scroll" : null;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 0",
        background: `${COLORS.bg} url(${SKY_BG_IMG}) center bottom / cover no-repeat`,
      }}
    >
      {stage <= 1 && (
        <div
          className={stage === 1 ? "bubble-fly" : ""}
          style={{
            background: COLORS.white,
            border: `2px solid ${COLORS.ink}`,
            borderRadius: 12,
            padding: "7px 13px",
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 8,
            maxWidth: 220,
            textAlign: "center",
          }}
        >
          {lastUserText || "오늘 있었던 이야기"}
        </div>
      )}

      <div style={{ position: "relative", width: CHAR_SIZE, height: CHAR_SIZE + 16 }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 4,
            transform: "translateX(-50%)",
            zIndex: 0,
            width: 78,
            height: 15,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(10,15,20,0.42) 0%, rgba(10,15,20,0.24) 45%, rgba(10,15,20,0) 78%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <PenguinCharacter reaction={stage === 1 ? "gulp" : stage === 2 ? reaction : stage === 5 ? "gulp" : null} size={CHAR_SIZE} pose={charPose} />
        </div>
        {stage === 5 && (
          <div
            className="bag-sparkle"
            style={{ position: "absolute", left: absorbX - 14, top: absorbY - 14, width: 28, height: 28, pointerEvents: "none", zIndex: 2 }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <path d="M14 2 L16 11 L25 13 L16 15 L14 24 L12 15 L3 13 L12 11 Z" fill="#FAC775" />
            </svg>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12.5, color: COLORS.textSecondary, fontWeight: 500, minHeight: 16, marginTop: 6 }}>
        {label}
      </p>

      {stage >= 4 && (
        <div
          className={stage === 5 ? "card-fly-to-bag" : "card-in"}
          style={{
            marginTop: 8,
            background: COLORS.white,
            borderRadius: 16,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <ObjectIcon type={result.objectType} size={52} emotion={result.primaryEmotion} />
          <p style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, margin: "8px 0 6px" }}>
            {result.objectName}
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            <EmotionTag label={result.primaryEmotion} />
            <EmotionTag label={result.secondaryEmotion} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 화면 3: 기록 결과 (수정 가능) ---------- */
const EMOTION_OPTIONS = Object.keys(EMOTION_STYLE);

function EmotionSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontSize: 10,
        background: (EMOTION_STYLE[value] || {}).bg || "#F1EFE8",
        color: (EMOTION_STYLE[value] || {}).text || "#444441",
        padding: "2px 6px",
        borderRadius: 999,
        fontWeight: 500,
        border: "none",
        outline: "none",
      }}
    >
      {EMOTION_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function ResultScreen({ result, setResult, onSave }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "10px 18px 16px",
        overflowY: "auto",
        background: `${COLORS.bg} url(${SKY_BG_IMG}) center bottom / cover no-repeat`,
      }}
    >
      <p style={{ fontSize: 12, color: "#4A5A63", textAlign: "center", margin: "4px 0 10px" }}>기록 결과</p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 12 }}>
        <ObjectIcon type={result.objectType} size={60} emotion={result.primaryEmotion} />
        <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.ink, margin: "8px 0 2px" }}>{result.objectName}</p>
        <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "0 0 8px" }}>{result.oneLine}</p>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <EmotionSelect
            value={result.primaryEmotion}
            onChange={(v) => setResult({ ...result, primaryEmotion: v })}
          />
          <EmotionSelect
            value={result.secondaryEmotion}
            onChange={(v) => setResult({ ...result, secondaryEmotion: v })}
          />
        </div>
        <p style={{ fontSize: 9.5, color: COLORS.textMuted, margin: "6px 0 0" }}>감정 태그를 눌러 직접 바꿀 수 있어</p>
      </div>

      <div style={{ background: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "0 0 6px" }}>일기 (수정 가능)</p>
        <textarea
          className="ea-diary"
          rows={5}
          value={result.diaryText}
          onChange={(e) => setResult({ ...result, diaryText: e.target.value })}
        />
      </div>

      <div style={{ background: COLORS.white, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <PenguinCharacter size={30} />
        <p style={{ fontSize: 12, color: COLORS.textSecondary, margin: 0, fontStyle: "italic" }}>
          {result.characterLine}
        </p>
      </div>

      <button
        className="ea-btn"
        onClick={onSave}
        style={{ background: COLORS.ink, color: COLORS.cream, padding: 11, width: "100%" }}
      >
        아카이브에 저장
      </button>
    </div>
  );
}

/* ---------- 화면 4: 감정 아카이브 (날짜별 리스트 + 필터) ---------- */
function StorageNotice() {
  return (
    <p style={{ fontSize: 11, lineHeight: 1.5, color: "#3A4550", margin: "10px 18px", textAlign: "center", ...KEEP_WORDS_STYLE }}>
      완성된 기록은 이 기기의 브라우저에만 저장되며,<br />서비스 서버에는 보관하지 않아요.<br />
      AI 대화·일기 생성을 위해 대화 내용은 AI 제공업체로 전송돼요.<br />
      브라우저 데이터를 지우면 기록도 사라져요.
    </p>
  );
}

function ArchiveScreen({ entries, onOpen, onReset }) {
  const [filterMode, setFilterMode] = useState("all"); // all | date | emotion
  const [dateOrder, setDateOrder] = useState("desc"); // desc: 최신순, asc: 오래된순
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [page, setPage] = useState(0); // 3x3 페이지 단위로 넘김
  const [confirmingReset, setConfirmingReset] = useState(false);

  const uniqueEmotions = Array.from(
    new Set(entries.flatMap((e) => [e.primaryEmotion, e.secondaryEmotion]))
  );

  let visibleEntries = entries;
  if (filterMode === "date") {
    visibleEntries = [...entries].reverse().slice();
    if (dateOrder === "desc") visibleEntries = entries;
  }
  if (filterMode === "emotion" && selectedEmotion) {
    visibleEntries = entries.filter(
      (e) => e.primaryEmotion === selectedEmotion || e.secondaryEmotion === selectedEmotion
    );
  }

  const PAGE_SIZE = 9; // 3x3
  const pageCount = Math.max(1, Math.ceil(visibleEntries.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pagedEntries = visibleEntries.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function changeFilter(mode) {
    setFilterMode(mode);
    if (mode !== "emotion") setSelectedEmotion(null);
    setPage(0);
  }
  function changeEmotion(em) {
    setSelectedEmotion(em === selectedEmotion ? null : em);
    setPage(0);
  }
  function changeDateOrder(order) {
    setDateOrder(order);
    setPage(0);
  }

  const FILTERS = [
    { key: "all", label: "전체" },
    { key: "date", label: "날짜별" },
    { key: "emotion", label: "감정별" },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.9) 1px, transparent 2px) 0 0/38px 38px," +
          "radial-gradient(circle at 68% 55%, rgba(255,255,255,0.7) 1px, transparent 2px) 0 0/52px 52px," +
          "radial-gradient(circle at 40% 80%, rgba(255,255,255,0.6) 1px, transparent 2px) 0 0/46px 46px," +
          "radial-gradient(ellipse at 50% -10%, #F1E9FF 0%, #DCEBFC 45%, #C9E4F2 100%)",
      }}
    >
      <div style={{ padding: "22px 18px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: COLORS.ink, margin: 0 }}>감정 아카이브</p>
        {!confirmingReset && (
          <button
            onClick={() => setConfirmingReset(true)}
            style={{ border: "none", background: "none", fontSize: 11, color: COLORS.textMuted, cursor: "pointer", padding: 4 }}
          >
            초기화
          </button>
        )}
      </div>
      {confirmingReset && (
        <div
          style={{
            margin: "0 18px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 10,
            padding: "6px 10px",
          }}
        >
          <span style={{ fontSize: 11, color: COLORS.textSecondary, marginRight: "auto" }}>기록을 전부 되돌릴까?</span>
          <button
            onClick={() => {
              onReset();
              setConfirmingReset(false);
            }}
            style={{ border: "none", background: "none", fontSize: 11, color: "#B0431F", fontWeight: 700, cursor: "pointer", padding: 4 }}
          >
            확인
          </button>
          <button
            onClick={() => setConfirmingReset(false)}
            style={{ border: "none", background: "none", fontSize: 11, color: COLORS.textMuted, cursor: "pointer", padding: 4 }}
          >
            취소
          </button>
        </div>
      )}

      <div className="no-scrollbar" style={{ display: "flex", gap: 6, padding: "0 16px 8px", overflowX: "auto" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => changeFilter(f.key)}
            style={{
              fontSize: 11,
              background: filterMode === f.key ? COLORS.ink : COLORS.white,
              color: filterMode === f.key ? COLORS.cream : COLORS.textSecondary,
              padding: "5px 12px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              border: filterMode === f.key ? "none" : "0.5px solid #D8D4C7",
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filterMode === "date" && (
        <div style={{ display: "flex", gap: 6, padding: "0 16px 10px" }}>
          <button
            onClick={() => changeDateOrder("desc")}
            style={{
              fontSize: 10.5,
              background: "none",
              border: "none",
              color: dateOrder === "desc" ? COLORS.ink : COLORS.textMuted,
              fontWeight: dateOrder === "desc" ? 600 : 400,
              cursor: "pointer",
              padding: 0,
            }}
          >
            최신순
          </button>
          <span style={{ color: COLORS.textMuted, fontSize: 10.5 }}>·</span>
          <button
            onClick={() => changeDateOrder("asc")}
            style={{
              fontSize: 10.5,
              background: "none",
              border: "none",
              color: dateOrder === "asc" ? COLORS.ink : COLORS.textMuted,
              fontWeight: dateOrder === "asc" ? 600 : 400,
              cursor: "pointer",
              padding: 0,
            }}
          >
            오래된순
          </button>
        </div>
      )}

      {filterMode === "emotion" && (
        <div style={{ display: "flex", gap: 6, padding: "0 16px 10px", flexWrap: "wrap" }}>
          {uniqueEmotions.map((em) => (
            <button
              key={em}
              onClick={() => changeEmotion(em)}
              style={{
                fontSize: 10,
                background: selectedEmotion === em ? COLORS.ink : (EMOTION_STYLE[em] || {}).bg,
                color: selectedEmotion === em ? COLORS.cream : (EMOTION_STYLE[em] || {}).text,
                padding: "3px 10px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
              }}
            >
              {em}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 14px 8px" }}>
        <div className="no-scrollbar" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto" }}>
          {visibleEntries.length === 0 && (
            <p style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center" }}>
              {filterMode === "emotion" && !selectedEmotion ? "감정을 선택해봐" : "해당하는 기록이 없어"}
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {pagedEntries.map((entry, i) => (
              <button
                key={entry.id}
                onClick={() => onOpen(entry)}
                title={entry.objectName}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <div
                  className="item-slot"
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.22))",
                    animationDelay: `${(i % 9) * 0.05}s, ${(i % 9) * 0.05 + 0.65}s`,
                    animationDuration: `0.65s, ${2.3 + (i % 5) * 0.18}s`,
                  }}
                >
                  <ObjectIcon type={entry.objectType} size={82} emotion={entry.primaryEmotion} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {visibleEntries.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, paddingTop: 16 }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: safePage === 0 ? "rgba(255,255,255,0.4)" : COLORS.white,
                color: safePage === 0 ? COLORS.textMuted : COLORS.ink,
                fontSize: 16,
                fontWeight: 700,
                cursor: safePage === 0 ? "default" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
              }}
            >
              ‹
            </button>
            <div style={{ display: "flex", gap: 5 }}>
              {Array.from({ length: pageCount }).map((_, p) => (
                <div
                  key={p}
                  style={{
                    width: p === safePage ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: p === safePage ? COLORS.ink : "rgba(0,0,0,0.2)",
                    transition: "width 0.2s",
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage === pageCount - 1}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: safePage === pageCount - 1 ? "rgba(255,255,255,0.4)" : COLORS.white,
                color: safePage === pageCount - 1 ? COLORS.textMuted : COLORS.ink,
                fontSize: 16,
                fontWeight: 700,
                cursor: safePage === pageCount - 1 ? "default" : "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>
      <StorageNotice />
    </div>
  );
}

/* ---------- 아카이브 상세보기 (수정/삭제 기능 포함) ---------- */
function DetailScreen({ entry, onBack, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState({
    objectName: entry.objectName,
    diaryText: entry.diaryText,
    primaryEmotion: entry.primaryEmotion,
    secondaryEmotion: entry.secondaryEmotion,
  });

  function startEdit() {
    setDraft({
      objectName: entry.objectName,
      diaryText: entry.diaryText,
      primaryEmotion: entry.primaryEmotion,
      secondaryEmotion: entry.secondaryEmotion,
    });
    setIsEditing(true);
  }

  function saveEdit() {
    onUpdate(entry.id, draft);
    setIsEditing(false);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 4px" }}>
        <button onClick={onBack} style={{ border: "none", background: "none", fontSize: 16, cursor: "pointer" }} aria-label="뒤로">
          ←
        </button>
        <p style={{ fontSize: 13, color: "#4A5A63", margin: 0 }}>{getEntryDate(entry)}</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 14px" }}>
          <ObjectIcon type={entry.objectType} size={60} emotion={entry.primaryEmotion} />
          {isEditing ? (
            <input
              className="ea-input"
              style={{ textAlign: "center", marginTop: 8, width: "80%" }}
              value={draft.objectName}
              onChange={(e) => setDraft({ ...draft, objectName: e.target.value })}
            />
          ) : (
            <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.ink, margin: "8px 0 2px" }}>{entry.objectName}</p>
          )}
          <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "0 0 8px" }}>{entry.oneLine}</p>
          <div style={{ display: "flex", gap: 4 }}>
            {isEditing ? (
              <>
                <EmotionSelect value={draft.primaryEmotion} onChange={(v) => setDraft({ ...draft, primaryEmotion: v })} />
                <EmotionSelect value={draft.secondaryEmotion} onChange={(v) => setDraft({ ...draft, secondaryEmotion: v })} />
              </>
            ) : (
              <>
                <EmotionTag label={entry.primaryEmotion} />
                <EmotionTag label={entry.secondaryEmotion} />
              </>
            )}
          </div>
        </div>

        <div style={{ background: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "0 0 6px" }}>그날의 일기</p>
          {isEditing ? (
            <textarea
              className="ea-diary"
              rows={5}
              value={draft.diaryText}
              onChange={(e) => setDraft({ ...draft, diaryText: e.target.value })}
            />
          ) : (
            <p style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.7, margin: 0 }}>{entry.diaryText}</p>
          )}
        </div>

        <div style={{ background: COLORS.white, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <PenguinCharacter size={30} />
          <p style={{ fontSize: 12, color: COLORS.textSecondary, margin: 0, fontStyle: "italic" }}>{entry.characterLine}</p>
        </div>

        {!confirmingDelete ? (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {isEditing ? (
              <>
                <button
                  className="ea-btn"
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, background: COLORS.white, border: "0.5px solid #D8D4C7", padding: 9 }}
                >
                  취소
                </button>
                <button
                  className="ea-btn"
                  onClick={saveEdit}
                  style={{ flex: 1, background: COLORS.ink, color: COLORS.cream, padding: 9 }}
                >
                  저장
                </button>
              </>
            ) : (
              <>
                <button
                  className="ea-btn"
                  onClick={startEdit}
                  style={{ flex: 1, background: COLORS.white, border: "0.5px solid #D8D4C7", padding: 9 }}
                >
                  수정
                </button>
                <button
                  className="ea-btn"
                  onClick={() => setConfirmingDelete(true)}
                  style={{ flex: 1, background: COLORS.white, border: "0.5px solid #D8D4C7", padding: 9, color: "#A32D2D" }}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 14, background: "#FBEAEA", borderRadius: 12, padding: 12 }}>
            <p style={{ fontSize: 12, color: "#712B13", margin: "0 0 8px" }}>이 기록을 정말 삭제할까? 되돌릴 수 없어.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="ea-btn"
                onClick={() => setConfirmingDelete(false)}
                style={{ flex: 1, background: COLORS.white, border: "0.5px solid #D8D4C7", padding: 8 }}
              >
                취소
              </button>
              <button
                className="ea-btn"
                onClick={() => onDelete(entry.id)}
                style={{ flex: 1, background: "#A32D2D", color: "#FFF", padding: 8 }}
              >
                삭제하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 하단 내비게이션 (프로토타입 편의용) ---------- */
function BottomNav({ screen, setScreen, disabled }) {
  const items = [
    { key: "chat", label: "대화" },
    { key: "archive", label: "아카이브" },
  ];
  return (
    <div style={{ display: "flex", background: COLORS.white, borderTop: "0.5px solid #E3DCC8" }}>
      {items.map((it) => (
        <button
          key={it.key}
          disabled={disabled}
          onClick={() => setScreen(it.key)}
          style={{
            flex: 1,
            border: "none",
            background: "none",
            padding: "10px 0",
            fontSize: 12,
            fontWeight: screen === it.key ? 600 : 400,
            color: screen === it.key ? COLORS.ink : COLORS.textMuted,
            cursor: "pointer",
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
