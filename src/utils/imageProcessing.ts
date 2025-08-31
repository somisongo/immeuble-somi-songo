import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const makeBackgroundWhite = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background processing...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the processed image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Fill with white background
    outputCtx.fillStyle = '#FFFFFF';
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask to make background white
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply mask to make background white while keeping the subject
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const maskValue = result[0].mask.data[i];
      const pixelIndex = i * 4;
      
      // If it's background (high mask value), make it white
      if (maskValue > 0.5) {
        data[pixelIndex] = 255;     // R
        data[pixelIndex + 1] = 255; // G
        data[pixelIndex + 2] = 255; // B
        data[pixelIndex + 3] = 255; // A
      }
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('White background applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error processing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const processLogoWithWhiteBackground = async (imageSrc: string): Promise<string> => {
  try {
    // Download the image
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    
    // Load image
    const img = await loadImage(blob);
    
    // Process to make background white
    const processedBlob = await makeBackgroundWhite(img);
    
    // Create object URL for the processed image
    return URL.createObjectURL(processedBlob);
  } catch (error) {
    console.error('Error processing logo:', error);
    // Return original image if processing fails
    return imageSrc;
  }
};
