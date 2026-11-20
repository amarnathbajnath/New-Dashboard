const ALLOWED_TAGS = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'UL',
  'OL',
  'LI',
  'P',
  'BR',
  'DIV',
]);

/**
 * Sanitizes rich-text HTML produced by the Scope of Work editor,
 * allowing only safe formatting tags (bold, italic, underline, lists, paragraphs, line breaks).
 */
export function sanitizeRichTextHtml(rawHtml: string | undefined | null): string {
  if (!rawHtml || !rawHtml.trim()) return '';
  if (typeof DOMParser === 'undefined') {
    return rawHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  const cleanNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toUpperCase();

    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'IFRAME' || tag === 'OBJECT') {
      return null;
    }

    const fragment = document.createDocumentFragment();
    el.childNodes.forEach((child) => {
      const cleanedChild = cleanNode(child);
      if (cleanedChild) {
        fragment.appendChild(cleanedChild);
      }
    });

    if (ALLOWED_TAGS.has(tag)) {
      const newEl = document.createElement(tag.toLowerCase());
      newEl.appendChild(fragment);
      return newEl;
    }

    return fragment;
  };

  const container = document.createElement('div');
  doc.body.childNodes.forEach((child) => {
    const cleaned = cleanNode(child);
    if (cleaned) {
      container.appendChild(cleaned);
    }
  });

  const textOnly = (container.textContent || '').replace(/\u00A0/g, ' ').trim();
  if (!textOnly) {
    return '';
  }

  return container.innerHTML;
}

export function hasRichTextContent(html: string | undefined | null): boolean {
  if (!html) return false;
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, '').trim().length > 0;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return ((doc.body.textContent || '').replace(/\u00A0/g, ' ').trim().length > 0);
}

export function richTextToPlainText(html: string | undefined | null): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const lines: string[] = [];
  const walk = (node: Node, listType?: 'ul' | 'ol', indexRef?: { count: number }) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as HTMLElement;
    const tag = el.tagName.toUpperCase();

    if (tag === 'BR') return '\n';
    if (tag === 'UL') {
      const childrenText: string[] = [];
      el.childNodes.forEach((c) => {
        const res = walk(c, 'ul');
        if (res) childrenText.push(res);
      });
      return childrenText.join('\n');
    }
    if (tag === 'OL') {
      const counter = { count: 0 };
      const childrenText: string[] = [];
      el.childNodes.forEach((c) => {
        const res = walk(c, 'ol', counter);
        if (res) childrenText.push(res);
      });
      return childrenText.join('\n');
    }
    if (tag === 'LI') {
      let inner = '';
      el.childNodes.forEach((c) => {
        inner += walk(c, listType, indexRef);
      });
      if (listType === 'ol' && indexRef) {
        indexRef.count += 1;
        return `${indexRef.count}. ${inner.trim()}`;
      }
      return `• ${inner.trim()}`;
    }

    let inner = '';
    el.childNodes.forEach((c) => {
      inner += walk(c, listType, indexRef);
    });

    if (tag === 'P' || tag === 'DIV') {
      return inner.trim() ? `${inner.trim()}\n` : '';
    }
    return inner;
  };

  doc.body.childNodes.forEach((c) => {
    const out = walk(c);
    if (out) lines.push(out);
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
