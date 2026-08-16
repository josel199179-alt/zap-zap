import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, RefreshCw, Send, Image as ImageIcon } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface CameraCaptureModalProps {
  onCapture: (imageDataUrl: string, caption: string) => void;
  onClose: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ onCapture, onClose }) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera error, fallback available:', err);
      setCameraError('Câmera indisponível ou permissão negada. Você pode escolher uma foto da galeria abaixo.');
    }
  }, [facingMode]);

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera, capturedImage]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          // Mirror front camera
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        soundManager.playCameraShutter();
        setCapturedImage(dataUrl);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCaption('');
  };

  const handleSend = () => {
    if (capturedImage) {
      onCapture(capturedImage, caption);
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
        <button
          id="btn-close-camera"
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
        >
          <X size={26} />
        </button>

        {!capturedImage && !cameraError && (
          <button
            id="btn-toggle-camera-facing"
            type="button"
            onClick={toggleCamera}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors"
            title="Virar Câmera"
          >
            <RefreshCw size={24} />
          </button>
        )}
      </div>

      {/* Camera View / Captured Preview */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#111b21]">
        {capturedImage ? (
          <img src={capturedImage} alt="Foto Capturada" className="max-h-full max-w-full object-contain" />
        ) : cameraError ? (
          <div className="p-6 text-center text-gray-300 max-w-sm">
            <Camera size={48} className="mx-auto mb-3 text-gray-500" />
            <p className="text-sm mb-4">{cameraError}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-[#00a884] text-white font-medium rounded-lg shadow flex items-center gap-2 mx-auto active:scale-95"
            >
              <ImageIcon size={20} />
              Escolher da Galeria
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        )}
      </div>

      {/* Hidden File Input for Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Bottom Controls */}
      <div className="p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white">
        {capturedImage ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-[#202c33] rounded-full px-4 py-2 border border-white/10">
              <input
                id="input-photo-caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Adicione uma legenda..."
                className="bg-transparent flex-1 text-sm text-white placeholder-gray-400 outline-none"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <button
                id="btn-retake-photo"
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 active:scale-95"
              >
                Tirar Outra
              </button>
              <button
                id="btn-send-captured-photo"
                type="button"
                onClick={handleSend}
                className="w-12 h-12 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <Send size={20} className="translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-around py-2">
            <button
              id="btn-open-gallery"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-transform text-white flex flex-col items-center gap-1"
            >
              <ImageIcon size={24} />
            </button>

            {!cameraError && (
              <button
                id="btn-shutter"
                type="button"
                onClick={takePhoto}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-transform shadow-xl"
              >
                <div className="w-full h-full rounded-full bg-white active:bg-gray-300" />
              </button>
            )}

            <div className="w-12" /> {/* Spacer */}
          </div>
        )}
      </div>
    </div>
  );
};
