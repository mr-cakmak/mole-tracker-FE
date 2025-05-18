'use client';

import React, { useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Button } from '@/components/ui/button';
import { useMoleStore, type Mole } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Use a single body image
const BODY_IMAGE = '/body.png';

// Mole size configuration
const MOLE_CONFIG = {
  normal: {
    size: 0.6, // in rem
    color: 'bg-green-500',
  },
  selected: {
    size: 0.5, // in rem
    color: 'bg-blue-600',
  }
};

export function HumanBodyViewer() {
  const router = useRouter();
  const { moles, getMoleByLocation } = useMoleStore();
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedMole, setSelectedMole] = useState<Mole | null>(null);
  
  const handleBodyClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Check if there's a mole near this point
    const existingMole = getMoleByLocation(x, y, 3); // 3% threshold
    
    if (existingMole) {
      setSelectedMole(existingMole);
    } else {
      setSelectedMole(null);
    }
    
    setSelectedPoint({ x, y });
  }, [getMoleByLocation]);
  
  const navigateToAddMole = useCallback(() => {
    if (selectedPoint) {
      router.push(`/add-mole?x=${selectedPoint.x}&y=${selectedPoint.y}`);
    }
  }, [router, selectedPoint]);
  
  const navigateToMoleProcess = useCallback((moleId: string) => {
    router.push(`/process/${moleId}`);
  }, [router]);
  
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full max-w-md border rounded-lg overflow-hidden bg-white relative" style={{ height: 'fit-content' }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          limitToBounds={true}
          centerOnInit={true}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button size="icon" variant="outline" onClick={() => zoomIn()}>+</Button>
                <Button size="icon" variant="outline" onClick={() => zoomOut()}>-</Button>
                <Button size="icon" variant="outline" onClick={() => resetTransform()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/>
                    <path d="M12 8v4l2 2"/>
                  </svg>
                </Button>
              </div>
              
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  maxHeight: '60vh',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="relative" onClick={handleBodyClick} style={{ width: '100%', maxHeight: '60vh' }}>
                  <Image 
                    src={BODY_IMAGE}
                    alt="Human body"
                    className="mx-auto object-contain max-h-[60vh] w-auto"
                    width={400}
                    height={600}
                    priority
                    unoptimized
                    onError={(e) => {
                      // If image fails to load, display a backup silhouette or message
                      console.error('Failed to load body image');
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM3NTc1NzUiPkh1bWFuIEJvZHkgT3V0bGluZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  
                  {/* Display existing moles */}
                  {moles.map((mole) => (
                    <div
                      key={mole.id}
                      className={`absolute rounded-full ${MOLE_CONFIG.normal.color} transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
                      style={{
                        left: `${mole.location.x}%`,
                        top: `${mole.location.y}%`,
                        width: `${MOLE_CONFIG.normal.size}rem`,
                        height: `${MOLE_CONFIG.normal.size}rem`,
                      }}
                    />
                  ))}
                  
                  {/* Display selected point */}
                  {selectedPoint && (
                    <div
                      className={`absolute rounded-full ${MOLE_CONFIG.selected.color} transform -translate-x-1/2 -translate-y-1/2 border-2 border-white z-10`}
                      style={{
                        left: `${selectedPoint.x}%`,
                        top: `${selectedPoint.y}%`,
                        width: `${MOLE_CONFIG.selected.size}rem`,
                        height: `${MOLE_CONFIG.selected.size}rem`,
                      }}
                    />
                  )}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
      
      {/* Action popup - positioned below the body viewer */}
      {selectedPoint && (
        <div className="w-full max-w-md mt-4 bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex flex-col gap-2">
            {selectedMole ? (
              <>
                <h3 className="font-semibold">Mole Found</h3>
                <p className="text-sm text-gray-500 mb-2">
                  This mole has {selectedMole.records.length} records
                </p>
                <Button 
                  variant="default"
                  onClick={() => navigateToMoleProcess(selectedMole.id)}
                >
                  See Progress
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-semibold">New Point Selected</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Would you like to add a mole at this location?
                </p>
                <Button 
                  variant="default"
                  onClick={navigateToAddMole}
                >
                  Add a New Mole
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 