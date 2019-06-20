import * as React from 'react';
import { Box } from 'reakit';

export const Number: React.FC<{
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
}> = ({ min, max, value, onChange }) => {
  const [view, setView] = React.useState<string>('');
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  return isEditing ? (
    <input
      autoFocus
      value={view}
      onBlur={(e) => {
        setIsEditing(false);
        const newValue = parseFloat(e.target.value);

        if (!isNaN(newValue)) {
          onChange(newValue);
        }
      }}
      onChange={(e) => {
        setView(e.target.value);
      }}
    />
  ) : (
    <Box
      onClick={() => {
        setIsEditing(true);
        setView(`${value}`);
      }}
    >
      {value}
    </Box>
  );
};

const Slider: React.FC<{
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}> = ({ min, max, value }) => {
  const progress = (value - min) / (max - min);

  return (
    <Box style={{}}>
      <Box style={{}} />
    </Box>
  );
};
