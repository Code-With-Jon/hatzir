import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';

const SocialVerificationScreen = ({ route, navigation }) => {
  const { userCredentials } = route.params;
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [username, setUsername] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const dispatch = useDispatch();

  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#4267B2' },
    { id: 'twitter', name: 'X (Twitter)', icon: 'logo-twitter', color: '#000000' }
  ];

  const handleVerification = async () => {
    if (!selectedPlatform || !username.trim()) {
      Alert.alert('Error', 'Please select a platform and enter your username');
      return;
    }

    setIsVerifying(true);
    try {
      // Here you would typically verify the social media account
      // For now, we'll just simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user data with social media info
      const updatedUser = {
        ...userCredentials,
        socialMedia: {
          platform: selectedPlatform,
          username: username.trim()
        }
      };

      // Update Redux state with the complete user data
      dispatch(setUser(updatedUser));

      // Navigate to the main app
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Social Media Verification</Text>
          <Text style={styles.subtitle}>
            Please verify your identity with one of your social media accounts
          </Text>
        </View>

        <View style={styles.platformsContainer}>
          {socialPlatforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.platformButton,
                selectedPlatform === platform.id && styles.selectedPlatform,
                { borderColor: platform.color }
              ]}
              onPress={() => setSelectedPlatform(platform.id)}
            >
              <Ionicons 
                name={platform.icon} 
                size={24} 
                color={selectedPlatform === platform.id ? platform.color : '#666'} 
              />
              <Text style={[
                styles.platformText,
                selectedPlatform === platform.id && { color: platform.color }
              ]}>
                {platform.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedPlatform && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter your username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder={`Your ${socialPlatforms.find(p => p.id === selectedPlatform)?.name} username`}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.verifyButton, (!selectedPlatform || !username) && styles.disabledButton]}
          onPress={handleVerification}
          disabled={isVerifying || !selectedPlatform || !username}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  platformsContainer: {
    gap: 15,
    marginBottom: 30,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedPlatform: {
    backgroundColor: '#f8f8f8',
  },
  platformText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#e91e63',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ffb6c1',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialVerificationScreen; 