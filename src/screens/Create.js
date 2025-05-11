import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Image,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function Create() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const navigation = useNavigation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;

  const handleCreateCanvas = () => {
    // Validate inputs
    const pixelWidth = parseInt(width);
    const pixelHeight = parseInt(height);
    
    if (isNaN(pixelWidth) || isNaN(pixelHeight)) {
      Alert.alert('Invalid Input', 'Width and height must be numbers');
      return;
    }
    
    if (pixelWidth <= 0 || pixelHeight <= 0) {
      Alert.alert('Invalid Dimensions', 'Width and height must be greater than 0');
      return;
    }
    
    if (pixelWidth > 100 || pixelHeight > 100) {
      Alert.alert('Dimensions Too Large', 'Maximum dimension is 100x100 pixels');
      return;
    }
    
    // Navigate to canvas with dimensions
    navigation.navigate('Editor', {
      width: pixelWidth,
      height: pixelHeight
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row">

        
        
        {/* Right side: Input form */}
        <View className="p-6 justify-center w-full">
          <Text className="text-white text-2xl font-bold mb-6">Create New Canvas</Text>
          
          <View className="bg-gray-800 rounded-lg p-6 mb-6">
            <Text className="text-white text-lg mb-4">Canvas Dimensions</Text>
            
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-300 mb-2">Width (pixels)</Text>
                <TextInput
                  className="bg-gray-700 text-white px-4 py-3 rounded-md"
                  placeholder="Enter width"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={width}
                  onChangeText={setWidth}
                />
              </View>
              
              <View className="flex-1 ml-2">
                <Text className="text-gray-300 mb-2">Height (pixels)</Text>
                <TextInput
                  className="bg-gray-700 text-white px-4 py-3 rounded-md"
                  placeholder="Enter height"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
            </View>
          </View>
          
          <View className="mb-6">
            <Text className="text-gray-300 mb-2">Recommended sizes:</Text>
            <View className="flex-row flex-wrap">
              <TouchableOpacity 
                className="bg-blue-900 m-1 px-3 py-2 rounded-md"
                onPress={() => {
                  setWidth('16');
                  setHeight('16');
                }}>
                <Text className="text-white">16 × 16</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-900 m-1 px-3 py-2 rounded-md"
                onPress={() => {
                  setWidth('32');
                  setHeight('32');
                }}>
                <Text className="text-white">32 × 32</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-900 m-1 px-3 py-2 rounded-md"
                onPress={() => {
                  setWidth('64');
                  setHeight('64');
                }}>
                <Text className="text-white">64 × 64</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-900 m-1 px-3 py-2 rounded-md"
                onPress={() => {
                  setWidth('48');
                  setHeight('24');
                }}>
                <Text className="text-white">48 × 24</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            className="bg-purple-600 absolute right-6 bottom-5 rounded-xl py-4 px-6 mt-6"
            onPress={handleCreateCanvas}>
            <Text className="text-white text-center font-bold text-lg">Create Canvas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}