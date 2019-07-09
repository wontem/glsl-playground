export const saveFile = (() => {
  const a = document.createElement('a');

  return (blob: Blob, name: string): void => {
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };
})();

export const saveImage = (canvas: HTMLCanvasElement, name: string) => {
  canvas.toBlob((blob) => {
    if (blob) {
      saveFile(blob, name);
    } else {
      console.warn('Cannot save the image');
    }
  });
};
