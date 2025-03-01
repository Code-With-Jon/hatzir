import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    if (response[0]) {
      return {
        city: response[0].city,
        state: response[0].region,
        country: response[0].country,
        postalCode: response[0].postalCode,
      };
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

const handleSubmit = async () => {
  try {
    const locationDetails = await reverseGeocode(
      location.latitude,
      location.longitude
    );

    const incidentData = {
      title,
      description,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      locationDetails,
      createdAt: new Date().toISOString(),
      reportedBy: user.uid,
      isAnonymous,
      mediaUrls: uploadedMediaUrls,
      votes: 0,
      commentCount: 0,
      flagCount: 0,
    };

    await addDoc(collection(db, 'incidents'), incidentData);
  } catch (error) {
    console.error('Error submitting incident:', error);
  }
};

const ReportIncidentScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [mediaFiles, setMediaFiles] = useState([]);

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
          Alert.alert('Sorry, we need camera and media library permissions!');
        }
      }
    })();
  }, []);

  const showMediaPicker = () => {
    Alert.alert(
      'Add Media',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => pickMedia('camera', 'image'),
        },
        {
          text: 'Take Video',
          onPress: () => pickMedia('camera', 'video'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickMedia('library', 'all'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const pickMedia = async (source, mediaType) => {
    try {
      let result;
      const options = {
        mediaTypes: mediaType === 'all' 
          ? ImagePicker.MediaTypeOptions.All
          : mediaType === 'image' 
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      };

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled) {
        const newMedia = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image', // fallback to 'image' if type is not provided
          fileName: result.assets[0].uri.split('/').pop(),
        };
        
        setMediaFiles(prev => [...prev, newMedia]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderMediaPreview = () => {
    return (
      <ScrollView horizontal style={styles.mediaPreviewContainer}>
        {mediaFiles.map((media, index) => (
          <View key={index} style={styles.mediaPreviewWrapper}>
            {media.type === 'video' ? (
              <Video
                source={{ uri: media.uri }}
                style={styles.mediaPreview}
                resizeMode="cover"
                useNativeControls
                isLooping={false}
                shouldPlay={false}
                isMuted={true}
                posterStyle={styles.mediaPreview}
              />
            ) : (
              <Image
                source={{ uri: media.uri }}
                style={styles.mediaPreview}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => removeMedia(index)}
            >
              <View style={styles.removeButtonBackground}>
                <Ionicons name="close-circle" size={28} color="white" />
              </View>
            </TouchableOpacity>
            {media.type === 'video' && (
              <View style={styles.videoIndicator}>
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.videoText}>Video</Text>
              </View>
            )}
          </View>
        ))}
        {mediaFiles.length < 5 && (
          <TouchableOpacity
            style={[styles.addMediaButton, { backgroundColor: theme.inputBackground }]}
            onPress={showMediaPicker}
          >
            <Ionicons name="add" size={40} color={theme.text} />
            <Text style={[styles.addMediaText, { color: theme.text }]}>
              Add Photo/Video
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    mediaPreviewContainer: {
      flexDirection: 'row',
      marginVertical: 10,
      maxHeight: 140,
      paddingHorizontal: 16,
    },
    mediaPreviewWrapper: {
      marginRight: 12,
      position: 'relative',
    },
    mediaPreview: {
      width: 120,
      height: 120,
      borderRadius: 8,
      backgroundColor: '#f0f0f0',
    },
    removeMediaButton: {
      position: 'absolute',
      top: -10,
      right: -10,
      zIndex: 1,
    },
    removeButtonBackground: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 14,
      padding: 2,
    },
    videoIndicator: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 12,
      padding: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    videoText: {
      color: '#fff',
      marginLeft: 4,
      fontSize: 12,
      fontWeight: '500',
    },
    addMediaButton: {
      width: 120,
      height: 120,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      borderStyle: 'dashed',
    },
    addMediaText: {
      marginTop: 8,
      fontSize: 12,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {renderMediaPreview()}
      {/* ... rest of your form ... */}
    </ScrollView>
  );
}; 