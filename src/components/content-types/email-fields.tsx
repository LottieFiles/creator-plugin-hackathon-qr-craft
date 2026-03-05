import { Input, Label, cn } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['email'];
  onUpdate: <K extends keyof ContentTypeData['email']>(field: K, value: ContentTypeData['email'][K]) => void;
}

export function EmailFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label>Email</Label>
        <Input
          value={data.email}
          onChange={(e) => onUpdate('email', e.target.value)}
          placeholder="user@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Subject</Label>
        <Input
          value={data.subject}
          onChange={(e) => onUpdate('subject', e.target.value)}
          placeholder="Optional subject"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Body</Label>
        <textarea
          value={data.body}
          onChange={(e) => onUpdate('body', e.target.value)}
          placeholder="Optional body"
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
