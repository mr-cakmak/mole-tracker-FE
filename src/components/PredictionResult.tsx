'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPredictionLabel, isConfident, CLASS_LABELS } from '@/lib/api';

interface PredictionResultProps {
  prediction: number;
  maxConfidence: number;
  probabilities: number[];
  isLoading?: boolean;
}

export function PredictionResult({ 
  prediction, 
  maxConfidence, 
  probabilities,
  isLoading = false
}: PredictionResultProps) {
  const confident = isConfident(maxConfidence);
  
  // Get label for the prediction
  const predictionLabel = getPredictionLabel(prediction);
  
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
  
  if (isLoading) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="text-center">Analyzing Image...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="animate-pulse flex flex-col items-center w-full">
            <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-center">Prediction Result</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className={`px-4 py-2 rounded-full text-sm font-medium mb-4 ${statusColor}`}>
            {confident 
              ? `Prediction: ${predictionLabel}`
              : 'Not confident - please consult a doctor'
            }
          </div>
          
          <div className="w-full mb-4">
            <div className="text-sm font-medium mb-1">Confidence: {(maxConfidence * 100).toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${confident ? 'bg-blue-600' : 'bg-gray-400'}`}
                style={{ width: `${maxConfidence * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="w-full space-y-2 mt-4">
            <h4 className="text-sm font-medium mb-2">All Probabilities:</h4>
            {probabilities.slice(0, -1).map((prob, idx) => (
              <div key={idx} className="flex items-center text-sm">
                <div className="w-12 font-medium">{CLASS_LABELS[idx]}</div>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${prob * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right">{(prob * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
          
          {!confident && (
            <p className="text-sm text-gray-500 mt-6 text-center">
              The AI model is not confident in this prediction. Please consult a dermatologist for a professional assessment.
            </p>
          )}
          
          {['MEL', 'BCC', 'SCC'].includes(predictionLabel) && confident && (
            <p className="text-sm text-red-600 mt-6 text-center font-medium">
              This prediction suggests a potentially serious condition. Please consult a dermatologist as soon as possible.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 