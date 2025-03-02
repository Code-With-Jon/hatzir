import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';

const EditIncidentScreen = ({ route, navigation }) => {
  const { incident } = route.params;
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [title, setTitle] = useState(incident.title);
  const [description, setDescription] = useState(incident.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const incidentRef = doc(db, 'incidents', incident.id);
      await updateDoc(incidentRef, {
        title: title.trim(),
        description: description.trim(),
        updatedAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        'Incident updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating incident:', error);
      Alert.alert('Error', 'Failed to update incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text
          }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter incident title"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text
          }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what happened"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Incident</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditIncidentScreen; 