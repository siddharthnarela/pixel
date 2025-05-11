import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';


// Memoized Pixel component that only re-renders when its color changes
const Pixel = memo(({ color }) => {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        backgroundColor: color,
        borderWidth: 0.5,
        borderColor: '#ddd',
      }}
    />
  );
});
