'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCamera } from '@/lib/camera';
import { captureImage } from '@/lib/api';
import { Loader2, Upload } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onImageCapture(result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full bg-gray-50">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-60 w-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading camera...</span>
            </div>
          ) : error || !hasPermission ? (
            <div className="flex flex-col items-center justify-center h-60 w-full p-4 text-center">
              <div className="text-red-500 mb-4">
                {error || "Camera permission denied"}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button onClick={requestCameraPermission} className="mb-2">
                  Try Again with Camera
                </Button>
                
                <p className="text-sm text-gray-500 my-2">Or</p>
                
                <Button onClick={triggerFileUpload} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image Instead
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </div>
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
              
              <div className="w-full flex flex-col gap-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!isCameraReady}
                  onClick={handleCapture}
                >
                  Capture Image
                </Button>
                
                <p className="text-xs text-center text-gray-500 my-1">or</p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={triggerFileUpload}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload from Gallery
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 