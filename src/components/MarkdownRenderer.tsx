'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into paragraphs/blocks
  const blocks = content.split('\n\n');

  return (
    <div className="space-y-3 text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();

        // 1. Table formatting check
        if (trimmed.includes('|') && trimmed.split('\n').length >= 2) {
          const lines = trimmed.split('\n').filter((l) => l.includes('|'));
          if (lines.length >= 2) {
            const headerCells = lines[0]
              .split('|')
              .map((c) => c.trim())
              .filter(Boolean);
            const rowLines = lines.slice(2); // Skip header & separator

            return (
              <div key={bIdx} className="overflow-x-auto my-3 rounded-xl border border-stone-200 shadow-xs">
                <table className="w-full text-left text-[11px] sm:text-xs">
                  <thead className="bg-stone-100 text-stone-900 font-bold border-b border-stone-200">
                    <tr>
                      {headerCells.map((h, hIdx) => (
                        <th key={hIdx} className="px-3 py-2">
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {rowLines.map((row, rIdx) => {
                      const cells = row
                        .split('|')
                        .map((c) => c.trim())
                        .filter(Boolean);
                      return (
                        <tr key={rIdx} className="hover:bg-stone-50 transition-colors">
                          {cells.map((c, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 text-stone-700">
                              {renderInline(c)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 2. Headings (### or ## or #)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={bIdx} className="text-sm sm:text-base font-serif font-bold text-[#5C1220] mt-2 mb-1 flex items-center space-x-1.5">
              <span>{renderInline(trimmed.replace('### ', ''))}</span>
            </h3>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={bIdx} className="text-xs sm:text-sm font-bold text-stone-900 mt-2 mb-1">
              {renderInline(trimmed.replace('#### ', ''))}
            </h4>
          );
        }

        // 3. Blockquote (> )
        if (trimmed.startsWith('> ')) {
          const quoteText = trimmed.replace(/^>\s*/gm, '');
          return (
            <div key={bIdx} className="bg-amber-50/80 border-l-4 border-[#F59E0B] p-3 rounded-r-xl text-xs text-amber-950 my-2 shadow-xs">
              {renderInline(quoteText)}
            </div>
          );
        }

        // 4. Bullet lists (* or -)
        if (trimmed.split('\n').every((l) => l.trim().startsWith('* ') || l.trim().startsWith('- ') || /^\d+\.\s/.test(l.trim()))) {
          const listItems = trimmed.split('\n');
          return (
            <ul key={bIdx} className="space-y-1.5 my-2 pl-4 list-disc marker:text-[#F59E0B]">
              {listItems.map((item, iIdx) => {
                const cleanItem = item.replace(/^[\*\-]\s+|\d+\.\s+/, '');
                return (
                  <li key={iIdx} className="text-xs sm:text-sm text-stone-800">
                    {renderInline(cleanItem)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard paragraph
        return (
          <p key={bIdx} className="leading-relaxed">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Helper to render inline markdown: **bold**, *italic*, `code`, [link]
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split by bold (**...**)
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-stone-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-stone-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
