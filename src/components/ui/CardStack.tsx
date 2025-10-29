"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

export type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export type CardStackProps = {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  intervalMs?: number;
};

export function CardStack({
  items,
  offset,
  scaleFactor,
  intervalMs,
}: CardStackProps) {
  const CARD_OFFSET = offset ?? 10;
  const SCALE_FACTOR = scaleFactor ?? 0.06;
  const INTERVAL_MS = intervalMs ?? 5000;

  const [cards, setCards] = useState<Card[]>(() => items);
  const intervalRef = useRef<number | null>(null);

  const startFlipping = useMemo(
    () => () => {
      if (intervalRef.current != null) return;
      intervalRef.current = window.setInterval(() => {
        setCards((prevCards) => {
          if (prevCards.length <= 1) return prevCards;
          const next = [...prevCards];
          const last = next.pop()!;
          next.unshift(last);
          return next;
        });
      }, INTERVAL_MS);
    },
    [INTERVAL_MS]
  );

  useEffect(() => {
    startFlipping();
    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startFlipping]);

  useEffect(() => {
    setCards(items);
  }, [items]);

  return (
    <div className="relative h-60 w-60 md:h-60 md:w-96">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute dark:bg-black bg-white h-60 w-60 md:h-60 md:w-96 rounded-3xl p-4 shadow-xl border border-neutral-200 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-between"
          style={{ transformOrigin: "top center" }}
          animate={{
            top: index * -CARD_OFFSET,
            scale: 1 - index * SCALE_FACTOR,
            zIndex: cards.length - index,
          }}
        >
          <div className="font-normal text-neutral-700 dark:text-neutral-200">{card.content}</div>
          <div>
            <p className="text-neutral-500 font-medium dark:text-white">{card.name}</p>
            <p className="text-neutral-400 font-normal dark:text-neutral-200">{card.designation}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default CardStack;


