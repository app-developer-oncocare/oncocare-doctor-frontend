import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';

interface FullScreenImageViewerProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export default function FullScreenImageViewer({
  visible,
  imageUri,
  onClose,
}: FullScreenImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const viewRef = useRef<any>(null);
  const lastTouch = useRef({ x: 0, y: 0 });
  const initialDistance = useRef<number | null>(null);

  // Reset scale and translation when modal opens/closes or image changes
  useEffect(() => {
    if (visible) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [visible, imageUri]);

  // Bind mouse scroll wheel zoom on Web
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 0.08;
        setScale((prev) => {
          const next = e.deltaY < 0 ? prev + zoomFactor : prev - zoomFactor;
          const bounded = Math.max(1, Math.min(next, 5));
          if (bounded === 1) {
            setTranslate({ x: 0, y: 0 });
          }
          return bounded;
        });
      };

      // Since Webpack/React Native Web mounts components inside standard divs,
      // we wait a brief frame to bind to document or viewRef.
      const timer = setTimeout(() => {
        if (viewRef.current) {
          const element = viewRef.current;
          element.addEventListener('wheel', handleWheel, { passive: false });
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        if (viewRef.current) {
          const element = viewRef.current;
          element.removeEventListener('wheel', handleWheel);
        }
      };
    }
  }, [visible, imageUri]);

  const handleDownload = () => {
    if (!imageUri) return;
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = imageUri;
      // Extract file format from base64 prefix if possible
      let ext = 'png';
      if (imageUri.startsWith('data:image/jpeg')) ext = 'jpg';
      else if (imageUri.startsWith('data:image/webp')) ext = 'webp';
      else if (imageUri.startsWith('data:image/gif')) ext = 'gif';
      
      link.download = `medical_document.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // In mobile environment, download could be handled via Share or FileSystem,
      // but since this is React Native Web workspace, standard web download is primary.
      alert('Download started on web browser.');
    }
  };

  const handleStartShouldSetResponder = (evt: any) => {
    const touches = evt.nativeEvent.touches || [];
    if (touches.length === 2) {
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      initialDistance.current = Math.sqrt(dx * dx + dy * dy);
    } else {
      const pageX = evt.nativeEvent.pageX ?? evt.nativeEvent.clientX ?? 0;
      const pageY = evt.nativeEvent.pageY ?? evt.nativeEvent.clientY ?? 0;
      lastTouch.current = { x: pageX, y: pageY };
    }
    return true;
  };

  const handleResponderMove = (evt: any) => {
    const touches = evt.nativeEvent.touches || [];
    if (touches.length === 2 && initialDistance.current !== null) {
      // Pinch to Zoom
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const ratio = distance / initialDistance.current;
      
      setScale((prev) => {
        const next = prev * ratio;
        const bounded = Math.max(1, Math.min(next, 5));
        if (bounded === 1) {
          setTranslate({ x: 0, y: 0 });
        }
        return bounded;
      });
      initialDistance.current = distance;
    } else if (touches.length <= 1) {
      // Pan image if scaled
      if (scale > 1) {
        const pageX = evt.nativeEvent.pageX ?? evt.nativeEvent.clientX ?? 0;
        const pageY = evt.nativeEvent.pageY ?? evt.nativeEvent.clientY ?? 0;
        const dx = pageX - lastTouch.current.x;
        const dy = pageY - lastTouch.current.y;
        lastTouch.current = { x: pageX, y: pageY };

        setTranslate((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      }
    }
  };

  const handleResponderRelease = () => {
    initialDistance.current = null;
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setTranslate({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        ref={viewRef}
        style={styles.container}
        onStartShouldSetResponder={handleStartShouldSetResponder}
        onResponderMove={handleResponderMove}
        onResponderRelease={handleResponderRelease}
      >
        {/* Header Actions */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Document View</Text>

          <TouchableOpacity style={styles.iconButton} onPress={handleDownload} activeOpacity={0.7}>
            <Text style={styles.iconText}>↓</Text>
          </TouchableOpacity>
        </View>

        {/* Zoomable Image Container */}
        <View style={styles.imageWrapper}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.image,
                {
                  transform: [
                    { translateX: translate.x },
                    { translateY: translate.y },
                    { scale: scale },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.errorText}>No Image Data Available</Text>
          )}
        </View>

        {/* Bottom Floating Control Bar */}
        <View style={styles.controlBar}>
          <TouchableOpacity style={styles.controlBtn} onPress={zoomOut} disabled={scale <= 1}>
            <Text style={[styles.controlText, scale <= 1 && styles.disabledText]}>－</Text>
          </TouchableOpacity>

          <View style={styles.scaleDisplay}>
            <Text style={styles.scaleText}>{Math.round(scale * 100)}%</Text>
          </View>

          <TouchableOpacity style={styles.controlBtn} onPress={zoomIn} disabled={scale >= 5}>
            <Text style={[styles.controlText, scale >= 5 && styles.disabledText]}>＋</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.controlBtn} onPress={resetZoom}>
            <Text style={styles.controlText}>↺</Text>
          </TouchableOpacity>
        </View>

        {/* Floating instruction tooltip */}
        {scale > 1 && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>Drag to pan around the image</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 29, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
    backgroundColor: 'rgba(10, 15, 29, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.7,
    maxHeight: '80%',
    maxWidth: '90%',
  },
  errorText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  controlBar: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 28, 48, 0.85)',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  scaleDisplay: {
    paddingHorizontal: 12,
    minWidth: 54,
    alignItems: 'center',
  },
  scaleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  tooltip: {
    position: 'absolute',
    bottom: 84,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    zIndex: 5,
  },
  tooltipText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '500',
  },
});
