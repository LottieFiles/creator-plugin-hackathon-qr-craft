import { Input, Label } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['url'];
  onUpdate: <K extends keyof ContentTypeData['url']>(field: K, value: ContentTypeData['url'][K]) => void;
}

export function UrlFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>URL</Label>
      <Input
        value={data.url}
        onChange={(e) => onUpdate('url', e.target.value)}
        placeholder="https://example.com"
      />
    </div>
  );
}
