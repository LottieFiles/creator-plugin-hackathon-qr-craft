import { Label, cn } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['text'];
  onUpdate: <K extends keyof ContentTypeData['text']>(field: K, value: ContentTypeData['text'][K]) => void;
}

export function TextFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Text</Label>
      <textarea
        value={data.text}
        onChange={(e) => onUpdate('text', e.target.value)}
        placeholder="Enter any text"
        rows={3}
        className={cn(
          'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          'resize-none',
        )}
      />
    </div>
  );
}
