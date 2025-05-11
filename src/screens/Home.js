import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Feather } from '@expo/vector-icons'; // Assuming you're using Expo
import Gallery from './Gallery';
export default function Home({ navigation }) {
  const [activeTab, setActiveTab] = useState('gallery');

  // Tab configuration
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'explore', icon: 'compass', label: 'Explore' },
    { id: 'create', icon: 'plus-circle', label: 'Create' },
    { id: 'gallery', icon: 'grid', label: 'Gallery' },
    { id: 'profile', icon: 'user', label: 'Profile' }
  ];

  // Handle tab press
  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    // You can add navigation logic here if needed
    // navigation.navigate(tabId);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Main Content Area */}
      <View className="flex-1 p-5">
        {activeTab === 'gallery' && <Gallery />}
        {activeTab === 'home' && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-xl">Home Screen</Text>
          </View>
        )}
        {activeTab === 'explore' && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-xl">Explore Screen</Text>
          </View>
        )}
        {activeTab === 'create' && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-xl">Create Screen</Text>
          </View>
        )}
        {activeTab === 'profile' && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-xl">Profile Screen</Text>
          </View>
        )}
      </View>
      
      {/* Modern Tab Bar */}
      <View className="bg-gray-900 border-t border-gray-800">
        <SafeAreaView edges={['bottom']} className="bg-transparent">
          <View className="flex-row justify-between items-center h-16 px-2">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const labelColor = isActive ? 'text-blue-400' : 'text-gray-400';
              const iconColor = isActive ? '#60a5fa' : '#9ca3af';
              
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => handleTabPress(tab.id)}
                  className="flex-1 items-center justify-center h-full"
                  style={tab.id === 'create' ? { marginTop: -20 } : {}}
                >
                  {tab.id === 'create' ? (
                    <View className="bg-blue-500 rounded-full w-14 h-14 items-center justify-center">
                      <Feather name={tab.icon} size={28} color="#ffffff" />
                    </View>
                  ) : (
                    <>
                      <Feather name={tab.icon} size={22} color={iconColor} />
                      <Text className={`text-xs mt-1 ${labelColor}`}>{tab.label}</Text>
                    </>
                  )}
                  
                  {isActive && tab.id !== 'create' && (
                    <View className="absolute bottom-0 w-10 h-1 bg-blue-400 rounded-t-full" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}