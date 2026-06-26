import { AppRegistry, Platform } from 'react-native';
import App from './src/App';

const appName = 'doctor-app-frontend';

AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === 'web') {
  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById('root')
  });
}
