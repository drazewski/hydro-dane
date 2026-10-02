const EXPORTED_STYLES = [
  'align-items', 'background-color', 'background-image', 'border', 'border-color',
  'border-radius', 'border-style', 'border-width', 'box-sizing', 'color', 'display',
  'fill', 'flex', 'flex-direction', 'font-family', 'font-size', 'font-style', 'font-weight',
  'gap', 'grid-template-columns', 'grid-template-rows', 'height', 'justify-content',
  'letter-spacing', 'line-height', 'margin', 'max-width', 'min-height', 'min-width',
  'opacity', 'overflow', 'padding', 'position', 'stroke', 'stroke-dasharray', 'stroke-width',
  'text-align', 'text-transform', 'transform', 'vertical-align', 'white-space', 'width',
  'writing-mode',
];

const inlineStyles = (source: Element, clone: Element) => {
  const computed = window.getComputedStyle(source);
  const style = EXPORTED_STYLES
    .map((property) => `${property}:${computed.getPropertyValue(property)};`)
    .join('');
  clone.setAttribute('style', `${clone.getAttribute('style') ?? ''};${style}`);

  Array.from(source.children).forEach((child, index) => {
    const clonedChild = clone.children.item(index);
    if (clonedChild) inlineStyles(child, clonedChild);
  });
};

const loadImage = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Nie udało się wyrenderować wykresu.'));
    image.src = source;
  });

export const chartElementToJpeg = async (element: HTMLElement, isDark: boolean) => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[data-export-ignore="true"]').forEach((node) => node.remove());
  const width = Math.ceil(element.scrollWidth);
  const height = Math.ceil(element.scrollHeight);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  inlineStyles(element, clone);
  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">${serialized}</div>
    </foreignObject>
  </svg>`;
  const objectUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const image = await loadImage(objectUrl);
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available');
    context.scale(scale, scale);
    context.fillStyle = isDark ? '#1a1b1e' : '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.95), width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const jpegToPdfBlob = (dataUrl: string, width: number, height: number) => {
  const binary = atob(dataUrl.split(',')[1]);
  const imageBytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;
  const push = (value: string | Uint8Array) => {
    const bytes = typeof value === 'string' ? encoder.encode(value) : value;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (id: number, content: string | Uint8Array, suffix = '') => {
    offsets[id] = length;
    push(`${id} 0 obj\n`);
    push(content);
    push(`${suffix}\nendobj\n`);
  };

  push('%PDF-1.4\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Image 4 0 R >> >> /Contents 5 0 R >>`);
  object(4, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`, '\nendstream');
  chunks.splice(chunks.length - 1, 0, imageBytes);
  length += imageBytes.length;
  const drawing = `q ${width} 0 0 ${height} 0 0 cm /Image Do Q`;
  object(5, `<< /Length ${drawing.length} >>\nstream\n${drawing}\nendstream`);
  const xrefOffset = length;
  push('xref\n0 6\n0000000000 65535 f \n');
  for (let index = 1; index <= 5; index += 1) push(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
};

const clickDownloadLink = (href: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = href;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  clickDownloadLink(objectUrl, filename);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export const downloadDataUrl = (dataUrl: string, filename: string) => clickDownloadLink(dataUrl, filename);
