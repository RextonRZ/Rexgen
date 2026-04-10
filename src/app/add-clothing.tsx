import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AddClothingScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1, // Capture at high quality, we will compress immediately after
          skipProcessing: true, // Speeds up capture
        });

        if (photo?.uri) {
          // Compress the image down immediately to save memory and upload time later
          const compressed = await ImageManipulator.manipulateAsync(
            photo.uri,
            [{ resize: { width: 1080 } }], // Resize large dimension to 1080px max
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          
          setCapturedImages(prev => [...prev, compressed.uri]);
        }
      } catch (error) {
        console.error("Failed to take photo:", error);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setCapturedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDone = () => {
    // Navigate to the next step, passing the images through router params 
    // or you could use a global state manager (Zustand/Context) to hold these.
    // E.g. router.push({ pathname: '/add-details', params: { images: JSON.stringify(capturedImages) } });
    console.log("Ready to process images:", capturedImages.length);
    // placeholder:
    // router.push('/add-details');
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        
        {/* Overlay Matrix for Guiding User */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayCenterRow}>
            <View style={styles.overlaySide} />
            <View style={styles.guideFrame}>
              {/* Corner Indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.instructionText}>Place clothing inside the frame</Text>
            <Text style={styles.subInstructionText}>Avoid cluttered background • Ensure good lighting</Text>
          </View>
        </View>

        {/* Camera Controls Layer */}
        <View style={styles.controlsContainer}>
          
          {/* Images Thumbnail List */}
          <View style={styles.thumbnailContainer}>
            <FlatList
              data={capturedImages}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.thumbnailWrapper}>
                  <Image source={{ uri: item }} style={styles.thumbnail} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          <View style={styles.bottomBar}>
            {/* Flip Camera Button */}
            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity style={styles.captureButtonOuter} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            {/* Done Button (Only shows if > 0 images) */}
            {capturedImages.length > 0 ? (
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done ({capturedImages.length})</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 64 }} /> // Placeholder for spacing
            )}
          </View>
        </View>

      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#208AEF',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  /* OVERLAY STYLES */
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayCenterRow: {
    flexDirection: 'row',
    height: 400, // Size of the bounding box
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  guideFrame: {
    width: 300,
    height: 400,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    paddingTop: 15,
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  subInstructionText: {
    color: '#ccc',
    marginTop: 5,
    fontSize: 12,
  },
  /* CORNERS */
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 },
  /* CAMERA CONTROLS */
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  thumbnailContainer: {
    height: 80,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  thumbnailWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
  },
  iconButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  captureButtonOuter: {
    width: 76,
    height: 76,
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
  },
  doneButton: {
    backgroundColor: '#208AEF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: 100, // Slightly fixed width so things roughly stay centered
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
