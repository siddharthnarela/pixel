import 'react-native-gesture-handler'; // Must be first
import 'react-native-reanimated';

import './global.css'
import { createStackNavigator } from '@react-navigation/stack';


import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Home from './src/screens/Home';
import Editor from './src/screens/Editor';
export default function App() {

  const Stack = createStackNavigator();

  return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Editor" component={Editor} />
        </Stack.Navigator>
        <StatusBar hidden={true} />
      </NavigationContainer>
  );
}