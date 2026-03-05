import type { QRContentType, ContentTypeData } from '../../shared/types.ts';

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

export function encodeQRContent<T extends QRContentType>(
  type: T,
  data: ContentTypeData[T],
): string {
  switch (type) {
    case 'url':
      return (data as ContentTypeData['url']).url;

    case 'text':
      return (data as ContentTypeData['text']).text;

    case 'wifi': {
      const d = data as ContentTypeData['wifi'];
      let s = `WIFI:T:${d.encryption};S:${escapeWifi(d.ssid)};P:${escapeWifi(d.password)};`;
      if (d.hidden) s += 'H:true;';
      s += ';';
      return s;
    }

    case 'sms': {
      const d = data as ContentTypeData['sms'];
      return d.message ? `SMSTO:${d.number}:${d.message}` : `SMSTO:${d.number}`;
    }

    case 'phone':
      return `tel:${(data as ContentTypeData['phone']).number}`;

    case 'email': {
      const d = data as ContentTypeData['email'];
      const params: string[] = [];
      if (d.subject) params.push(`subject=${encodeURIComponent(d.subject)}`);
      if (d.body) params.push(`body=${encodeURIComponent(d.body)}`);
      return `mailto:${d.email}${params.length ? '?' + params.join('&') : ''}`;
    }

    default:
      return '';
  }
}
