'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCamera } from '@/lib/camera';
import { captureImage } from '@/lib/api';
import { Loader2, Upload, AlertCircle } from 'lucide-react';

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
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string>('Initializing...');

  useEffect(() => {
    // Check if running on HTTPS (required for camera access)
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setSecurityWarning('Camera may not work: This site needs to run on HTTPS for camera access.');
      console.warn('Camera access requires HTTPS unless on localhost');
    }
    
    requestCameraPermission();
  }, [requestCameraPermission]);

  useEffect(() => {
    // Additional check for video element readiness
    if (videoRef.current) {
      const checkVideoStatus = () => {
        const video = videoRef.current;
        if (!video) return;
        
        const isVideoPlaying = !!(
          video.currentTime > 0 && 
          !video.paused && 
          !video.ended && 
          video.readyState > 2
        );
        
        if (isVideoPlaying) {
          console.log('Video is playing!', video.videoWidth, 'x', video.videoHeight);
          setIsCameraReady(true);
          setVideoStatus('Camera ready');
        } else {
          console.log('Video not playing yet. ReadyState:', video.readyState);
          setVideoStatus(`Status: ${video.readyState}/4 (${getReadyStateText(video.readyState)})`);
        }
      };
      
      const interval = setInterval(checkVideoStatus, 500);
      return () => clearInterval(interval);
    }
  }, [videoRef]);

  const getReadyStateText = (state: number) => {
    const states = [
      'HAVE_NOTHING',
      'HAVE_METADATA',
      'HAVE_CURRENT_DATA',
      'HAVE_FUTURE_DATA',
      'HAVE_ENOUGH_DATA'
    ];
    return states[state] || 'Unknown';
  };

  const handleVideoReady = () => {
    console.log('Video canPlay event fired');
    console.log('Video dimensions on canPlay:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
    // We'll let the useEffect interval check handle the actual readiness state
  };

  const handleVideoPlaying = () => {
    console.log('Video playing event fired');
    setIsCameraReady(true);
    setVideoStatus('Camera active');
  };

  const handleCapture = async () => {
    try {
      if (videoRef.current) {
        console.log('Capturing image from video element');
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

    console.log('File selected:', file.name, file.type, file.size);
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

  // Force play function for iOS devices
  const forcePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      console.log('Attempting to force play video...');
      video.play()
        .then(() => console.log('Video play succeeded'))
        .catch(err => console.error('Error playing video:', err));
    }
  };

  return (
    <Card className="w-full bg-gray-50">
      <CardContent className="p-4">
        {securityWarning && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700">{securityWarning}</p>
          </div>
        )}

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
              
              {(error && error.includes("not supported")) ? (
                <div className="text-sm text-gray-600 mb-3">
                  Your browser may not support camera access or is blocking it.
                </div>
              ) : null}
              
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
                  controls={false}
                  disablePictureInPicture
                  disableRemotePlayback
                  className="w-full h-full object-cover"
                  onCanPlay={handleVideoReady}
                  onPlaying={handleVideoPlaying}
                  style={{ transform: 'scaleX(-1)' }} // Mirror for selfie mode
                />
                
                <div className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                  {videoStatus}
                </div>
                
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
                  onClick={isCameraReady ? handleCapture : forcePlayVideo}
                >
                  {isCameraReady ? 'Capture Image' : 'Tap to Activate Camera'}
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