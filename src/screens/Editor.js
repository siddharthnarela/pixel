import { View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Editor from '../widgets/Canvas';
import ZoomableView from '../widgets/ZoomableView';

export default function Home() {
  return ( 
    <View>
        <Editor height={10} width={20} />
    </View>
  );
}