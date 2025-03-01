import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';

const AboutScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Get version from Constants or use package version as fallback
  const getVersion = () => {
    try {
      if (Constants.expoConfig) {
        return Constants.expoConfig.version;
      }
      if (Constants.manifest) {
        return Constants.manifest.version;
      }
      return '1.0.0'; // Fallback version
    } catch (error) {
      return '1.0.0'; // Fallback version
    }
  };

  const version = getVersion();
  
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: theme.text }]}>Hatzir</Text>
          <Text style={[styles.version, { color: theme.textSecondary }]}>Version {version}</Text>
        </View>

        <Text style={[styles.description, { color: theme.text }]}>
          Hatzir is a community-driven incident reporting platform designed to help
          keep our communities safe and informed.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
          <Text style={[styles.bullet, { color: theme.text }]}>• Real-time incident reporting</Text>
          <Text style={[styles.bullet, { color: theme.text }]}>• Location-based alerts</Text>
          <Text style={[styles.bullet, { color: theme.text }]}>• Community verification</Text>
          <Text style={[styles.bullet, { color: theme.text }]}>• Push notifications</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact</Text>
          <TouchableOpacity
            onPress={() => handleLinkPress('mailto:support@hatzir.app')}
          >
            <Text style={[styles.link, { color: theme.primary }]}>support@hatzir.app</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Legal</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={[styles.link, { color: theme.primary }]}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Terms')}
          >
            <Text style={[styles.link, { color: theme.primary }]}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.copyright, { color: theme.textSecondary }]}>
          © {new Date().getFullYear()} Hatzir. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  version: {
    fontSize: 16,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
});

export default AboutScreen; 