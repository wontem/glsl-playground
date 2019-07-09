export const getMousePosition = (e: React.MouseEvent): [number, number] => {
  const rect = e.currentTarget.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  return [x, 1 - y];
};
