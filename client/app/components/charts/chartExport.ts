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
  const width = Math.ceil(element.scrollWidth);
  const height = Math.ceil(element.scrollHeight);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  inlineStyles(element, clone);
  clone.querySelectorAll('[data-export-ignore="true"]').forEach((node) => node.remove());
  clone.querySelectorAll<HTMLElement>('[data-export-station="true"]').forEach((node) => {
    node.style.display = 'block';
    node.style.marginBottom = '5px';
  });
  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">${serialized}</div>
    </foreignObject>
  </svg>`;
  const objectUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const image = await loadImage(objectUrl);
    const maxCanvasDimension = 16384;
    const maxCanvasArea = 64_000_000;
    const scale = Math.min(
      2,
      maxCanvasDimension / width,
      maxCanvasDimension / height,
      Math.sqrt(maxCanvasArea / (width * height))
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available');
    context.scale(scale, scale);
    context.fillStyle = isDark ? '#1a1b1e' : '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    if (!dataUrl.startsWith('data:image/jpeg;base64,')) {
      throw new Error('Nie udało się utworzyć obrazu wykresu.');
    }
    return { dataUrl, width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const jpegToPdfBlob = (dataUrl: string, width: number, height: number) => {
  const encodedImage = dataUrl.split(',')[1];
  if (!encodedImage) throw new Error('Nieprawidłowe dane obrazu.');
  const binary = atob(encodedImage);
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
  const object = (id: number, content: string | Uint8Array) => {
    offsets[id] = length;
    push(`${id} 0 obj\n`);
    push(content);
    push('\nendobj\n');
  };

  const landscape = width >= height;
  const pageWidth = landscape ? 841.89 : 595.28;
  const pageHeight = landscape ? 595.28 : 841.89;
  const margin = 24;
  const imageScale = Math.min((pageWidth - margin * 2) / width, (pageHeight - margin * 2) / height);
  const displayedWidth = width * imageScale;
  const displayedHeight = height * imageScale;
  const imageX = (pageWidth - displayedWidth) / 2;
  const imageY = (pageHeight - displayedHeight) / 2;

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Image 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = length;
  push('4 0 obj\n');
  push(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);
  push(imageBytes);
  push('\nendstream\nendobj\n');
  const drawing = `q ${displayedWidth} 0 0 ${displayedHeight} ${imageX} ${imageY} cm /Image Do Q`;
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
