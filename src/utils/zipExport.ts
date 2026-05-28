// ============================================================
// zipExport.ts
// Captures each slide DOM node as PNG and bundles into a ZIP
// ============================================================

import { toPng } from 'html-to-image';
import JSZip from 'jszip';

export type ExportProgressCallback = (current: number, total: number) => void;

/**
 * Captures a DOM element at native 1080x1350 resolution and
 * returns a base64 PNG data string.
 */
async function captureSlide(el: HTMLElement): Promise<string> {
  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: 1, // element is already at native 1080x1350
    width: 1080,
    height: 1350,
    style: {
      transform: 'none',
      transformOrigin: 'unset',
    },
  });
  return dataUrl;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

function getSlideFilename(index: number, slideType: string): string {
  const pad = String(index + 1).padStart(2, '0');
  const typeSlug = slideType.toLowerCase();
  return `${pad}_${typeSlug}.png`;
}

/**
 * Iterates over slide DOM refs, captures each as PNG,
 * bundles into a ZIP and triggers download.
 *
 * @param slideRefs - Map of slideIndex → DOM element reference
 * @param slideTypes - Parallel array of slide type strings for filename
 * @param zipName - Output filename (without .zip)
 * @param onProgress - Optional callback for progress updates
 */
export async function exportSlidesAsZip(
  slideRefs: Map<number, HTMLElement>,
  slideTypes: string[],
  zipName: string = 'carrossel-instagram',
  onProgress?: ExportProgressCallback
): Promise<void> {
  const zip = new JSZip();
  const total = slideRefs.size;
  let current = 0;

  const sortedEntries = Array.from(slideRefs.entries()).sort(([a], [b]) => a - b);

  for (const [index, el] of sortedEntries) {
    const dataUrl = await captureSlide(el);
    const blob = dataUrlToBlob(dataUrl);
    const filename = getSlideFilename(index, slideTypes[index] ?? 'slide');
    zip.file(filename, blob);
    current++;
    onProgress?.(current, total);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${zipName}-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
