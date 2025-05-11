import { View, Text, TouchableOpacity, StatusBar, Image, ScrollView, Alert, TextInput } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Canvas from '../widgets/Canvas';
import ColorPicker from '../widgets/ColorPicker';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import StorageService from '../utils/StorageService';
import Modal from 'react-native-modal';

export default function Editor({route}) {
  const { width, height } = route.params;
  const [currentColor, setCurrentColor] = useState('#000000');
  const [selectedTool, setSelectedTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(1);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pixelSize, setPixelSize] = useState(20); // Default pixel size
  const [isSaveModalVisible, setSaveModalVisible] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState('');
  const navigation = useNavigation();
  const canvasRef = useRef(null);
  const viewShotRef = useRef(null);
  const [tempImageUri, setTempImageUri] = useState(null);

  const [gridVisible, setGridVisible] = useState(true);
  // Tools list
  const tools = [
    { id: 'brush', icon: 'brush', label: 'Brush' },
    { id: 'eraser', icon: 'eraser', label: 'Eraser' },
    { id: 'fill', icon: 'format-color-fill', label: 'Fill' },
    { id: 'eyedropper', icon: 'eyedropper', label: 'Picker' },
  ];

  // Brush sizes
  const brushSizes = [1, 2, 3, 5];

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'We need media library permissions to save your artwork.');
      }
    })();
  }, []);

  const handleColorChange = (color) => {
    setCurrentColor(color);
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (canvasRef.current) {
      canvasRef.current.redo();
    }
  };

  const handleGridToggle = () => {
    if (canvasRef.current) {
      canvasRef.current.toggleGrid();
    }
  }

  const handleClear = () => {
    Alert.alert(
      "Clear Canvas",
      "Are you sure you want to clear the entire canvas?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", onPress: () => canvasRef.current && canvasRef.current.clear() }
      ]
    );
  };

  const captureCanvas = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        // First save to media library
        await MediaLibrary.saveToLibraryAsync(uri);
        // Then set temp uri for our internal storage
        setTempImageUri(uri);
        // Show save modal
        setSaveModalVisible(true);
      }
    } catch (error) {
      console.error("Error capturing canvas:", error);
      Alert.alert("Error", "Failed to capture your artwork.");
    }
  };

  const handleSave = async () => {
    try {
      if (!tempImageUri) {
        await captureCanvas();
        return;
      }
      
      // Save to local storage
      const title = artworkTitle || `Pixel Art ${new Date().toLocaleString()}`;
      const savedArtwork = await StorageService.saveArtwork(tempImageUri, title, width, height);
      
      if (savedArtwork) {
        setSaveModalVisible(false);
        setTempImageUri(null);
        setArtworkTitle('');
        
        Alert.alert(
          "Saved Successfully",
          "Your pixel art has been saved to your gallery!",
          [
            { 
              text: "View Gallery", 
              onPress: () => navigation.navigate('Gallery') 
            },
            { 
              text: "Continue Editing", 
              style: "cancel" 
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error saving artwork:", error);
      Alert.alert("Error", "Failed to save your artwork to gallery.");
    }
  };

  const handleZoomIn = () => {
    setPixelSize(prev => Math.min(prev + 5, 50));
  };

  const handleZoomOut = () => {
    setPixelSize(prev => Math.max(prev - 5, 10));
  };

  return ( 
    <View style={{ flex: 1, backgroundColor: 'black', padding: 10 }}>
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: 'black'
      }}>
        <TouchableOpacity 
          style={{ padding: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#E94560" />
        </TouchableOpacity>
        
        <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', 
            zIndex: 10,
            backgroundColor: 'rgba(22, 33, 62, 0.7)',
            borderRadius: 20,
            padding: 6
          }}>
            <TouchableOpacity style={{ padding: 8 }} onPress={handleUndo}>
              <Feather name="corner-up-left" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }} onPress={handleRedo}>
              <Feather name="corner-up-right" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }} onPress={handleClear}>
              <Feather name="trash-2" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }} onPress={handleGridToggle}>
              <Feather name="grid" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }} onPress={handleZoomIn}>
              <Feather name="zoom-in" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 8 }} onPress={handleZoomOut}>
              <Feather name="zoom-out" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#E94560', 
            paddingHorizontal: 12, 
            paddingVertical: 6, 
            borderRadius: 6 
          }}
          onPress={captureCanvas}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Left sidebar - Tools */}
        <View style={{ 
          width: 80, 
          backgroundColor: 'black', 
          padding: 12,
          alignItems: 'center'
        }}>
          {tools.map(tool => (
            <TouchableOpacity 
              key={tool.id}
              style={{ 
                marginBottom: 20, 
                alignItems: 'center',
                backgroundColor: selectedTool === tool.id ? '#0F3460' : 'transparent',
                padding: 8,
                borderRadius: 8,
                width: '100%'
              }}
              onPress={() => setSelectedTool(tool.id)}
            >
              <MaterialCommunityIcons 
                name={tool.icon} 
                size={24} 
                color={selectedTool === tool.id ? '#E94560' : '#fff'} 
              />
              <Text style={{ 
                color: selectedTool === tool.id ? '#E94560' : '#fff', 
                fontSize: 10,
                marginTop: 4 
              }}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}

          
        </View>
        
        {/* Center - Canvas */}
        <ScrollView>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
            <View style={{ 
              backgroundColor: 'white', 
              padding: 2, 
              // borderRadius: 10, 
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <ScrollView horizontal={true} style={{ maxWidth: '100%' }}>
                <ScrollView>
                  <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
                    <Canvas 
                      ref={canvasRef}
                      height={height} 
                      width={width} 
                      drawingColor={currentColor} 
                      tool={selectedTool}
                      brushSize={brushSize}
                      pixelSize={pixelSize}
                      onColorPicked={handleColorChange}
                    />
                  </ViewShot>
                </ScrollView>
              </ScrollView>
            </View>
          </View>
        </ScrollView>
        
        {/* Right sidebar - Color picker */}
        <View style={{ 
          width: 170, 
          backgroundColor: 'black', 
          padding: 12,
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 12, marginBottom: 12, fontWeight: 'bold' }}>Color Palette</Text>
          
          <TouchableOpacity
            style={{
              width: '80%',
              height: 40,
              backgroundColor: currentColor,
              borderRadius: 6,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'white'
            }}
            onPress={() => setShowColorPicker(!showColorPicker)}
          />
          
          {showColorPicker ? (
            <ColorPicker
              color={currentColor}
              onColorChange={handleColorChange}
            />
          ) : (
            <View style={{ width: '100%' }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
                  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
                  '#008000', '#FFC0CB'
                ].map(color => (
                  <TouchableOpacity
                    key={color}
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: color,
                      margin: 4,
                      borderRadius: 4,
                      borderWidth: color === currentColor ? 2 : 0,
                      borderColor: '#E94560'
                    }}
                    onPress={() => handleColorChange(color)}
                  />
                ))}
              </View>
              
              <TouchableOpacity
                style={{
                  backgroundColor: '#0F3460',
                  padding: 12,
                  borderRadius: 6,
                  marginTop: 16,
                  alignItems: 'center'
                }}
                onPress={() => setShowColorPicker(true)}
              >
                <Text style={{ color: 'white' }}>Custom Color</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Save Modal */}
      <Modal 
        isVisible={isSaveModalVisible}
        backdropOpacity={0.8}
        onBackdropPress={() => setSaveModalVisible(false)}
        style={{ justifyContent: 'center', margin: 20 }}
      >
        <View style={{ 
          backgroundColor: '#16213E', 
          borderRadius: 10, 
          padding: 20, 
          alignItems: 'center' 
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            Save Your Artwork
          </Text>
          
          {tempImageUri && (
            <Image 
              source={{ uri: tempImageUri }} 
              style={{ width: 150, height: 150, marginBottom: 15, borderRadius: 5 }} 
              resizeMode="contain"
            />
          )}
          
          <TextInput
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              width: '100%', 
              borderRadius: 5, 
              padding: 10, 
              color: 'white',
              marginBottom: 20
            }}
            placeholder="Give your artwork a title..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={artworkTitle}
            onChangeText={setArtworkTitle}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                padding: 12, 
                borderRadius: 5, 
                width: '48%',
                alignItems: 'center'
              }}
              onPress={() => {
                setSaveModalVisible(false);
                setTempImageUri(null);
              }}
            >
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{ 
                backgroundColor: '#E94560', 
                padding: 12, 
                borderRadius: 5, 
                width: '48%',
                alignItems: 'center'
              }}
              onPress={handleSave}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Save to Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}