'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PredictionResult } from '@/components/PredictionResult';
import { useMoleStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

export default function RecordPage() {
  const params = useParams();
  const router = useRouter();
  const { getMole } = useMoleStore();
  
  const moleId = params.moleId as string;
  const recordId = params.recordId as string;
  
  const mole = getMole(moleId);
  const record = mole?.records.find(r => r.id === recordId);
  
  if (!mole || !record) {
    // Handle case where record is not found
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-xl font-semibold mb-4">Record not found</h1>
        <p className="text-gray-600 mb-6">The record you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </div>
    );
  }
  
  const dateFormatted = formatDistanceToNow(new Date(record.date), { addSuffix: true });
  
  return (
    <div className="flex flex-col items-center">
      <div className="max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mole Record</h1>
          <Button variant="outline" onClick={() => router.push(`/process/${moleId}`)}>
            Back to History
          </Button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">Date: {dateFormatted}</p>
        </div>
        
        <div className="w-full aspect-[4/3] bg-black rounded-lg mb-6 overflow-hidden">
          <img 
            src={record.image} 
            alt="Mole" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <PredictionResult
          prediction={record.prediction}
          maxConfidence={record.maxConfidence}
          probabilities={record.probabilities}
        />
      </div>
    </div>
  );
} 