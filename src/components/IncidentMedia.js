import React from 'react';
import { ScrollView, Image, StyleSheet } from 'react-native';

const IncidentMedia = React.memo(({ mediaUrls }) => {
  if (!mediaUrls?.length) return null;

  return (
    <ScrollView horizontal style={styles.mediaContainer}>
      {mediaUrls.map((media, index) => (
        <Image
          key={index}
          source={{ uri: media.url }}
          style={styles.media}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  mediaContainer: {
    padding: 20,
  },
  media: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
});

export default IncidentMedia; 