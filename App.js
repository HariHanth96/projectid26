import SplashScreen from './screens/SplashScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Dimensions
} from 'react-native';
import { Provider } from 'react-redux';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';
import EquipmentPage from './components/EquipmentPage';
import BuildingsPage from './components/BuildingsPage';
import StaffsPage from './components/StaffsPage';
import LoanAndMarketingPage from './components/LoanAndMarketingPage';
import OwnPage from './components/OwnPage';
import Toast from 'react-native-toast-message';
import store from './src/store/store';

const Stack = createNativeStackNavigator();
const screenWidth = Dimensions.get('window').width

function SimulationStacks() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      headerTransparent: true,
    }}>

      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="RegisterForm" component={RegisterForm} />
      <Stack.Screen name="HomePage" component={HomePage} />
      <Stack.Screen name="EquipmentPage" component={EquipmentPage} />
      <Stack.Screen name="BuildingsPage" component={BuildingsPage} />
      <Stack.Screen name="StaffsPage" component={StaffsPage} />
      <Stack.Screen name="LoanAndMarketingPage" component={LoanAndMarketingPage} />
      <Stack.Screen name="OwnPage" component={OwnPage} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <StatusBar style='auto' />
        <Main />
        <Toast></Toast>
      </View>
    </Provider>
  );
}

const Main = () => {
  return (
    <NavigationContainer>
      <SimulationStacks />
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
