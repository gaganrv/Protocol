// App.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { initDatabase } from './src/database/database';
import { Colors, Typography } from './src/theme/colors';
import { Text, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';

// Screens
import SetupScreen from './src/screens/SetupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import CreateInvoiceScreen from './src/screens/CreateInvoiceScreen';
import ViewInvoiceScreen from './src/screens/ViewInvoiceScreen';
import QuotationsScreen from './src/screens/QuotationsScreen';
import CreateQuotationScreen from './src/screens/CreateQuotationScreen';
import ViewQuotationScreen from './src/screens/ViewQuotationScreen';
import SalesScreen from './src/screens/SalesScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: 'Dashboard', component: DashboardScreen, icon: '📊', label: 'Home' },
  { name: 'Invoices', component: InvoicesScreen, icon: '🧾', label: 'Invoices' },
  { name: 'Quotations', component: QuotationsScreen, icon: '📋', label: 'Quotes' },
  { name: 'Sales', component: SalesScreen, icon: '💰', label: 'Sales' },
  { name: 'Reports', component: ReportsScreen, icon: '📈', label: 'Reports' },
  { name: 'Settings', component: SettingsScreen, icon: '⚙️', label: 'Settings' },
];

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const cfg = TAB_CONFIG.find(t => t.name === route.name)!;
      return {
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 86 : 66,
          paddingBottom: Platform.OS === 'ios' ? 22 : 10,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        tabBarLabel: ({ focused, color }) => (
          <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '400', color, marginTop: -2 }}>
            {cfg.label}
          </Text>
        ),
        tabBarIcon: ({ focused }) => (
          <View style={{
            width: 42, height: 36, alignItems: 'center', justifyContent: 'center',
            backgroundColor: focused ? Colors.accent + '22' : 'transparent',
            borderRadius: 10,
          }}>
            <Text style={{ fontSize: focused ? 22 : 19 }}>{cfg.icon}</Text>
          </View>
        ),
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: '#ffffff55',
      };
    }}
  >
    {TAB_CONFIG.map(t => (
      <Tab.Screen key={t.name} name={t.name} component={t.component} />
    ))}
  </Tab.Navigator>
);

const STACK_HEADER = {
  headerStyle: { backgroundColor: Colors.primary },
  headerTintColor: Colors.white,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: Typography.fontSizes.lg },
  headerBackButtonMenuEnabled: false,
};

const AppContent = () => {
  const [isReady, setIsReady] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      const flag = await AsyncStorage.getItem('setup_complete');
      setSetupComplete(flag === 'true');
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>💰</Text>
        <Text style={styles.splashName}>Paisa</Text>
        <Text style={styles.splashTag}>Smart Business Finance</Text>
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={setupComplete ? 'Main' : 'Setup'}>
        <Stack.Screen name="Setup" component={SetupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen}
          options={{ ...STACK_HEADER, title: 'Create Invoice' }} />
        <Stack.Screen name="ViewInvoice" component={ViewInvoiceScreen}
          options={{ ...STACK_HEADER, title: 'Invoice' }} />
        <Stack.Screen name="CreateQuotation" component={CreateQuotationScreen}
          options={{ ...STACK_HEADER, title: 'Create Quotation' }} />
        <Stack.Screen name="ViewQuotation" component={ViewQuotationScreen}
          options={{ ...STACK_HEADER, title: 'Quotation' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  splashLogo: { fontSize: 72, marginBottom: 8 },
  splashName: { fontSize: 44, fontWeight: '800', color: Colors.white, letterSpacing: -2 },
  splashTag: { fontSize: Typography.fontSizes.base, color: Colors.accent, fontWeight: '600', marginTop: 4 },
});
