import { useState, useEffect } from 'react';
import { processLogoWithWhiteBackground } from '@/utils/imageProcessing';

interface LogoWithWhiteBackgroundProps {
  src: string;
  alt: string;
  className?: string;
}

export const LogoWithWhiteBackground = ({ src, alt, className = "" }: LogoWithWhiteBackgroundProps) => {
  const [processedSrc, setProcessedSrc] = useState<string>(src);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        const processed = await processLogoWithWhiteBackground(src);
        setProcessedSrc(processed);
      } catch (error) {
        console.error('Failed to process logo:', error);
        // Keep original src if processing fails
        setProcessedSrc(src);
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();
  }, [src]);

  if (isProcessing) {
    return (
      <div className={`${className} bg-white rounded-lg flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <img 
      src={processedSrc} 
      alt={alt} 
      className={`${className} bg-white rounded-lg`}
      style={{ backgroundColor: 'white' }}
    />
  );
};
