// Presentation only: no links, HTML parsing, executable content, requests or learning-state writes.
const heading = line => /^(#{1,3})\s+(.+?)\s*$/.exec(line);
const fence = line => /^\s*```([A-Za-z0-9_-]*)\s*$/.exec(line);
const ordered = line => /^\s*(\d{1,6})\.\s+(.+)$/.exec(line);
const bullet = line => /^\s*[-*]\s+(.+)$/.exec(line);
const special = line => !line.trim() || heading(line) || fence(line) || ordered(line) || bullet(line);

export function knowledgeBlocks(value) {
  const source = String(value ?? '').replace(/\r\n?/g, '\n');
  const lines = source.split('\n'), blocks = [];
  let i = 0;
  while (i < lines.length) {
    if (!lines[i].trim()) { i++; continue; }
    const start = i, h = heading(lines[i]), f = fence(lines[i]);
    if (h) { blocks.push({ type:'heading', level:h[1].length, text:h[2], start, end:++i }); continue; }
    if (f) {
      const language = f[1]; i++;
      const content = [];
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) content.push(lines[i++]);
      const closed = i < lines.length;
      if (closed) i++;
      // An unfinished fence remains entirely literal instead of losing its marker.
      blocks.push(closed ? { type:'code', language, text:content.join('\n'), start, end:i }
        : { type:'literal', text:lines.slice(start,i).join('\n'), start, end:i });
      continue;
    }
    const order = ordered(lines[i]), item = bullet(lines[i]);
    if (order || item) {
      const type = order ? 'ordered' : 'list', items = [];
      while (i < lines.length) {
        const match = order ? ordered(lines[i]) : bullet(lines[i]);
        if (!match) break;
        items.push(order ? { number:Number(match[1]), text:match[2] } : { text:match[1] }); i++;
      }
      blocks.push({ type, items, start, end:i }); continue;
    }
    const paragraph = [lines[i++]];
    while (i < lines.length && !special(lines[i])) paragraph.push(lines[i++]);
    blocks.push({ type:'paragraph', text:paragraph.join('\n'), start, end:i });
  }
  return blocks;
}

export function knowledgeInline(value) {
  const source = String(value), tokens = [];
  let cursor = 0;
  while (cursor < source.length) {
    const code = source.indexOf('`', cursor), strong = source.indexOf('**', cursor);
    const start = code < 0 ? strong : strong < 0 ? code : Math.min(code, strong);
    if (start < 0) { tokens.push({type:'text',text:source.slice(cursor)}); break; }
    const marker = start === code ? '`' : '**', end = source.indexOf(marker, start + marker.length);
    if (end <= start + marker.length) { tokens.push({type:'text',text:source.slice(cursor,start+marker.length)}); cursor=start+marker.length; continue; }
    if (start > cursor) tokens.push({type:'text',text:source.slice(cursor,start)});
    tokens.push({type:marker==='`'?'code':'strong',text:source.slice(start+marker.length,end)});
    cursor=end+marker.length;
  }
  return tokens;
}

export function renderKnowledgeText(target, value) {
  const document = target.ownerDocument;
  const make = (tag, className, text) => { const node=document.createElement(tag); if(className)node.className=className; if(text!==undefined)node.textContent=text; return node; };
  const inline = (node, text) => {
    for (const token of knowledgeInline(text)) node.append(token.type==='text' ? document.createTextNode(token.text) : make(token.type, '', token.text));
    return node;
  };
  const blocks = knowledgeBlocks(value), children=[];
  for (const block of blocks) {
    if (block.type==='literal') children.push(make('pre','knowledge-unfinished',block.text));
    else if (block.type==='heading') children.push(inline(make(`h${Math.min(6,block.level+3)}`,'knowledge-heading'),block.text));
    else if (block.type==='code') {
      const figure=make('figure','knowledge-example'), pre=make('pre'), code=make('code','',block.text);
      figure.append(make('figcaption','',block.language ? `${block.language} · 示例文本` : '代码示例')); pre.append(code); figure.append(pre); children.push(figure);
    } else if (block.type==='ordered' || block.type==='list') {
      const list=make(block.type==='ordered'?'ol':'ul','knowledge-list');
      if(block.type==='ordered')list.setAttribute('start',String(block.items[0].number));
      for(const item of block.items){const li=inline(make('li'),item.text);if(block.type==='ordered')li.setAttribute('value',String(item.number));list.append(li);}children.push(list);
    } else children.push(inline(make('p', block.text.startsWith('网页用法：')?'knowledge-web-note':''),block.text));
  }
  target.className='knowledge-reader'; target.replaceChildren(...children);
  return blocks.length;
}
