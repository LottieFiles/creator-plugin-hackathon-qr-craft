import { Input, Label } from '@lottiefiles/creator-plugins-ui';
import type { ContentTypeData } from '../../../shared/types.ts';

interface Props {
  data: ContentTypeData['phone'];
  onUpdate: <K extends keyof ContentTypeData['phone']>(field: K, value: ContentTypeData['phone'][K]) => void;
}

export function PhoneFields({ data, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Phone number</Label>
      <Input
        value={data.number}
        onChange={(e) => onUpdate('number', e.target.value)}
        placeholder="+1234567890"
      />
    </div>
  );
}
