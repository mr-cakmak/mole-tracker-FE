'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCamera } from '@/lib/camera';
import { captureImage } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface CameraViewProps {
  onImageCapture: (imageData: string) => void;
}

export function CameraView({ onImageCapture }: CameraViewProps) {
  const { 
    videoRef, 
    hasPermission,
    isLoading, 
    error, 
    requestCameraPermission,
  } = useCamera();
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  const handleVideoReady = () => {
    setIsCameraReady(true);
  };

  const handleCapture = async () => {
    try {
      if (videoRef.current) {
        const imageData = await captureImage(videoRef);
        onImageCapture(imageData);
      }
    } catch (err) {
      console.error('Error capturing image:', err);
    }
  };

  return (
    <Card className="w-full bg-gray-50">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-60 w-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading camera...</span>
            </div>
          ) : error || !hasPermission ? (
            <div className="flex flex-col items-center justify-center h-60 w-full p-4 text-center">
              <div className="text-red-500 mb-4">
                {error || "Camera permission denied"}
              </div>
              <Button onClick={requestCameraPermission}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="relative w-full aspect-[4/3] bg-black overflow-hidden rounded-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onCanPlay={handleVideoReady}
                />
                {/* Overlay for focusing area */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-dashed border-white rounded-full w-32 h-32 opacity-60" />
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                size="lg"
                disabled={!isCameraReady}
                onClick={handleCapture}
              >
                Capture Image
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 