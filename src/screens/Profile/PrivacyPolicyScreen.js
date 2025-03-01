import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';

const PrivacyPolicyScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>
        
        <Text style={[styles.section, { color: theme.text }]}>1. Information We Collect</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          We collect information that you provide directly to us, including:
        </Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Account information (email, name)</Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Location data for incident reporting</Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Device information and usage data</Text>

        <Text style={[styles.section, { color: theme.text }]}>2. How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          We use the information we collect to:
        </Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Provide and maintain our services</Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Send notifications about incidents</Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Improve and personalize our services</Text>

        <Text style={[styles.section, { color: theme.text }]}>3. Information Sharing</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          We do not sell your personal information. We may share your information:
        </Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• With your consent</Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• For legal requirements</Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• To protect rights and safety</Text>

        <Text style={[styles.section, { color: theme.text }]}>4. Data Security</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          We implement appropriate security measures to protect your personal information.
        </Text>

        <Text style={[styles.section, { color: theme.text }]}>5. Your Rights</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          You have the right to:
        </Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Access your personal information</Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Update or correct your information</Text>
        <Text style={[styles.bullet, { color: theme.text }]}>• Delete your account</Text>

        <Text style={[styles.section, { color: theme.text }]}>6. Contact Us</Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
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
  },
  content: {
    flex: 1,
    padding: 16,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
});

export default PrivacyPolicyScreen; 