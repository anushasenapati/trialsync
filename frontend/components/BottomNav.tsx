// // components/BottomTabNavigator.tsx
// import { Ionicons } from '@expo/vector-icons';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import React from 'react';
// import HomeScreen from '../app/(tabs)/home';
// import ProfileScreen from '../app/(tabs)/profile';

// const Tab = createBottomTabNavigator();

// export default function BottomTabNavigator() {
//   return (
//     <Tab.Navigator screenOptions={({ route }) => ({
//       headerShown: false,
//       tabBarActiveTintColor: '#7c3aed',
//       tabBarInactiveTintColor: '#888',
//       tabBarIcon: ({ color, size }) => {
//         const icon = route.name === 'Home' ? 'home' : 'person';
//         return <Ionicons name={icon} size={size} color={color} />;
//       },
//     })}>
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// }
