function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function buildReminderIcs(time: string, childName: string): string {
  const [hh, mm] = (/^\d{2}:\d{2}$/.test(time) ? time : "19:30").split(":").map(Number);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
  if (start.getTime() < now.getTime()) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + 10 * 60000);
  const local = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const name = childName || "your child";
  const uid = `readly-reminder-${Date.now()}@readly.app`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Readly//Reading reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(start)}`,
    `DTEND:${local(end)}`,
    "RRULE:FREQ=DAILY",
    `SUMMARY:10 minutes of reading with ${name}`,
    "DESCRIPTION:Open Readly and start tonight's 10-minute session.",
    "BEGIN:VALARM",
    "TRIGGER:-PT0M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reading time",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadReminderIcs(time: string, childName: string) {
  try {
    const blob = new Blob([buildReminderIcs(time, childName)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "readly-reading-reminder.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
  }
}
