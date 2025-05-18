'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Camera } from 'lucide-react';

interface SimpleCameraProps {
  onCapture: (imageData: string) => void;
}

export function SimpleCamera({ onCapture }: SimpleCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('SimpleCamera: Setting up camera');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported');
        }
        
        // Basic video with minimal constraints
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Setup manual play
          await videoRef.current.play().catch(e => {
            console.log('Auto-play failed, will need manual click', e);
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('SimpleCamera: Failed to setup camera', err);
        setError('Camera setup failed');
        setLoading(false);
      }
    }
    
    setupCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Check if video has dimensions
  useEffect(() => {
    const checkVideoReady = () => {
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        console.log(`SimpleCamera: Video ready ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        setReady(true);
      }
    };
    
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', checkVideoReady);
      video.addEventListener('playing', checkVideoReady);
      
      // Also check periodically
      const interval = setInterval(checkVideoReady, 500);
      
      return () => {
        video.removeEventListener('loadedmetadata', checkVideoReady);
        video.removeEventListener('playing', checkVideoReady);
        clearInterval(interval);
      };
    }
  }, []);
  
  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => console.log('SimpleCamera: Manual play succeeded'))
        .catch(err => console.error('SimpleCamera: Manual play failed', err));
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageData = canvas.toDataURL('image/jpeg');
      onCapture(imageData);
    } catch (err) {
      console.error('SimpleCamera: Failed to capture image', err);
      setError('Failed to capture image');
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden rounded-lg mb-4">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : null}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 bg-white/20"
                onClick={handleManualPlay}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : null}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Focus target */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-white rounded-full w-24 h-24 opacity-70" />
        </div>
      </div>
      
      <div className="w-full">
        <Button
          className="w-full"
          size="lg"
          disabled={!ready && !error}
          onClick={ready ? captureImage : handleManualPlay}
        >
          {ready ? (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Capture Photo
            </>
          ) : (
            'Tap to Activate Camera'
          )}
        </Button>
      </div>
    </div>
  );
} 