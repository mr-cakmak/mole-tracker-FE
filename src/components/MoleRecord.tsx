'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import { MoleRecord as MoleRecordType } from '@/lib/store';
import { getPredictionLabel, isConfident } from '@/lib/api';
import Image from 'next/image';

interface MoleRecordProps {
  record: MoleRecordType;
  onClick?: () => void;
}

export function MoleRecord({ record, onClick }: MoleRecordProps) {
  const predictionLabel = getPredictionLabel(record.prediction);
  const confident = isConfident(record.maxConfidence);
  
  // Determine status color based on prediction
  const getStatusColor = () => {
    if (!confident) return 'bg-gray-200 text-gray-800';
    
    // High risk conditions (melanoma, basal cell carcinoma, etc.)
    if (['MEL', 'BCC', 'SCC'].includes(predictionLabel)) {
      return 'bg-red-100 text-red-800';
    }
    
    // Medium risk
    if (['AKIEC', 'BKL'].includes(predictionLabel)) {
      return 'bg-amber-100 text-amber-800';
    }
    
    // Low risk or benign
    return 'bg-green-100 text-green-800';
  };
  
  const statusColor = getStatusColor();
  const recordDate = new Date(record.date);
  const dateRelative = formatDistanceToNow(recordDate, { addSuffix: true });
  const dateFormatted = format(recordDate, 'MMM d, yyyy');
  
  return (
    <Card 
      className="w-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 relative">
            <Image 
              src={record.image} 
              alt="Mole" 
              className="object-cover"
              fill
              sizes="96px"
              unoptimized
            />
          </div>
          
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <div className="text-sm text-gray-500">
                <time dateTime={record.date} title={format(recordDate, 'PPpp')}>
                  {dateFormatted} ({dateRelative})
                </time>
              </div>
              <div className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {confident ? predictionLabel : 'Not confident'}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Confidence: {(record.maxConfidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 