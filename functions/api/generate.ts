/**
 * PhotoCue AI prompt service — Cloudflare Pages Function.
 *
 * Serves POST /api/generate. Composes a single documentary photography prompt
 * with Cloudflare Workers AI (Llama 3.1). The web app calls this only when the
 * user opts into AI in Settings; otherwise it never runs. If the `AI` binding
 * is not configured, or the model errors, this returns a non-2xx status and the
 * app falls back to its offline engine — so a missing binding degrades cleanly
 * instead of breaking the app.
 *
 * Deploy note: enable Workers AI for this Pages project and bind it as `AI`
 * (Pages project → Settings → Functions → Workers AI bindings, variable `AI`).
 * No API key is required; usage runs on your Cloudflare account's free tier.
 *
 * This file is a Cloudflare Pages Function and is built by Cloudflare at
 * deploy time, not by the app's Vite/tsc build (it lives outside `src/`).
 */

interface Env {
  // Workers AI binding. Optional so a missing binding is a graceful 503.
  AI?: { run: (model: string, input: unknown) => Promise<unknown> };
}

const MODEL = '@cf/meta/llama-3.1-8b-instruct';

const STYLE_NOTE: Record<string, string> = {
  observational: 'Plain, precise, observational language. No adjectives that judge the place or its people.',
  cinematic: 'Think like a documentary cinematographer: layers, light, lens, blocking, the decisive moment.',
  poetic: 'Quietly evocative and reflective, but still concrete and shootable — never vague or purple.',
};

function clamp(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

/** Pull the first JSON object out of a model response that may include prose. */
function extractJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (!env.AI) {
    return json({ error: 'ai_unavailable' }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const mode = clamp(body.mode, 60) || 'General Prompt';
  const location = clamp(body.location, 120);
  const placeType = clamp(body.placeType, 60);
  const style = clamp(body.style, 20) || 'observational';
  const tags = Array.isArray(body.contextTags)
    ? (body.contextTags as unknown[]).map((t) => clamp(t, 40)).filter(Boolean).slice(0, 6)
    : [];

  const system = [
    'You are a prompt writer for documentary photographers, filmmakers, and visual storytellers.',
    'You write one specific, ethical, immediately shootable photography assignment.',
    'Rules:',
    '- Be concrete and observational. Never invent facts about a real place or its people.',
    '- Use neutral language. Do not use loaded words like poor, dangerous, exotic, primitive, or slum.',
    '- Respect dignity and consent. Assume the photographer is a careful, respectful observer.',
    STYLE_NOTE[style] ?? STYLE_NOTE.observational,
    'Respond with ONLY a JSON object, no preamble, with keys:',
    '"title" (max 6 words), "assignment" (2-3 sentences, what to look for and how to shoot it),',
    '"why" (1 sentence on the story value), "variation" (1 sentence alternative), "reflection" (1 question).',
  ].join('\n');

  const context_lines = [
    `Mode: ${mode}.`,
    location ? `Place (photographer-entered, treat as neutral context): ${location}.` : 'No specific place given.',
    placeType ? `Place type: ${placeType}.` : '',
    tags.length ? `Themes to keep in mind: ${tags.join(', ')}.` : '',
    'Write the assignment now as JSON.',
  ]
    .filter(Boolean)
    .join('\n');

  let result: unknown;
  try {
    result = await env.AI.run(MODEL, {
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: context_lines },
      ],
      max_tokens: 400,
      temperature: 0.8,
    });
  } catch {
    return json({ error: 'ai_error' }, 502);
  }

  const raw =
    typeof result === 'string'
      ? result
      : clamp((result as { response?: unknown })?.response, 4000);
  const parsed = raw ? extractJson(raw) : null;
  if (!parsed || typeof parsed.assignment !== 'string' || parsed.assignment.length < 20) {
    return json({ error: 'ai_empty' }, 502);
  }

  return json(
    {
      title: clamp(parsed.title, 120),
      assignment: clamp(parsed.assignment, 800),
      why: clamp(parsed.why, 400),
      variation: clamp(parsed.variation, 400),
      reflection: clamp(parsed.reflection, 400),
    },
    200,
  );
};

/** Health check — lets the app / a curl probe confirm the binding is present. */
export const onRequestGet = async (context: { env: Env }): Promise<Response> =>
  json({ ok: true, ai: Boolean(context.env.AI), model: MODEL }, 200);

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
