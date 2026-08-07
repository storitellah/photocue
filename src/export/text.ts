/**
 * Plain-text and Markdown story-plan exporters. Both are pure string builders
 * that work fully offline.
 */

import type { Story } from '../types';

export function storyToText(story: Story): string {
  const lines: string[] = [];
  lines.push(story.title);
  lines.push('='.repeat(story.title.length));
  if (story.location) lines.push(`Location: ${story.location}`);
  if (story.question) lines.push(`Central question: ${story.question}`);
  if (story.theme) lines.push(`Theme: ${story.theme}`);
  if (story.contextTags.length) lines.push(`Tags: ${story.contextTags.join(', ')}`);
  lines.push('');
  lines.push(`Story path (${story.stage}/${story.stages.length} stages)`);
  story.stages.forEach((s, i) => {
    lines.push(`  ${i < story.stage ? '[x]' : '[ ]'} ${s}`);
  });
  lines.push('');
  story.prompts.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.title}  — ${p.status}`);
    lines.push(`   ${p.assignment}`);
    if (p.why) lines.push(`   Why it matters: ${p.why}`);
    if (p.variation) lines.push(`   Try another angle: ${p.variation}`);
    if (p.reflection) lines.push(`   Reflection: ${p.reflection}`);
    if (p.notes) lines.push(`   Field note: ${p.notes}`);
    lines.push('');
  });
  if (story.reflection) {
    lines.push('Reflection notes');
    lines.push(story.reflection);
  }
  lines.push('');
  lines.push('Made with PhotoCue by Storitellah — One tap. One place. One story.');
  return lines.join('\n');
}

export function storyToMarkdown(story: Story): string {
  const md: string[] = [];
  md.push(`# ${story.title}`);
  md.push('');
  if (story.location) md.push(`**Location:** ${story.location}  `);
  if (story.question) md.push(`**Central question:** ${story.question}  `);
  if (story.theme) md.push(`**Theme:** ${story.theme}  `);
  if (story.contextTags.length) md.push(`**Tags:** ${story.contextTags.join(', ')}`);
  md.push('');
  md.push(`## Story path (${story.stage}/${story.stages.length})`);
  story.stages.forEach((s, i) => md.push(`- [${i < story.stage ? 'x' : ' '}] ${s}`));
  md.push('');
  md.push('## Prompts');
  story.prompts.forEach((p, i) => {
    md.push(`### ${i + 1}. ${p.title}`);
    md.push(`*${p.status} · ${p.role} · ${p.difficulty} · ${p.time}*`);
    md.push('');
    md.push(p.assignment);
    if (p.why) md.push(`\n**Why it matters:** ${p.why}`);
    if (p.variation) md.push(`\n**Try another angle:** ${p.variation}`);
    if (p.reflection) md.push(`\n**Reflection:** ${p.reflection}`);
    if (p.notes) md.push(`\n> Field note: ${p.notes}`);
    md.push('');
  });
  if (story.reflection) {
    md.push('## Reflection notes');
    md.push(story.reflection);
  }
  md.push('');
  md.push('---');
  md.push('_Made with PhotoCue by Storitellah — One tap. One place. One story._');
  return md.join('\n');
}
