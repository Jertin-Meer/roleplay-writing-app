'use client';

import { useState } from 'react';
import { generateScreenplayText, exportToPdf, exportToImage, exportToDocx } from '@/lib/export';
import type { Post } from '@/lib/types';

type Format = 'text' | 'word' | 'pdf' | 'image';

interface Props {
  posts: Post[];
  defaultTitle: string;
  onClose: () => void;
}

const FORMATS: { id: Format; label: string; desc: string }[] = [
  { id: 'text', label: '复制文本', desc: '复制到剪贴板' },
  { id: 'word', label: 'Word (.docx)', desc: '下载 Word 文档' },
  { id: 'pdf', label: 'PDF', desc: '打印 / 另存为 PDF' },
  { id: 'image', label: '图片 (.png)', desc: '下载 PNG 图片' },
];

export default function ExportModal({ posts, defaultTitle, onClose }: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [format, setFormat] = useState<Format>('text');
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState('');

  const handleExport = async () => {
    const t = title.trim() || defaultTitle;
    if (!t) return;
    setExporting(true);
    setDone('');

    try {
      switch (format) {
        case 'text': {
          const text = generateScreenplayText(t, posts);
          await navigator.clipboard.writeText(text);
          setDone('已复制到剪贴板');
          break;
        }
        case 'word':
          await exportToDocx(t, posts);
          setDone('下载中...');
          break;
        case 'pdf':
          exportToPdf(t, posts);
          setDone('已打开打印窗口');
          break;
        case 'image':
          exportToImage(t, posts);
          setDone('下载中...');
          break;
      }
    } catch (e) {
      console.error(e);
      setDone('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">导出文章</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">文档标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给这篇文章起个名字"
            maxLength={60}
            className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* 格式选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">导出格式</label>
          <div className="space-y-2">
            {FORMATS.map((f) => (
              <label
                key={f.id}
                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                  format === f.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={f.id}
                  checked={format === f.id}
                  onChange={() => setFormat(f.id)}
                  className="accent-gray-900"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800">{f.label}</div>
                  <div className="text-xs text-gray-400">{f.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 预览格式说明 */}
        <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">输出格式（剧本风格）</p>
          <p><strong>【标题】</strong></p>
          <p>旁白内容直接列出</p>
          <p><strong>角色名：</strong>/ "对话内容"</p>
          <p><strong>角色名</strong> 动作描写</p>
          <p className="italic text-gray-400">（备注内容 — 斜体）</p>
        </div>

        {done && (
          <p className="text-sm text-green-600">{done}</p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50"
          >
            关闭
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || posts.length === 0}
            className="px-5 py-2 text-sm bg-gray-900 text-white rounded-md font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {exporting ? '处理中...' : '导出'}
          </button>
        </div>
      </div>
    </div>
  );
}
