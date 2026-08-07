/**
 * Shareable image export.
 *
 * Renders a single prompt (or a story summary) to a canvas and returns a PNG
 * blob. Uses the brand palette and typography. Entirely offline and free of
 * external assets — the canvas is drawn, not composited from images.
 */

import type { Prompt, Story } from '../types';

const PALETTE = {
  ink: '#121212',
  paper: '#F4F0E7',
  orange: '#F35B35',
  moss: '#65705B',
};

/** Render a prompt card to a 1080×1080 shareable PNG. */
export async function promptToImage(prompt: Prompt): Promise<Blob> {
  const size = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = PALETTE.paper;
  ctx.fillRect(0, 0, size, size);

  // Accent bar.
  ctx.fillStyle = PALETTE.orange;
  ctx.fillRect(80, 96, 96, 12);

  ctx.fillStyle = PALETTE.moss;
  ctx.font = '600 28px system-ui, sans-serif';
  ctx.fillText(prompt.mode.toUpperCase(), 80, 176);

  ctx.fillStyle = PALETTE.ink;
  ctx.font = '700 64px Georgia, serif';
  wrap(ctx, prompt.title, 80, 260, size - 160, 68);

  ctx.font = '400 36px Georgia, serif';
  const startY = 260 + measureWrap(ctx, prompt.title, size - 160, 68) * 68 + 40;
  wrap(ctx, prompt.assignment, 80, startY, size - 160, 48);

  // Footer.
  ctx.fillStyle = PALETTE.ink;
  ctx.font = '700 30px system-ui, sans-serif';
  ctx.fillText('PhotoCue', 80, size - 96);
  ctx.fillStyle = PALETTE.moss;
  ctx.font = '400 24px system-ui, sans-serif';
  ctx.fillText('One tap. One place. One story.', 80, size - 56);

  return await toBlob(canvas);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number): void {
  const words = text.split(' ');
  let lineText = '';
  let lineY = y;
  for (const w of words) {
    const test = lineText ? `${lineText} ${w}` : w;
    if (ctx.measureText(test).width > maxW && lineText) {
      ctx.fillText(lineText, x, lineY);
      lineText = w;
      lineY += lh;
    } else {
      lineText = test;
    }
  }
  if (lineText) ctx.fillText(lineText, x, lineY);
}

function measureWrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, _lh: number): number {
  const words = text.split(' ');
  let lineText = '';
  let lines = 1;
  for (const w of words) {
    const test = lineText ? `${lineText} ${w}` : w;
    if (ctx.measureText(test).width > maxW && lineText) {
      lines++;
      lineText = w;
    } else {
      lineText = test;
    }
  }
  return lines;
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render image'))), 'image/png');
  });
}

/** Convenience for exporting a story's first prompt or its cover. */
export async function storyCoverImage(story: Story): Promise<Blob> {
  const cover: Prompt = story.prompts[0] ?? {
    id: 'cover',
    fingerprint: '',
    components: { template: 'cover', mode: 'General Prompt' },
    mode: 'General Prompt',
    title: story.title,
    assignment: story.question,
    why: '',
    variation: '',
    reflection: '',
    role: story.theme,
    difficulty: 'Focused',
    time: '',
    createdAt: story.createdAt,
  };
  return promptToImage(cover);
}
