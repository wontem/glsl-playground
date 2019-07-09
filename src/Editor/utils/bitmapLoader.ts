async function downloadBitmap(
  url: string,
  signal: AbortSignal,
  options: ImageBitmapOptions,
): Promise<ImageBitmap> {
  const response = await fetch(url, { signal });

  const blob = await response.blob();
  const bitmap: ImageBitmap = await (createImageBitmap as any)(blob, options);

  return bitmap;
}

class BitmapLoader {
  private abortControllersMap: Map<string, AbortController>;

  constructor() {
    this.abortControllersMap = new Map();
  }

  async download(
    id: string,
    url: string,
    options: ImageBitmapOptions,
  ): Promise<ImageBitmap> {
    this.abort(id);

    const controller = new AbortController();
    this.abortControllersMap.set(id, controller);

    try {
      const bitmap = await downloadBitmap(url, controller.signal, options);

      return bitmap;
    } catch (error) {
      throw error;
    } finally {
      this.abortControllersMap.delete(id);
    }
  }

  abort(id: string): void {
    if (!this.abortControllersMap.has(id)) {
      return;
    }

    this.abortControllersMap.get(id)!.abort();
  }
}

export const bitmapLoader = new BitmapLoader();
