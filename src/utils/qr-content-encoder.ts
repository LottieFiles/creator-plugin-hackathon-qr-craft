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

    case 'vcard': {
      const d = data as ContentTypeData['vcard'];
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${d.lastName};${d.firstName}`,
        `FN:${d.firstName} ${d.lastName}`,
        `TEL:${d.phone}`,
      ];
      if (d.email) lines.push(`EMAIL:${d.email}`);
      if (d.organization) lines.push(`ORG:${d.organization}`);
      if (d.url) lines.push(`URL:${d.url}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'geo': {
      const d = data as ContentTypeData['geo'];
      let uri = `geo:${d.latitude},${d.longitude}`;
      if (d.label) uri += `?q=${encodeURIComponent(d.label)}`;
      return uri;
    }

    case 'event': {
      const d = data as ContentTypeData['event'];
      const lines = ['BEGIN:VEVENT', `SUMMARY:${d.title}`];
      if (d.startDate) lines.push(`DTSTART:${formatDateTime(d.startDate, d.startTime)}`);
      if (d.endDate) lines.push(`DTEND:${formatDateTime(d.endDate, d.endTime)}`);
      if (d.location) lines.push(`LOCATION:${d.location}`);
      if (d.description) lines.push(`DESCRIPTION:${d.description}`);
      lines.push('END:VEVENT');
      return lines.join('\n');
    }

    default:
      return '';
  }
}

function formatDateTime(date: string, time: string): string {
  if (!date) return '';
  const d = date.replace(/-/g, '');
  const t = time ? time.replace(/:/g, '') + '00' : '000000';
  return `${d}T${t}`;
}
