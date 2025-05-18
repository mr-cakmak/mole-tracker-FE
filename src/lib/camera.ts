import { useEffect, useState, useRef, useCallback } from 'react';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestCameraPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API not supported in this browser');
      setHasPermission(false);
      setIsLoading(false);
      return;
    }

    try {
      // First try with environment camera (back camera on mobile)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setHasPermission(true);
      } catch (envError) {
        console.log('Could not access environment camera, trying default camera', envError);
        
        // Fallback to any available camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      // More descriptive error messages
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
          setError('Camera is already in use by another application or tab.');
        } else if (err.name === 'SecurityError') {
          setError('Camera access is blocked due to security restrictions.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Could not find a camera matching the requested constraints.');
        } else {
          setError(`Camera error: ${err.name}`);
        }
      } else {
        setError('Could not access camera. Please allow camera access and try again.');
      }
      
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    hasPermission,
    isLoading,
    error,
    requestCameraPermission,
    stopCamera
  };
} 