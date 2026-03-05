import { Input, Label, cn } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['event'];
  onUpdate: <K extends keyof ContentTypeData['event']>(field: K, value: ContentTypeData['event'][K]) => void;
}

const dateTimeInputClass = cn(
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
  'focus:outline-none focus:ring-1 focus:ring-ring',
);

export function EventFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Event title"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Start date</Label>
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => onUpdate('startDate', e.target.value)}
            className={dateTimeInputClass}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Start time</Label>
          <input
            type="time"
            value={data.startTime}
            onChange={(e) => onUpdate('startTime', e.target.value)}
            className={dateTimeInputClass}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>End date</Label>
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => onUpdate('endDate', e.target.value)}
            className={dateTimeInputClass}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>End time</Label>
          <input
            type="time"
            value={data.endTime}
            onChange={(e) => onUpdate('endTime', e.target.value)}
            className={dateTimeInputClass}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Location</Label>
        <Input
          value={data.location}
          onChange={(e) => onUpdate('location', e.target.value)}
          placeholder="Optional location"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Description</Label>
        <textarea
          value={data.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Optional description"
          rows={2}
          className={cn(
            dateTimeInputClass,
            'placeholder:text-muted-foreground',
            'resize-none',
          )}
        />
      </div>
    </div>
  );
}
