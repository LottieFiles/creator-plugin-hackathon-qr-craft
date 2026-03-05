import { Input, Label, cn } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['sms'];
  onUpdate: <K extends keyof ContentTypeData['sms']>(field: K, value: ContentTypeData['sms'][K]) => void;
}

export function SmsFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label>Phone number</Label>
        <Input
          value={data.number}
          onChange={(e) => onUpdate('number', e.target.value)}
          placeholder="+1234567890"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Message</Label>
        <textarea
          value={data.message}
          onChange={(e) => onUpdate('message', e.target.value)}
          placeholder="Optional message"
          rows={2}
          className={cn(
            'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            'resize-none',
          )}
        />
      </div>
    </div>
  );
}
