// widgets/PixelArtCard.js
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function PixelArtCard({ item }) {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Card border animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
  const handlePress = () => {
    // Card press animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();
    
    // Navigate to detail screen with item data
    navigation.navigate('ArtDetail', { item });
  };
  
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [item.borderColorStart || '#3d85c6', item.borderColorEnd || '#ff6b6b']
  });
  
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={handlePress}
      className="mx-2"
    >
      <Animated.View 
        className="rounded-xl overflow-hidden shadow-lg bg-gray-900" 
        style={{
          transform: [{ scale: scaleAnim }],
          borderWidth: 1,
          borderColor: borderColor,
          width: 150,
        }}
      >
        {/* Image Container */}
        <View className="bg-black w-full aspect-square">
          <Image 
            className="w-full h-full" 
            source={{ uri: item.imageUrl }}
            resizeMode="cover"
          />
        </View>
        
        {/* Footer */}
        <View className="bg-gray-800 px-3 py-2">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>{item.title}</Text>
          <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>{item.collection}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}