import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileBuilderScreen from '../screens/ProfileBuilderScreen';
import DoctorDashboard from '../screens/DoctorDashboard';
import PatientDashboard from '../screens/PatientDashboard';
import MyProfileScreen from '../screens/MyProfileScreen';

export type RouteName = 'Splash' | 'Login' | 'ProfileBuilder' | 'Home' | 'PatientDashboard' | 'MyProfile';

export default function AppNavigator() {
  const [route, setRoute] = useState<RouteName>('Splash');
  const [params, setParams] = useState<any>({});

  // Simple navigation object passed as prop to each screen
  const navigation = {
    replace: (name: RouteName, screenParams?: any) => {
      if (screenParams) {
        setParams(screenParams);
      } else {
        setParams({});
      }
      setRoute(name);
    },
    navigate: (name: RouteName, screenParams?: any) => {
      if (screenParams) {
        setParams(screenParams);
      } else {
        setParams({});
      }
      setRoute(name);
    },
  };

  const renderScreen = () => {
    switch (route) {
      case 'Splash':
        return <SplashScreen navigation={navigation} />;
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'ProfileBuilder':
        return <ProfileBuilderScreen navigation={navigation} routeParams={params} />;
      case 'Home':
        return <DoctorDashboard navigation={navigation} />;
      case 'PatientDashboard':
        return <PatientDashboard navigation={navigation} />;
      case 'MyProfile':
        return <MyProfileScreen navigation={navigation} />;
      default:
        return <SplashScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.root}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Ensure the root fills the full browser height on web
    minHeight: ('100vh' as any),
  },
});
