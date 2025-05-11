// utils/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const STORAGE_KEY = '@pixel_art_gallery';
const IMAGE_DIRECTORY = FileSystem.documentDirectory + 'pixel_art/';

// Ensure the directory exists
const setupDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIRECTORY, { intermediates: true });
  }
};

// Initialize storage on app start
export const initStorage = async () => {
  try {
    await setupDirectory();
    const artworks = await getArtworks();
    if (!artworks) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Get all artworks
export const getArtworks = async () => {
  try {
    const artworksJson = await AsyncStorage.getItem(STORAGE_KEY);
    return artworksJson ? JSON.parse(artworksJson) : [];
  } catch (error) {
    console.error('Error getting artworks:', error);
    return [];
  }
};

// Save a new artwork
export const saveArtwork = async (imageUri, title, width, height) => {
  try {
    await setupDirectory();
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileName = `pixel_art_${timestamp}.png`;
    const fileUri = IMAGE_DIRECTORY + fileName;
    
    // Save the image file
    await FileSystem.copyAsync({
      from: imageUri,
      to: fileUri
    });
    
    // Create artwork metadata
    const newArtwork = {
      id: timestamp.toString(),
      title: title || `Artwork ${timestamp}`,
      artist: 'You',
      resolution: `${width}x${height}`,
      category: 'My Art',
      imageUri: fileUri,
      createdAt: timestamp,
      borderColorStart: getRandomColor(),
      borderColorEnd: getRandomColor(),
    };
    
    // Update storage
    const artworks = await getArtworks();
    artworks.unshift(newArtwork); // Add new artwork at the beginning
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(artworks));
    
    return newArtwork;
  } catch (error) {
    console.error('Error saving artwork:', error);
    Alert.alert('Error', 'Failed to save your artwork.');
    return null;
  }
};

// Delete an artwork
export const deleteArtwork = async (id) => {
  try {
    const artworks = await getArtworks();
    const artwork = artworks.find(item => item.id === id);
    
    if (artwork && artwork.imageUri) {
      // Delete the image file
      const fileInfo = await FileSystem.getInfoAsync(artwork.imageUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(artwork.imageUri);
      }
    }
    
    // Update storage
    const updatedArtworks = artworks.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArtworks));
    
    return true;
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return false;
  }
};

// Helper function to generate random colors for artwork borders
const getRandomColor = () => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33',
    '#FF8C00', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default {
  initStorage,
  getArtworks,
  saveArtwork,
  deleteArtwork
};