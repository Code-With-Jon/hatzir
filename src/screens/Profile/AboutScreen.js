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
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const AboutScreen = ({ navigation }) => {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Hatzir</Text>
          <Text style={styles.version}>Version {version}</Text>
        </View>

        <Text style={styles.description}>
          Hatzir is a community-driven incident reporting platform designed to help
          keep our communities safe and informed.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.bullet}>• Real-time incident reporting</Text>
          <Text style={styles.bullet}>• Location-based alerts</Text>
          <Text style={styles.bullet}>• Community verification</Text>
          <Text style={styles.bullet}>• Push notifications</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TouchableOpacity
            onPress={() => handleLinkPress('mailto:support@hatzir.app')}
          >
            <Text style={styles.link}>support@hatzir.app</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Terms')}
          >
            <Text style={styles.link}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © {new Date().getFullYear()} Hatzir. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
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
    color: '#333',
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
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
    color: '#333',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    color: '#e91e63',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
});

export default AboutScreen; 