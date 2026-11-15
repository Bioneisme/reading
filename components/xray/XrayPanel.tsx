"use client";

import { useEffect, useMemo, useState } from "react";
import { buildXray, coreLexicon, type Lexicon, type XrayTile } from "@/lib/engine";

function Tile({ tile, delay }: { tile: XrayTile; delay: number }) {
  const tone = tile.broken
    ? "border-[#E8AE1C] bg-lamp text-ink shadow-[0_4px_0_#D99A0B]"
    : "border-line-strong bg-card text-ink shadow-[0_4px_0_#E4DBCB]";
  return (
    <li style={{ animationDelay: `${delay}ms` }} className="flex animate-rise flex-col items-center gap-1.5">
      <span
        className={`inline-flex h-[52px] min-w-[42px] items-center justify-center rounded-chip border-2 px-2 font-read text-[26px] font-bold sm:h-[58px] sm:min-w-[46px] sm:px-2.5 sm:text-[30px] ${tone} ${
          tile.silent ? "border-dashed" : ""
        }`}
      >
        {tile.letters}
      </span>
      <span className="text-[13px] font-black text-ink-2">{tile.silent ? "quiet" : `/${tile.sound}/`}</span>
      {tile.broken && !tile.silent && (
        <span className="whitespace-nowrap text-[12px] font-black text-needs-ink">{tile.said ? `→ /${tile.said}/` : "left out"}</span>
      )}
    </li>
  );
}

export function XrayPanel({ word, said, name, lex }: { word: string; said: string | null; name: string; lex?: Lexicon }) {
  const x = useMemo(() => buildXray(word, said, lex ?? coreLexicon), [word, said, lex]);
  const [tip, setTip] = useState<{ key: string; text: string | null } | null>(null);
  const key = `${word}:${said ?? ""}`;

  useEffect(() => {
    let alive = true;
    fetch("/api/xray", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, said }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { tip?: string | null } | null) => alive && setTip({ key, text: d?.tip ?? null }))
      .catch(() => alive && setTip({ key, text: null }));
    return () => {
      alive = false;
    };
  }, [word, said, key]);

  if (!x) {
    return <p className="mt-3 text-sm font-bold text-ink-3">We can&apos;t break this word into sounds yet.</p>;
  }

  const loaded = tip?.key === key;
  const fact = (x.facts[x.facts.length - 1] ?? "").replace(/\bthe child\b/g, name);
  const line = loaded && tip.text ? tip.text.replace(/\byour child\b/gi, name) : fact;

  return (
    <div className="mt-3 animate-fade rounded-[18px] border-2 border-indigo-line bg-indigo-tint px-4 py-4">
      <div className="text-[11px] font-black uppercase tracking-[0.12em] text-indigo">Error x-ray · {x.skillName}</div>
      <ol aria-label={`Sounds in ${x.word}`} className="mt-3 flex flex-wrap items-start gap-1.5 sm:gap-2">
        {x.tiles.map((t, i) => (
          <Tile key={`${t.letters}-${i}`} tile={t} delay={i * 70} />
        ))}
      </ol>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-extrabold text-ink-2">
        <span>
          Word sounds: <span className="font-read text-base text-ink">/{x.wordSound}/</span>
        </span>
        <span>
          {name} said:{" "}
          <span className="font-read text-base text-[#2B2290]">{x.saidSound ? `/${x.saidSound}/` : "(skipped)"}</span>
        </span>
      </p>
      <p aria-live="polite" className="mt-3 text-[15px] font-bold leading-normal text-ink">
        {line}
        {loaded && tip.text && (
          <span className="ml-1.5 inline-block rounded-full bg-card px-2 py-px align-middle text-[10px] font-black uppercase tracking-[0.08em] text-ink-3">
            AI, from engine facts
          </span>
        )}
      </p>
    </div>
  );
}
