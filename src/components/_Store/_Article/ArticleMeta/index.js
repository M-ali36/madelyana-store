"use client";

import { HiCalendar, HiClock } from "react-icons/hi";
import { useFormatter, useTranslations } from "next-intl";

export default function ArticleMeta({ date, description }) {
  const format = useFormatter();
  const t = useTranslations('article');

  // ⭐ Correct next-intl date formatting
  const formattedDate = format.dateTime(new Date(date), {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  // ⭐ Reading time
  const readingTime = description
    ? Math.ceil(description.split(" ").length / 200)
    : 1;

  return (
    <div className="flex justify-center items-center gap-8 mt-6 text-neutral-600">

      {/* DATE */}
      <div className="flex items-center gap-2">
        <HiCalendar className="text-xl text-neutral-500" />
        <span>{formattedDate}</span>
      </div>

      {/* READ TIME */}
      <div className="flex items-center gap-2">
        <HiClock className="text-xl text-neutral-500" />
        <span>
          {`${readingTime} ${t('minRead')}`}
        </span>
      </div>
    </div>
  );
}
