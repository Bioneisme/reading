import type { ReactNode } from "react";

function Tile({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center justify-center border-2 font-read font-bold ${className}`}>{children}</span>
  );
}

const big = "h-[74px] w-[62px] rounded-[18px] text-[42px]";
const small = "h-[46px] rounded-[13px] text-[22px]";
const lampTile = "bg-lamp border-[#E8AE1C]";
const indigoTile = "bg-indigo border-[#3F33CF] text-white";
const whiteTile = "bg-card border-edge";

export const GRADE_ART: Record<string, { art: ReactNode; artClass: string; ages: string }> = {
  K: {
    ages: "Ages 5-6",
    artClass: "h-24 bg-lamp-tint",
    art: (
      <Tile className={`-mt-8 h-[74px] w-[66px] -rotate-[5deg] rounded-[18px] text-[42px] shadow-[0_6px_0_#D99A0B] ${lampTile}`}>K</Tile>
    ),
  },
  "1": {
    ages: "Ages 6-7",
    artClass: "h-24 bg-indigo-tint",
    art: (
      <span className="-mt-8 flex items-end gap-1">
        <Tile className={`${big} -rotate-[4deg] shadow-[0_6px_0_#3328B0] ${indigoTile}`}>1</Tile>
        <Tile className={`${small} w-11 rotate-[6deg] shadow-[0_4px_0_#E4DBCB] ${whiteTile}`}>st</Tile>
      </span>
    ),
  },
  "2": {
    ages: "Ages 7-8",
    artClass: "h-24 bg-[#E6F5EC]",
    art: (
      <span className="-mt-8 flex items-end gap-1">
        <Tile className={`${big} rotate-[4deg] shadow-[0_6px_0_#C9DCCF] ${whiteTile}`}>2</Tile>
        <Tile className={`${small} w-12 -rotate-[6deg] shadow-[0_4px_0_#D99A0B] ${lampTile}`}>nd</Tile>
      </span>
    ),
  },
  "3": {
    ages: "Ages 8-9",
    artClass: "h-24 bg-needs-tint",
    art: (
      <span className="-mt-8 flex items-end gap-1">
        <Tile className={`${big} -rotate-[3deg] shadow-[0_6px_0_#EBCDB6] ${whiteTile}`}>3</Tile>
        <Tile className={`${small} w-11 rotate-[7deg] shadow-[0_4px_0_#3328B0] ${indigoTile}`}>rd</Tile>
      </span>
    ),
  },
};

export const EVENING_ART: Record<string, { art: ReactNode; artClass: string }> = {
  Easy: {
    artClass: "h-[88px] bg-lamp-tint",
    art: (
      <svg width="96" height="96" viewBox="0 0 96 96" className="-mt-10 h-auto w-[min(96px,80%)]">
        <g stroke="#E5A50F" strokeWidth="6" strokeLinecap="round">
          <path d="M48 6v12M48 78v12M6 48h12M78 48h12M18 18l8 8M70 70l8 8M78 18l-8 8M26 70l-8 8" />
        </g>
        <circle cx="48" cy="48" r="22" fill="#FFC93C" stroke="#E5A50F" strokeWidth="4" />
      </svg>
    ),
  },
  "Some frustration": {
    artClass: "h-[88px] bg-indigo-tint",
    art: (
      <svg width="110" height="90" viewBox="0 0 110 90" className="-mt-9 h-auto w-[min(110px,90%)]">
        <circle cx="72" cy="30" r="18" fill="#FFC93C" stroke="#E5A50F" strokeWidth="4" />
        <path d="M28 78h52a18 18 0 0 0 0-36 26 26 0 0 0-49-6A21 21 0 0 0 28 78z" fill="#FFFFFF" stroke="#B8B0F5" strokeWidth="4" />
      </svg>
    ),
  },
  "Tears or avoidance": {
    artClass: "h-[88px] bg-improving-tint",
    art: (
      <svg width="110" height="96" viewBox="0 0 110 96" className="-mt-[34px] h-auto w-[min(110px,90%)]">
        <path d="M28 60h52a18 18 0 0 0 0-36 26 26 0 0 0-49-6A21 21 0 0 0 28 60z" fill="#E3DFFF" stroke="#8F89E0" strokeWidth="4" />
        <path d="M36 70l-5 12M56 70l-5 12M76 70l-5 12" stroke="#4B3FE0" strokeWidth="5" strokeLinecap="round" />
      </svg>
    ),
  },
};

export const GOAL_ART: Record<string, { art: ReactNode; artClass: string }> = {
  "Read on their own": {
    artClass: "h-[88px] bg-indigo-tint",
    art: (
      <svg width="110" height="86" viewBox="0 0 110 86" className="-mt-[34px] h-auto w-[min(110px,90%)]">
        <path d="M55 18C44 9 28 6 10 6v62c18 0 34 3 45 12 11-9 27-12 45-12V6C82 6 66 9 55 18z" fill="#FFFFFF" stroke="#4B3FE0" strokeWidth="4" strokeLinejoin="round" />
        <path d="M55 18v62" stroke="#4B3FE0" strokeWidth="4" />
        <path d="M20 24h24M20 36h24M20 48h18M66 24h24M66 36h24M66 48h18" stroke="#CFC9FF" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },
  "Catch up with the class": {
    artClass: "h-[88px] bg-lamp-tint",
    art: (
      <svg width="110" height="90" viewBox="0 0 110 90" className="-mt-[38px] h-auto w-[min(110px,90%)]">
        <path d="M8 82h30V60h26V38h26V16h12v66z" fill="#FFC93C" stroke="#E5A50F" strokeWidth="4" strokeLinejoin="round" />
        <path d="M14 50L44 22" stroke="#4B3FE0" strokeWidth="6" strokeLinecap="round" />
        <path d="M30 20h16v16" fill="none" stroke="#4B3FE0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  "Less stress at bedtime": {
    artClass: "h-[88px] bg-night",
    art: (
      <svg width="100" height="96" viewBox="0 0 100 96" className="-mt-[38px] h-auto w-[min(100px,85%)]">
        <path d="M76 62A36 36 0 0 1 34 14a36 36 0 1 0 42 48z" fill="#FFC93C" stroke="#E5A50F" strokeWidth="4" strokeLinejoin="round" />
        <path d="M72 14l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#B8B0F5" />
        <circle cx="86" cy="42" r="4" fill="#B8B0F5" />
      </svg>
    ),
  },
};
