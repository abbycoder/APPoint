import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Appointment, Assignment } from "../types";
import { formatTime, toDateOnlyValue } from "./time";

const NAVY: [number, number, number] = [31, 58, 99];
const ROW_TINT: [number, number, number] = [247, 248, 250];

interface MonthGroup<T> {
  key: string;
  label: string;
  items: T[];
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function groupByMonth<T>(
  items: T[],
  getDate: (item: T) => Date,
): MonthGroup<T>[] {
  const map = new Map<string, MonthGroup<T>>();

  for (const item of items) {
    const d = getDate(item);
    const key = monthKey(d);
    if (!map.has(key)) map.set(key, { key, label: monthLabel(d), items: [] });
    map.get(key)!.items.push(item);
  }

  return [...map.values()]
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map((group) => ({
      ...group,
      items: [...group.items].sort(
        (a, b) => getDate(a).getTime() - getDate(b).getTime(),
      ),
    }));
}

function addDocHeader(doc: jsPDF, title: string): void {
  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.text(title, 40, 40);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 40, 58);
  doc.setTextColor(0);
}

function addMonthHeading(doc: jsPDF, label: string): void {
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text(label, 40, 82);
  doc.setTextColor(0);
}

function filenameFor(prefix: string, groups: MonthGroup<unknown>[]): string {
  if (groups.length === 0) return `${prefix}-empty.pdf`;
  const first = groups[0].key;
  const last = groups[groups.length - 1].key;
  const range = first === last ? first : `${first}_to_${last}`;
  return `${prefix}-${range}.pdf`;
}

export function exportAppointmentsToPdf(appointments: Appointment[]): string {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const groups = groupByMonth(appointments, (a) => new Date(a.datetime));

  if (groups.length === 0) {
    addDocHeader(doc, "APPoint — Appointments");
    doc.setFontSize(10);
    doc.text("No appointments to export.", 40, 90);
  }

  groups.forEach((group, index) => {
    if (index > 0) doc.addPage();
    addDocHeader(doc, "APPoint — Appointments");
    addMonthHeading(doc, group.label);

    const rows = group.items.map((a) => {
      const d = new Date(a.datetime);
      return [
        toDateOnlyValue(d),
        formatTime(d),
        a.name,
        a.contactNumber,
        a.organization,
        a.reason,
        a.isWalkIn ? "Walk-in" : "Scheduled",
      ];
    });

    autoTable(doc, {
      startY: 98,
      head: [
        [
          "Date",
          "Time",
          "Name",
          "Contact Number",
          "Organization/Office",
          "Reason for Visit",
          "Type",
        ],
      ],
      body: rows,
      styles: { fontSize: 9, cellPadding: 6, valign: "middle" },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: ROW_TINT },
      columnStyles: { 5: { cellWidth: 180 } },
    });
  });

  const filename = filenameFor("appoint-appointments", groups);
  doc.save(filename);
  return filename;
}

export function exportAssignmentsToPdf(assignments: Assignment[]): string {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const groups = groupByMonth(assignments, (a) => new Date(a.datetime));

  if (groups.length === 0) {
    addDocHeader(doc, "APPoint — Assignments");
    doc.setFontSize(10);
    doc.text("No assignments to export.", 40, 90);
  }

  groups.forEach((group, index) => {
    if (index > 0) doc.addPage();
    addDocHeader(doc, "APPoint — Assignments");
    addMonthHeading(doc, group.label);

    const rows = group.items.map((a) => {
      const d = new Date(a.datetime);
      return [
        toDateOnlyValue(d),
        formatTime(d),
        a.personnelName,
        a.description,
      ];
    });

    autoTable(doc, {
      startY: 98,
      head: [["Date", "Time", "Personnel", "Description"]],
      body: rows,
      styles: { fontSize: 9, cellPadding: 6, valign: "middle" },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: ROW_TINT },
      columnStyles: { 3: { cellWidth: 300 } },
    });
  });

  const filename = filenameFor("appoint-assignments", groups);
  doc.save(filename);
  return filename;
}
