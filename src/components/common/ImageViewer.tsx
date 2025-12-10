import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  const { colors } = useTheme();
  const [isZoomed, setIsZoomed] = useState(false);

  // Shared values for animations
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Reset values when modal closes
  React.useEffect(() => {
    if (!visible) {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 0;
      setIsZoomed(false);
    } else {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [visible]);

  const resetZoom = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    setIsZoomed(false);
  };

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(resetZoom)();
      runOnJS(onClose)();
    });
  };

  // Pinch gesture for zoom - has highest priority
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      // When pinch starts, mark as zoomed
      setIsZoomed(true);
    })
    .onUpdate((event) => {
      const newScale = Math.max(1, Math.min(event.scale, 4));
      scale.value = newScale;
      if (newScale > 1) {
        setIsZoomed(true);
      }
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        setIsZoomed(false);
      } else {
        // Limit scale to max 4x
        if (scale.value > 4) {
          scale.value = withSpring(4);
        }
      }
    });

  // Pan gesture for moving zoomed image (only when zoomed, single finger)
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      // Only allow pan if already zoomed
      if (scale.value <= 1) {
        return;
      }
    })
    .onUpdate((event) => {
      // Only allow pan when zoomed
      if (scale.value > 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      // Constrain translation to keep image within bounds
      if (scale.value > 1) {
        const maxTranslateX = (SCREEN_WIDTH * (scale.value - 1)) / 2;
        const maxTranslateY = (SCREEN_HEIGHT * (scale.value - 1)) / 2;

        if (Math.abs(translateX.value) > maxTranslateX) {
          translateX.value = withSpring(
            translateX.value > 0 ? maxTranslateX : -maxTranslateX
          );
        }
        if (Math.abs(translateY.value) > maxTranslateY) {
          translateY.value = withSpring(
            translateY.value > 0 ? maxTranslateY : -maxTranslateY
          );
        }
      }
    });

  // Swipe down gesture to close (only when not zoomed, single finger, vertical)
  // This gesture should fail if pinch is detected (two fingers)
  const swipeDownGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1) // Only single finger - this prevents conflict with pinch (two fingers)
    .activeOffsetY(50) // Require at least 50px vertical movement before activating (gives time for pinch detection)
    .failOffsetX([-40, 40]) // Fail if horizontal movement is significant (indicates horizontal pan or pinch start)
    .onStart(() => {
      // Immediately cancel if already zoomed
      if (scale.value > 1) {
        return;
      }
    })
    .onUpdate((event) => {
      // Only allow swipe down when not zoomed and moving vertically downward
      // Check that we're not zoomed and moving primarily vertically
      if (scale.value === 1 && event.translationY > 0 && Math.abs(event.translationX) < Math.abs(event.translationY) * 0.5) {
        translateY.value = event.translationY;
        opacity.value = Math.max(0, 1 - event.translationY / SCREEN_HEIGHT);
      } else {
        // Cancel if zoomed during gesture
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    })
    .onEnd((event) => {
      if (scale.value === 1 && (event.translationY > 100 || event.velocityY > 500)) {
        handleClose();
      } else {
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    })
    .requireExternalGestureToFail(pinchGesture);

  // Double tap gesture for quick zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.5) {
        resetZoom();
      } else {
        scale.value = withSpring(2);
        setIsZoomed(true);
      }
    })
    .requireExternalGestureToFail(pinchGesture);

  // Compose gestures
  // Priority: pinch+pan (simultaneous) > swipe down > double tap
  // Since swipeDown has maxPointers(1), it won't activate during pinch (which needs 2 fingers)
  const composedGesture = Gesture.Race(
    Gesture.Simultaneous(pinchGesture, panGesture),
    Gesture.Race(swipeDownGesture, doubleTapGesture)
  );

  // Animated styles
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (!imageUri) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={!isZoomed ? handleClose : undefined}
        >
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.background.paper }]}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <GestureDetector gesture={composedGesture}>
            <Animated.View style={styles.imageContainer}>
              <Animated.View style={imageAnimatedStyle}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default ImageViewer;

