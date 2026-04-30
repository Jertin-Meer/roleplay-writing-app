import type { Post } from './types';

// ── 剧本格式文本 ─────────────────────────────────────────────

export function generateScreenplayText(title: string, posts: Post[]): string {
  const lines: string[] = [`【${title}】`, ''];
  for (const post of posts) {
    switch (post.post_type) {
      case 'narration':
        lines.push(post.content, '');
        break;
      case 'dialogue':
        lines.push(`${post.character_name || post.author_nickname}：`, `"${post.content}"`, '');
        break;
      case 'action':
        lines.push(`${post.character_name || post.author_nickname} ${post.content}`, '');
        break;
      case 'system':
        lines.push(`（${post.content}）`, '');
        break;
    }
  }
  return lines.join('\n');
}

// ── HTML（用于打印 PDF）──────────────────────────────────────

function generateScreenplayHtml(title: string, posts: Post[]): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const bodyLines: string[] = [];
  for (const post of posts) {
    const charName = post.character_name || post.author_nickname;
    switch (post.post_type) {
      case 'narration':
        bodyLines.push(`<p class="narration">${escape(post.content)}</p>`);
        break;
      case 'dialogue':
        bodyLines.push(`<p class="char-name">${escape(charName)}：</p>`);
        bodyLines.push(`<p class="dialogue">"${escape(post.content)}"</p>`);
        break;
      case 'action':
        bodyLines.push(`<p class="action"><strong>${escape(charName)}</strong> ${escape(post.content)}</p>`);
        break;
      case 'system':
        bodyLines.push(`<p class="system">（${escape(post.content)}）</p>`);
        break;
    }
  }

  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>${escape(title)}</title>
<style>
  body { font-family: "SimSun","宋体",serif; max-width:800px; margin:0 auto; padding:48px 40px; line-height:2; color:#1a1a1a; background:#fff; }
  h1 { text-align:center; font-size:26px; margin-bottom:36px; }
  p { margin:0 0 8px; }
  .narration { text-indent:2em; }
  .char-name { font-weight:bold; margin-top:16px; margin-bottom:0; }
  .dialogue { text-indent:2em; margin-bottom:16px; }
  .action { margin:12px 0; }
  .system { font-style:italic; color:#666; text-align:center; margin:12px 0; }
  @media print { body { padding:0; } }
</style>
</head>
<body>
<h1>${escape(title)}</h1>
${bodyLines.join('\n')}
</body>
</html>`;
}

// ── 导出 PDF（新窗口打印）───────────────────────────────────

export function exportToPdf(title: string, posts: Post[]): void {
  const html = generateScreenplayHtml(title, posts);
  const win = window.open('', '_blank');
  if (!win) { alert('请允许弹出窗口'); return; }
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
}

// ── 导出 PNG（Canvas）────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [''];
  const lines: string[] = [];
  let cur = '';
  for (const ch of text) {
    if (ctx.measureText(cur + ch).width <= maxWidth) {
      cur += ch;
    } else {
      if (cur) lines.push(cur);
      cur = ch;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

export function exportToImage(title: string, posts: Post[]): void {
  const W = 960;
  const PADDING = 72;
  const CONTENT_W = W - PADDING * 2;
  const LINE_H = 38;
  const BLOCK_GAP = 14;

  // First pass — measure height
  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = '20px serif';

  interface Line { text: string; bold?: boolean; italic?: boolean; color?: string; indent?: boolean }
  const lines: Line[] = [];

  for (const post of posts) {
    const charName = post.character_name || post.author_nickname;
    switch (post.post_type) {
      case 'narration':
        for (const l of wrapText(measure, post.content, CONTENT_W - 32))
          lines.push({ text: l, indent: true });
        break;
      case 'dialogue':
        lines.push({ text: charName + '：', bold: true });
        for (const l of wrapText(measure, `"${post.content}"`, CONTENT_W - 32))
          lines.push({ text: l, indent: true });
        break;
      case 'action':
        for (const l of wrapText(measure, `${charName} ${post.content}`, CONTENT_W))
          lines.push({ text: l });
        break;
      case 'system':
        for (const l of wrapText(measure, `（${post.content}）`, CONTENT_W))
          lines.push({ text: l, italic: true, color: '#777' });
        break;
    }
    lines.push({ text: '' });
  }

  const HEIGHT = PADDING * 2 + 80 + lines.length * LINE_H + BLOCK_GAP;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, W, HEIGHT);

  // Title
  ctx.fillStyle = '#111';
  ctx.font = 'bold 30px serif';
  ctx.textAlign = 'center';
  ctx.fillText(`【${title}】`, W / 2, PADDING + 30);

  // Divider
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, PADDING + 50);
  ctx.lineTo(W - PADDING, PADDING + 50);
  ctx.stroke();

  let y = PADDING + 80;
  ctx.textAlign = 'left';

  for (const line of lines) {
    if (!line.text) { y += LINE_H * 0.4; continue; }
    ctx.font = `${line.italic ? 'italic ' : ''}${line.bold ? 'bold ' : ''}20px serif`;
    ctx.fillStyle = line.color || '#1a1a1a';
    ctx.fillText(line.text, PADDING + (line.indent ? 32 : 0), y);
    y += LINE_H;
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// ── 导出 Word（.docx）────────────────────────────────────────

export async function exportToDocx(title: string, posts: Post[]): Promise<void> {
  const { Document, Paragraph, TextRun, Packer, AlignmentType } = await import('docx');

  type DocxParagraph = InstanceType<typeof Paragraph>;
  const children: DocxParagraph[] = [];

  // 标题
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `【${title}】`, bold: true, size: 40 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  for (const post of posts) {
    const charName = post.character_name || post.author_nickname;
    switch (post.post_type) {
      case 'narration':
        children.push(
          new Paragraph({ children: [new TextRun({ text: post.content, size: 24 })], indent: { firstLine: 480 }, spacing: { after: 120 } })
        );
        break;
      case 'dialogue':
        children.push(
          new Paragraph({ children: [new TextRun({ text: charName + '：', bold: true, size: 24 })], spacing: { before: 240, after: 60 } })
        );
        children.push(
          new Paragraph({ children: [new TextRun({ text: `"${post.content}"`, size: 24 })], indent: { left: 480 }, spacing: { after: 240 } })
        );
        break;
      case 'action':
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: charName + ' ', bold: true, size: 24 }),
              new TextRun({ text: post.content, size: 24 }),
            ],
            spacing: { after: 120 },
          })
        );
        break;
      case 'system':
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `（${post.content}）`, italics: true, size: 22, color: '777777' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120 },
          })
        );
        break;
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
