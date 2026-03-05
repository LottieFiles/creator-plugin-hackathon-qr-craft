import type { ComponentType } from 'react';
import type { QRContentType, ContentTypeData } from '../../../shared/types.ts';
import { UrlFields } from './url-fields.tsx';
import { TextFields } from './text-fields.tsx';
import { WifiFields } from './wifi-fields.tsx';
import { SmsFields } from './sms-fields.tsx';
import { PhoneFields } from './phone-fields.tsx';
import { EmailFields } from './email-fields.tsx';

export { UrlFields, TextFields, WifiFields, SmsFields, PhoneFields, EmailFields };

interface FieldProps<T extends QRContentType> {
  data: ContentTypeData[T];
  onUpdate: <K extends keyof ContentTypeData[T]>(field: K, value: ContentTypeData[T][K]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ContentFieldComponents: Record<QRContentType, ComponentType<FieldProps<any>>> = {
  url: UrlFields,
  text: TextFields,
  wifi: WifiFields,
  sms: SmsFields,
  phone: PhoneFields,
  email: EmailFields,
};
