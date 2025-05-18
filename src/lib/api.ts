export type PredictionResponse = {
  max_confidence: number;
  prediction: number;
  probabilities: number[];
};

export const CLASS_LABELS = [
  'MEL', 
  'NV', 
  'BCC', 
  'AKIEC', 
  'BKL', 
  'DF', 
  'VASC', 
  'SCC', 
  'Not confident'
];

export const getPredictionLabel = (prediction: number): string => {
  if (prediction >= 0 && prediction < CLASS_LABELS.length) {
    return CLASS_LABELS[prediction];
  }
  return 'Unknown';
};

export const isConfident = (maxConfidence: number): boolean => {
  return maxConfidence >= 0.5;
};

export const getPrediction = async (imageBase64: string): Promise<PredictionResponse> => {
  try {
    // Remove data URL prefix if it exists
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;
    
    // Create a Blob from the base64 data
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    
    const byteArray = new Uint8Array(byteArrays);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // Create FormData and append the file
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg');
    
    const response = await fetch('https://skin-lesion-service-286247711107.us-central1.run.app/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting prediction:', error);
    throw error;
  }
};

export const captureImage = async (videoRef: React.RefObject<HTMLVideoElement | null>): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = videoRef.current;
    if (!video) {
      reject(new Error('Video element not found'));
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    resolve(dataUrl);
  });
}; 