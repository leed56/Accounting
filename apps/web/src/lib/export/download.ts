export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function openWhatsAppShare(message: string, phone?: string | null) {
  const encoded = encodeURIComponent(message);
  const base = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : 'https://wa.me';
  window.open(`${base}?text=${encoded}`, '_blank', 'noopener,noreferrer');
}
