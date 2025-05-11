import React from 'react';
import { View } from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withDecay,
  withTiming,
} from 'react-native-reanimated';

export default function ZoomableView({ children }) {
  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      scale.value = withTiming(1, { duration: 200 }); // reset to 1
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    },
    onEnd: (event) => {
      translationX.value = withDecay({ velocity: event.velocityX });
      translationY.value = withDecay({ velocity: event.velocityY });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={panHandler}>
      <Animated.View style={{ flex: 1 }}>
        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            {children}
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}
