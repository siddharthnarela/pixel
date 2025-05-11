// screens/Gallery.js
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelArtCard from '../widgets/Art';
import { StatusBar } from 'expo-status-bar';
import StorageService from '../utils/StorageService';
import { useFocusEffect } from '@react-navigation/native';

export default function Gallery() {
  const [pixelArtData, setPixelArtData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadArtworks = async () => {
    setIsLoading(true);
    try {
      // Initialize storage
      await StorageService.initStorage();
      
      // Get locally saved artworks
      const savedArtworks = await StorageService.getArtworks();
      
      // Process saved artworks to match the format needed
      const processedSavedArtworks = savedArtworks.map(item => ({
        ...item,
        // For local artworks, we use imageUri instead of imageUrl
        // The PixelArtCard component needs to be updated to handle this
      }));
      
      // Combine sample data with saved artworks
      const allArtworks = [...processedSavedArtworks];
      setPixelArtData(allArtworks);

    } catch (error) {
      console.error('Error loading artworks:', error);
      Alert.alert('Error', 'Failed to load artworks from storage.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      loadArtworks();
    }, [])
  );
  
  

  return (
    <View className="p">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-white text-2xl font-bold">Pixel Art Gallery</Text>
        <Text className="text-gray-400 mt-1">Discover amazing pixel artwork</Text>
      </View>
      
      
      
      {/* Gallery */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={pixelArtData}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => <PixelArtCard item={item} />}
        contentContainerStyle={{paddingHorizontal: 12, paddingVertical: 8}}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={264} // Card width (240) + margins (24)
        className="flex-grow"
      />
      

    </View>
  );
}