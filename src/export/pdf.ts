/**
 * PDF export for story plans and workshop assignments.
 *
 * jsPDF is imported dynamically so it never enters the initial bundle — it
 * loads only when the user actually exports. Layouts target clean A4 and US
 * Letter pages with generous margins and readable typography.
 */

import type { Story } from '../types';

export type PageSize = 'a4' | 'letter';

const MARGIN = 56; // ~20mm at 72dpi points

async function newDoc(size: PageSize) {
  const { jsPDF } = await import('jspdf');
  return new jsPDF({ unit: 'pt', format: size, compress: true });
}

/** Export a single story plan as a PDF and trigger a download. */
export async function exportStoryPdf(story: Story, size: PageSize = 'a4'): Promise<void> {
  const doc = await newDoc(size);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN * 2;
  let y = MARGIN;

  const line = (text: string, opts: { size?: number; font?: 'serif' | 'sans'; bold?: boolean; gap?: number } = {}) => {
    const fontSize = opts.size ?? 11;
    doc.setFont(opts.font === 'serif' ? 'times' : 'helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    const wrapped = doc.splitTextToSize(text, contentW);
    for (const row of wrapped) {
      if (y > pageH - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(row, MARGIN, y);
      y += fontSize * 1.35;
    }
    y += opts.gap ?? 0;
  };

  line('PhotoCue', { size: 10, bold: true, gap: 2 });
  line(story.title, { size: 24, bold: true, gap: 6 });
  if (story.location) line(`Location: ${story.location}`, { size: 11, gap: 2 });
  if (story.question) line(`Central question: ${story.question}`, { font: 'serif', size: 12, gap: 2 });
  if (story.theme) line(`Theme: ${story.theme}`, { size: 11, gap: 10 });

  line(`Story path (${story.stage}/${story.stages.length} stages)`, { size: 13, bold: true, gap: 4 });
  story.stages.forEach((s, i) => line(`${i < story.stage ? '✓' : '○'}  ${s}`, { size: 11 }));
  y += 12;

  line('Prompts', { size: 15, bold: true, gap: 6 });
  story.prompts.forEach((p, i) => {
    line(`${i + 1}. ${p.title}`, { size: 13, bold: true, gap: 1 });
    line(`${p.status} · ${p.role} · ${p.difficulty} · ${p.time}`, { size: 9, gap: 3 });
    line(p.assignment, { font: 'serif', size: 12, gap: 3 });
    if (p.why) line(`Why it matters: ${p.why}`, { size: 10, gap: 2 });
    if (p.variation) line(`Try another angle: ${p.variation}`, { size: 10, gap: 2 });
    if (p.reflection) line(`Reflection: ${p.reflection}`, { size: 10, gap: 2 });
    if (p.notes) line(`Field note: ${p.notes}`, { size: 10, gap: 2 });
    if (p.ethics) line(`Ethics: ${p.ethics}`, { size: 9, gap: 2 });
    y += 8;
  });

  if (story.reflection) {
    line('Reflection notes', { size: 13, bold: true, gap: 4 });
    line(story.reflection, { font: 'serif', size: 12, gap: 8 });
  }

  // Footer on the final page.
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('One tap. One place. One story. — photocue', MARGIN, pageH - MARGIN / 2);

  doc.save(`${slug(story.title)}.pdf`);
}

/** Export a set of workshop assignments (one per participant) as a PDF. */
export async function exportAssignmentsPdf(
  title: string,
  assignments: { participant: string; assignment: string; constraint?: string; role?: string }[],
  size: PageSize = 'a4',
): Promise<void> {
  const doc = await newDoc(size);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN * 2;

  assignments.forEach((a, idx) => {
    if (idx > 0) doc.addPage();
    let y = MARGIN;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PhotoCue Workshop', MARGIN, y);
    y += 24;
    doc.setFontSize(20);
    doc.text(title, MARGIN, y);
    y += 30;
    doc.setFontSize(13);
    doc.text(a.participant, MARGIN, y);
    y += 24;
    doc.setFont('times', 'normal');
    doc.setFontSize(13);
    for (const row of doc.splitTextToSize(a.assignment, contentW) as string[]) {
      doc.text(row, MARGIN, y);
      y += 18;
    }
    if (a.constraint) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Constraint: ${a.constraint}`, MARGIN, y);
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('photocue — One tap. One place. One story.', MARGIN, pageH - MARGIN / 2);
  });

  doc.save(`${slug(title)}-assignments.pdf`);
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'photocue-story';
}
