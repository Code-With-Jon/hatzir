import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const MEDIA_WIDTH = width - 32; // Full width minus padding
const MEDIA_HEIGHT = (MEDIA_WIDTH * 3) / 4; // 4:3 aspect ratio

const IncidentMedia = ({ mediaUrls }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const renderMediaItem = (media, index, inModal = false) => {
    const isVideo = media.type === 'video' || media.url.toLowerCase().includes('.mp4');
    const itemWidth = inModal ? width : MEDIA_WIDTH;
    const itemHeight = inModal ? width * (3/4) : MEDIA_HEIGHT;

    if (isVideo) {
      return (
        <Video
          source={{ uri: media.url }}
          style={{
            width: itemWidth,
            height: itemHeight,
          }}
          useNativeControls
          resizeMode="contain"
          isLooping
          shouldPlay={inModal}
          isMuted={!inModal}
        />
      );
    }

    return (
      <Image
        source={{ uri: media.url }}
        style={{
          width: itemWidth,
          height: itemHeight,
        }}
        resizeMode="contain"
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
            onPress={() => {
              setSelectedMedia(media);
              setIsModalVisible(true);
            }}
          >
            {renderMediaItem(media, index)}
            {(media.type === 'video' || media.url.toLowerCase().includes('.mp4')) && (
              <View style={styles.playButton}>
                <Ionicons name="play-circle" size={48} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close-circle" size={32} color="white" />
          </TouchableOpacity>
          {selectedMedia && renderMediaItem(selectedMedia, 0, true)}
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
});

export default IncidentMedia; 