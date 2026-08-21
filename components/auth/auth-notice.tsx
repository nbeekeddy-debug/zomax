export type AuthNoticeValue = { tone: "error" | "success" | "info"; text: string } | null;

function noticeClass(tone: "error" | "success" | "info") {
  if (tone === "error") return "border-rose-200 bg-rose-50 text-rose-800";
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-orange-200 bg-orange-50 text-orange-800";
}

export function AuthNotice({ notice }: { notice: AuthNoticeValue }) {
  if (!notice) return null;
  return (
    <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-2xl border px-4 py-3 text-xs font-bold leading-5 ${noticeClass(notice.tone)}`}>
      {notice.text}
    </p>
  );
}
