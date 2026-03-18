export async function extractDominantColor(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (!context) {
          resolve("#1a1a1a");
          return;
        }

        const sampleSize = 64;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        context.drawImage(img, 0, 0, sampleSize, sampleSize);

        const { data } = context.getImageData(0, 0, sampleSize, sampleSize);
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let count = 0;

        // Sample every 4th pixel to keep it fast while stable.
        for (let i = 0; i < data.length; i += 16) {
          const alpha = data[i + 3];
          if (alpha < 32) continue;

          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
          count += 1;
        }

        if (!count) {
          resolve("#1a1a1a");
          return;
        }

        const r = Math.round(rSum / count);
        const g = Math.round(gSum / count);
        const b = Math.round(bSum / count);

        const hex =
          "#" +
          [r, g, b]
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("");
        resolve(hex);
      } catch {
        resolve("#1a1a1a");
      }
    };

    img.onerror = () => resolve("#1a1a1a");
    img.src = imageUrl;
  });
}
