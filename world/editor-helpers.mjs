export const MAX_CODE_LENGTH = 20000;
export function indentedSelectionFits(code, start, end, insertion = '    ') {
  return code.length - (end - start) + insertion.length <= MAX_CODE_LENGTH;
}

// UTF-16 offsets match textarea selection APIs. A nonempty selection targets
// whole touched lines; an end at the next line's start does not include it.
export function planIndentation(code, start, end, { outdent = false } = {}) {
  if (typeof code !== 'string' || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end > code.length) throw new RangeError('Invalid editor selection');
  if (start === end && !outdent) {
    if (code.length + 4 > MAX_CODE_LENGTH) return null;
    return { start, end, text: '    ', selectionStart: start + 4, selectionEnd: start + 4 };
  }
  const lineStart = start === 0 ? 0 : code.lastIndexOf('\n', start - 1) + 1;
  const last = end > start && code[end - 1] === '\n' ? end - 1 : end;
  const nextBreak = code.indexOf('\n', last);
  const lineEnd = nextBreak < 0 ? code.length : nextBreak;
  const edits = [];
  for (let pos = lineStart; pos <= lineEnd;) {
    let remove = 0;
    if (outdent) {
      if (code[pos] === '\t') remove = 1;
      else while (remove < 4 && code[pos + remove] === ' ') remove++;
    }
    edits.push({ pos, remove, insert: outdent ? '' : '    ' });
    const newline = code.indexOf('\n', pos);
    if (newline < 0 || newline >= lineEnd) break;
    pos = newline + 1;
  }
  const delta = edits.reduce((sum, e) => sum + e.insert.length - e.remove, 0);
  if (code.length + delta > MAX_CODE_LENGTH && delta > 0) return null;
  let text = '', cursor = lineStart;
  for (const e of edits) { text += code.slice(cursor, e.pos) + e.insert; cursor = e.pos + e.remove; }
  text += code.slice(cursor, lineEnd);
  const mapOffset = offset => edits.reduce((result, e) => result + (e.pos <= offset ? e.insert.length - Math.min(e.remove, offset - e.pos) : 0), offset);
  return { start: lineStart, end: lineEnd, text, selectionStart: mapOffset(start), selectionEnd: mapOffset(end) };
}

// Conservative continuation only: copy whitespace before the caret, never infer
// Python syntax from colons/quotes. Nonempty selections keep native Enter behavior.
export function planContinuedIndentation(code, start, end) {
  if (typeof code !== 'string' || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end > code.length) throw new RangeError('Invalid editor selection');
  if (start !== end) return null;
  const lineStart = start === 0 ? 0 : code.lastIndexOf('\n', start - 1) + 1;
  const whitespace = code.slice(lineStart, start).match(/^[ \t]*/)[0];
  if (!whitespace) return null;
  const text = '\n' + whitespace;
  if (code.length + text.length > MAX_CODE_LENGTH) return { limited: true };
  return { start, end, text, selectionStart: start + text.length, selectionEnd: start + text.length };
}
