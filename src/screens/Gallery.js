// screens/Gallery.js
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelArtCard from '../widgets/Art';
import { StatusBar } from 'expo-status-bar';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Sample pixel art data
  const pixelArtData = [
    {
      id: '1',
      title: 'Charmander Pixel Art',
      artist: 'Cauchemarr',
      resolution: '32x32',
      collection: 'Pokemon',
      category: 'Gaming',
      imageUrl: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/90682aa2-4460-440d-a1e3-d268a624d917/dchimc7-bc6a34f5-e272-400b-a555-136e725976ee.png/v1/fill/w_1024,h_576,q_80,strp/charmander___minecraft_pixel_art___pokemon_by_cauchemarr_dchimc7-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NTc2IiwicGF0aCI6IlwvZlwvOTA2ODJhYTItNDQ2MC00NDBkLWExZTMtZDI2OGE2MjRkOTE3XC9kY2hpbWM3LWJjNmEzNGY1LWUyNzItNDAwYi1hNTU1LTEzNmU3MjU5NzZlZS5wbmciLCJ3aWR0aCI6Ijw9MTAyNCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.eTE9P2pT1jCCX0X_x4jjgrZbTd-U5tu9LCEJ1U1ZR-g',
      borderColorStart: '#ff8c00',
      borderColorEnd: '#ff4500',
    },
    {
      id: '2',
      title: 'Minecraft Landscape',
      artist: 'PixelCrafter',
      resolution: '64x64',
      collection: 'Landscapes',
      category: 'Gaming',
      imageUrl: 'https://i.pinimg.com/originals/bf/7e/75/bf7e75f981b12e4217c879c66d01e609.png',
      borderColorStart: '#4CAF50',
      borderColorEnd: '#8BC34A',
    },
    {
      id: '3',
      title: 'Retro City Scene',
      artist: 'VaporArtist',
      resolution: '128x96',
      collection: 'Cityscape',
      category: 'Scenery',
      imageUrl: 'https://img.freepik.com/premium-vector/pixel-art-cityscape-background_272375-104.jpg',
      borderColorStart: '#9C27B0',
      borderColorEnd: '#E91E63',
    },
    {
      id: '4',
      title: 'Space Invader',
      artist: 'RetroGamer',
      resolution: '16x16',
      collection: 'Classics',
      category: 'Gaming',
      imageUrl: 'https://i.pinimg.com/originals/57/d0/c3/57d0c31cce667a6d8b5329855a36196d.png',
      borderColorStart: '#2196F3',
      borderColorEnd: '#03A9F4',
    },
    {
      id: '5',
      title: 'Sunset Beach',
      artist: 'PixelDreamer',
      resolution: '64x48',
      collection: 'Nature',
      category: 'Scenery',
      imageUrl: 'https://img.freepik.com/premium-vector/pixel-art-beach-sunset-background_319667-1083.jpg',
      borderColorStart: '#FF9800',
      borderColorEnd: '#FFEB3B',
    },
    {
      id: '6',
      title: 'Cyberpunk Character',
      artist: 'NeonPixel',
      resolution: '48x48',
      collection: 'Characters',
      category: 'Portraits',
      imageUrl: 'https://img.freepik.com/premium-vector/pixel-art-cyberpunk-girl-vaporwave-background_155807-459.jpg',
      borderColorStart: '#9C27B0',
      borderColorEnd: '#2196F3',
    },
  ];
  
  // Categories extracted from data
  const categories = ['All', ...new Set(pixelArtData.map(item => item.category))];
  
  // Filter data based on active category
  const filteredData = activeCategory === 'All' 
    ? pixelArtData 
    : pixelArtData.filter(item => item.category === activeCategory);
  
  // Render category chip buttons
  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category}
      onPress={() => setActiveCategory(category)}
      className={`px-4 py-2 rounded-full mr-2 ${
        activeCategory === category ? 'bg-blue-500' : 'bg-gray-700'
      }`}
    >
      <Text className={`${
        activeCategory === category ? 'text-white' : 'text-gray-300'
      } font-medium`}>{category}</Text>
    </TouchableOpacity>
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
        data={filteredData}
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