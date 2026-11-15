import { afterEach, describe, expect, it, vi } from "vitest";
import { buildReminderIcs } from "@/lib/client/ics";

afterEach(() => vi.useRealTimers());

const field = (ics: string, name: string) => ics.split("\r\n").find((l) => l.startsWith(`${name}:`))?.slice(name.length + 1);

describe("buildReminderIcs", () => {
  it("schedules a daily 10-minute event later today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15, 9, 0));
    const ics = buildReminderIcs("19:30", "Leo");
    expect(field(ics, "DTSTART")).toBe("20261115T193000");
    expect(field(ics, "DTEND")).toBe("20261115T194000");
    expect(field(ics, "RRULE")).toBe("FREQ=DAILY");
    expect(field(ics, "SUMMARY")).toBe("10 minutes of reading with Leo");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("moves to tomorrow once tonight's time has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15, 21, 0));
    expect(field(buildReminderIcs("19:30", "Leo"), "DTSTART")).toBe("20261116T193000");
  });

  it("falls back to 19:30 and a generic name for bad input", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15, 9, 0));
    const ics = buildReminderIcs("7pm", "");
    expect(field(ics, "DTSTART")).toBe("20261115T193000");
    expect(field(ics, "SUMMARY")).toBe("10 minutes of reading with your child");
  });
});
