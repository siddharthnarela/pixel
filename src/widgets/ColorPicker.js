import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Dimensions,
  Pressable
} from 'react-native';
import ColorWheel from 'react-native-wheel-color-picker';
import { Ionicons } from '@expo/vector-icons';
import tinycolor from 'tinycolor2';

const ColorPickerModal = ({ visible, color, onColorChange, onClose }) => {
  const [currentColor, setCurrentColor] = useState(color || '#000000');
  const [hexInput, setHexInput] = useState(color?.replace('#', '') || '000000');
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isLandscape = windowWidth > windowHeight;
  
  // Common colors for pixel art
  const commonColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#A52A2A', '#808080', '#C0C0C0', '#FFC0CB'
  ];
  
  // Sync with external color changes
  useEffect(() => {
    if (color) {
      setCurrentColor(color);
      setHexInput(color.replace('#', ''));
    }
  }, [color]);
  
  const handleColorChange = useCallback((color) => {
    const hexColor = tinycolor(color).toHexString();
    setCurrentColor(hexColor);
    setHexInput(hexColor.replace('#', ''));
    onColorChange(hexColor);
  }, [onColorChange]);
  
  const handleHexChange = (text) => {
    // Clean input to only allow valid hex characters
    const cleanText = text.replace(/[^0-9A-Fa-f]/g, '');
    setHexInput(cleanText);
    
    // Validate hex color
    if (/^[0-9A-Fa-f]{6}$/.test(cleanText)) {
      const hexColor = `#${cleanText}`;
      setCurrentColor(hexColor);
      onColorChange(hexColor);
    }
  };

  const selectColor = (color) => {
    handleColorChange(color);
    // Optional: close the modal after selecting a preset color
    // onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={onClose}
      >
        <Pressable 
          style={[
            styles.modalContainer,
            isLandscape ? styles.landscapeModal : styles.portraitModal
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Color</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#E94560" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.pickerAndControlsContainer}>
              <View style={[
                styles.pickerContainer,
                isLandscape && styles.pickerContainerLandscape
              ]}>
                <ColorWheel
                  style={styles.colorPicker}
                  color={currentColor}
                  onColorChange={handleColorChange}
                  thumbSize={24}
                  sliderSize={24}
                  autoResetSlider={false}
                />
              </View>
              
              <View style={styles.controlsContainer}>
                <View style={styles.colorPreview}>
                  <View style={[styles.previewSwatch, { backgroundColor: currentColor }]} />
                  <Text style={styles.colorHexText}>{currentColor.toUpperCase()}</Text>
                </View>
                
                <View style={styles.hexContainer}>
                  <Text style={styles.hexLabel}>#</Text>
                  <TextInput
                    style={styles.hexInput}
                    value={hexInput}
                    onChangeText={handleHexChange}
                    maxLength={6}
                    placeholder="000000"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>
            
            
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Apply Color</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#16213E',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0F3460',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  portraitModal: {
    width: '85%',
    maxHeight: '80%',
  },
  landscapeModal: {
    width: '70%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0F3460',
    backgroundColor: '#0F3460',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  pickerAndControlsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pickerContainer: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 220,
    marginBottom: 16,
  },
  pickerContainerLandscape: {
    width: '50%',
    marginRight: 16,
  },
  colorPicker: {
    flex: 1,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 150,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewSwatch: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  colorHexText: {
    color: 'white',
    fontSize: 16,
  },
  hexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F3460',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  hexLabel: {
    color: 'white',
    fontSize: 16,
    marginRight: 4,
  },
  hexInput: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    padding: 4,
  },
  commonColorsContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
  },
  commonColorsLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  commonColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  commonColor: {
    width: 36,
    height: 36,
    margin: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#E94560',
  },
  modalFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 16,
    right: '10',
    backgroundColor: '#E94560',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ColorPickerModal;