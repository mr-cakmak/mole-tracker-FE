'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CameraView } from '@/components/CameraView';
import { PredictionResult } from '@/components/PredictionResult';
import { getPrediction } from '@/lib/api';
import { useMoleStore, type Mole, type MoleRecord } from '@/lib/store';
import { toast } from 'sonner';

function AddMolePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addMole, addMoleRecord, getMoleByLocation } = useMoleStore();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<{
    prediction: number;
    maxConfidence: number;
    probabilities: number[];
  } | null>(null);
  
  // Get location parameters from URL
  const x = parseFloat(searchParams.get('x') || '0');
  const y = parseFloat(searchParams.get('y') || '0');
  const moleId = searchParams.get('moleId');
  
  // Check if there's already a mole at this location
  const existingMole = moleId || (getMoleByLocation(x, y, 3)?.id);
  
  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsProcessing(true);
    
    try {
      const result = await getPrediction(imageData);
      
      setPrediction({
        prediction: result.prediction,
        maxConfidence: result.max_confidence,
        probabilities: result.probabilities,
      });
    } catch (error) {
      console.error('Error getting prediction:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAddMole = () => {
    if (!capturedImage || !prediction) return;
    
    try {
      const date = new Date().toISOString();
      const recordId = uuidv4();
      
      const moleRecord: MoleRecord = {
        id: recordId,
        image: capturedImage,
        date,
        prediction: prediction.prediction,
        maxConfidence: prediction.maxConfidence,
        probabilities: prediction.probabilities,
      };
      
      if (existingMole) {
        // Add record to existing mole
        addMoleRecord(existingMole, moleRecord);
        toast.success('New record added to existing mole');
        router.push(`/process/${existingMole}`);
      } else {
        // Create new mole
        const newMoleId = uuidv4();
        
        const newMole: Mole = {
          id: newMoleId,
          location: { x, y },
          records: [moleRecord],
        };
        
        addMole(newMole);
        toast.success('New mole added successfully');
        router.push(`/process/${newMoleId}`);
      }
    } catch (error) {
      console.error('Error saving mole:', error);
      toast.error('Failed to save mole. Please try again.');
    }
  };
  
  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setPrediction(null);
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="max-w-md w-full mb-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          {existingMole ? 'Add New Record' : 'Add New Mole'}
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {existingMole 
            ? 'Take a photo to add a new record to this mole'
            : 'Take a photo of the mole to track its condition over time'
          }
        </p>
        
        {capturedImage ? (
          <>
            <div className="w-full aspect-[4/3] bg-black rounded-lg mb-4 overflow-hidden">
              <div className="relative w-full h-full">
                <Image 
                  src={capturedImage} 
                  alt="Captured mole" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            <div className="flex justify-between gap-4 mb-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleRetakePhoto}
              >
                Retake Photo
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <CameraView onImageCapture={handleImageCapture} />
        )}
        
        {isProcessing && (
          <PredictionResult 
            prediction={0}
            maxConfidence={0}
            probabilities={[]}
            isLoading={true}
          />
        )}
        
        {prediction && !isProcessing && (
          <>
            <PredictionResult 
              prediction={prediction.prediction}
              maxConfidence={prediction.maxConfidence}
              probabilities={prediction.probabilities}
            />
            
            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={handleAddMole}
            >
              {existingMole ? 'Add Record to Mole' : 'Add Mole to Track'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AddMolePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <AddMolePageContent />
    </Suspense>
  );
} 