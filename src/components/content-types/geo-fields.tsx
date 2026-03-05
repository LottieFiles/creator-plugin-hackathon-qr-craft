import { Input, Label } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['geo'];
  onUpdate: <K extends keyof ContentTypeData['geo']>(field: K, value: ContentTypeData['geo'][K]) => void;
}

export function GeoFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Latitude</Label>
          <Input
            type="number"
            step="any"
            value={data.latitude}
            onChange={(e) => onUpdate('latitude', e.target.value)}
            placeholder="40.7128"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Longitude</Label>
          <Input
            type="number"
            step="any"
            value={data.longitude}
            onChange={(e) => onUpdate('longitude', e.target.value)}
            placeholder="-74.0060"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Label</Label>
        <Input
          value={data.label}
          onChange={(e) => onUpdate('label', e.target.value)}
          placeholder="Optional label"
        />
      </div>
    </div>
  );
}
