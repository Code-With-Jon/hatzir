import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';

const { width } = Dimensions.get('window');
const MEDIA_WIDTH = width - 32; // Full width minus padding
const MEDIA_HEIGHT = (MEDIA_WIDTH * 3) / 4; // 4:3 aspect ratio

const IncidentMedia = ({ mediaUrls }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const images = mediaUrls.filter(media => !media.type || media.type === 'image')
    .map(media => ({
      url: media.url || media.uri,
      width: MEDIA_WIDTH,
      height: MEDIA_HEIGHT,
    }));

  const handleMediaPress = (media, index) => {
    if (media.type === 'video') {
      setSelectedVideo(media);
      setIsVideoModalVisible(true);
    } else {
      const imageIndex = images.findIndex(img => img.url === (media.url || media.uri));
      setSelectedIndex(imageIndex !== -1 ? imageIndex : 0);
      setIsModalVisible(true);
    }
  };

  const renderMediaItem = (media, index) => {
    const isVideo = media.type === 'video' || (media.url || media.uri).toLowerCase().includes('.mp4');
    const mediaUri = media.url || media.uri;

    if (isVideo) {
      return (
        <View style={styles.mediaPreview}>
          <Video
            source={{ uri: mediaUri }}
            style={styles.media}
            resizeMode="cover"
            shouldPlay={false}
            isMuted={true}
            useNativeControls={false}
            isLooping={false}
          />
          <View style={styles.playButton}>
            <Ionicons name="play-circle" size={48} color="white" />
          </View>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: mediaUri }}
        style={styles.media}
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {mediaUrls.map((media, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mediaContainer}
            onPress={() => handleMediaPress(media, index)}
          >
            {renderMediaItem(media, index)}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Image Zoom Modal */}
      <Modal visible={isModalVisible} transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar backgroundColor="black" barStyle="light-content" />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close-circle" size={32} color="white" />
          </TouchableOpacity>
          <ImageViewer
            imageUrls={images}
            index={selectedIndex}
            enableSwipeDown
            onSwipeDown={() => setIsModalVisible(false)}
            backgroundColor="black"
            renderIndicator={() => null}
          />
        </SafeAreaView>
      </Modal>

      {/* Video Modal */}
      <Modal
        visible={isVideoModalVisible}
        transparent={true}
        onRequestClose={() => setIsVideoModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar backgroundColor="black" barStyle="light-content" />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsVideoModalVisible(false)}
          >
            <Ionicons name="close-circle" size={32} color="white" />
          </TouchableOpacity>
          {selectedVideo && (
            <Video
              source={{ uri: selectedVideo.url }}
              style={styles.fullScreenVideo}
              resizeMode="contain"
              shouldPlay={true}
              isLooping
              useNativeControls
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: MEDIA_HEIGHT,
  },
  scrollView: {
    flex: 1,
  },
  mediaContainer: {
    width: MEDIA_WIDTH,
    height: MEDIA_HEIGHT,
    marginHorizontal: 16,
  },
  mediaPreview: {
    flex: 1,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  fullScreenVideo: {
    flex: 1,
    width: '100%',
  },
});

export default IncidentMedia; 