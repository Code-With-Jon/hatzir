import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>
        
        <Text style={styles.section}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information that you provide directly to us, including:
        </Text>
        <Text style={styles.bullet}>• Account information (email, name)</Text>
        <Text style={styles.bullet}>• Location data for incident reporting</Text>
        <Text style={styles.bullet}>• Device information and usage data</Text>

        <Text style={styles.section}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bullet}>• Provide and maintain our services</Text>
        <Text style={styles.bullet}>• Send notifications about incidents</Text>
        <Text style={styles.bullet}>• Improve and personalize our services</Text>

        <Text style={styles.section}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal information. We may share your information:
        </Text>
        <Text style={styles.bullet}>• With your consent</Text>
        <Text style={styles.bullet}>• For legal requirements</Text>
        <Text style={styles.bullet}>• To protect rights and safety</Text>

        <Text style={styles.section}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your personal information.
        </Text>

        <Text style={styles.section}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bullet}>• Access your personal information</Text>
        <Text style={styles.bullet}>• Update or correct your information</Text>
        <Text style={styles.bullet}>• Delete your account</Text>

        <Text style={styles.section}>6. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, please contact us at:
          {'\n'}support@hatzir.app
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
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
});

export default PrivacyPolicyScreen; 