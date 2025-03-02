import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addIncident, fetchIncidents } from '../../redux/slices/incidentsSlice';
import { analyzeIncidentContent } from '../../services/openaiService';
import { fetchNewsArticles, fetchSocialMediaPosts } from '../../services/mediaMonitorService';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';
import * as Location from 'expo-location';
import { auth } from '../../config/firebase';

const IncidentMonitorScreen = ({ navigation }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const fetchSources = async () => {
    setLoading(true);
    try {
      const keywords = 'antisemitism OR antisemitic OR jewish hate crime';
      console.log('\n--- Fetching Sources ---');
      console.log('Keywords:', keywords);
      
      const [news, socialPosts] = await Promise.all([
        fetchNewsArticles(keywords),
        fetchSocialMediaPosts(keywords)
      ]);

      console.log('\n--- News Articles ---');
      console.log(JSON.stringify(news, null, 2));
      
      console.log('\n--- Social Posts ---');
      console.log(JSON.stringify(socialPosts, null, 2));

      // Combine and format sources
      const combinedSources = [
        ...news.map(article => ({
          id: article.id,
          type: 'news',
          content: `${article.title}. ${article.content}`,
          source: article.source,
          url: article.url,
          date: article.date
        })),
        ...socialPosts.map(post => ({
          id: post.id,
          type: 'social',
          content: post.text,
          source: 'Twitter',
          url: `https://twitter.com/user/status/${post.id}`,
          date: post.created_at
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort combined sources by date

      console.log('\n--- Combined Sources ---');
      console.log(JSON.stringify(combinedSources, null, 2));

      setSources(combinedSources);
    } catch (error) {
      console.error('\n--- Error Fetching Sources ---');
      console.error(error);
      Alert.alert('Error', 'Failed to fetch sources');
    } finally {
      setLoading(false);
    }
  };

  const analyzeAndAddIncident = async (source) => {
    setAnalyzing(true);
    try {
      console.log('Analyzing source:', source);
      
      const analysis = await analyzeIncidentContent(source.content);
      console.log('OpenAI Analysis:', analysis);
      
      // Get coordinates from the analysis or geocode the location
      let coordinates;
      if (analysis.location) {
        try {
          const geocodeResult = await Location.geocodeAsync(analysis.location);
          console.log('Geocoding result:', geocodeResult);
          
          if (geocodeResult.length > 0) {
            coordinates = {
              latitude: geocodeResult[0].latitude,
              longitude: geocodeResult[0].longitude
            };
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }

      if (!coordinates) {
        Alert.alert('Error', 'Could not determine incident location');
        return;
      }

      // Get the current user ID
      const userId = auth.currentUser?.uid;
      const incidentData = {
        title: `${analysis.type} Incident`,
        description: analysis.description,
        location: coordinates,
        severity: analysis.severity,
        sourceReliability: analysis.sourceReliability,
        sourceUrl: source.url,
        sourceType: source.type,
        date: analysis.date || source.date,
        isAIGenerated: true,
        reportedBy: userId,
        isAnonymous: false
      };

      console.log('About to dispatch incident with data:', incidentData);
      console.log('isAIGenerated flag set to:', incidentData.isAIGenerated);

      const result = await dispatch(addIncident(incidentData)).unwrap();
      console.log('Dispatch result:', result);
      console.log('Incident added successfully with ID:', result.id);

      // Verify the incident was added by fetching all incidents
      dispatch(fetchIncidents());

      Alert.alert('Success', 'Incident added to map');
      navigation.navigate('MapTab');
    } catch (error) {
      console.error('Full error in analyzeAndAddIncident:', error);
      Alert.alert('Error', 'Failed to analyze and add incident');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.sourceItem, { backgroundColor: theme.surface }]}
      onPress={() => analyzeAndAddIncident(item)}
    >
      <View style={styles.sourceHeader}>
        <Text style={[styles.sourceType, { color: theme.primary }]}>
          {item.type.toUpperCase()}
        </Text>
        <Text style={[styles.sourceDate, { color: theme.textSecondary }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.sourceContent, { color: theme.text }]} numberOfLines={3}>
        {item.content}
      </Text>
      <Text style={[styles.sourceUrl, { color: theme.textSecondary }]} numberOfLines={1}>
        {item.source}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={sources}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={fetchSources}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No sources found
            </Text>
          </View>
        }
      />
      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.analyzingText, { color: theme.text }]}>
            Analyzing incident...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sourceItem: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sourceType: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  sourceDate: {
    fontSize: 12,
  },
  sourceContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  sourceUrl: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default IncidentMonitorScreen; 