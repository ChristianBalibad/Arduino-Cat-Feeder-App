import { LogBox } from 'react-native';

LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

const deprecationMessage = 'props.pointerEvents is deprecated';
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && String(args[0]).includes(deprecationMessage)) return;
  originalWarn.apply(console, args);
};

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
