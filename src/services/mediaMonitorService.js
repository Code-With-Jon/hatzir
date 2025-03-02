import axios from 'axios';
import { TWITTER_BEARER_TOKEN } from '@env';
import { parseRSS } from '../utils/rssParser';

export const fetchNewsArticles = async (keywords, days = 20) => {
  try {
    const formattedKeywords = encodeURIComponent(keywords);
    // Use a simpler Google News RSS URL format
    const googleNewsUrl = `https://news.google.com/news/rss/search?q=${formattedKeywords}`;
    
    console.log('Fetching news with URL:', googleNewsUrl);
    
    const response = await axios.get(googleNewsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.data) {
      console.error('No data received from Google News');
      return [];
    }

    console.log('RSS Response status:', response.status);
    console.log('RSS Response data preview:', response.data.substring(0, 500));

    const items = parseRSS(response.data);
    
    if (!items || items.length === 0) {
      console.log('No items parsed from RSS feed');
      // Try alternative RSS feed
      const alternativeUrl = `https://news.google.com/rss/search?q=${formattedKeywords}&hl=en-US&gl=US&ceid=US:en`;
      console.log('Trying alternative URL:', alternativeUrl);
      const altResponse = await axios.get(alternativeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return parseRSS(altResponse.data);
    }

    // Get date 20 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Transform items into our desired format, filter by date, and sort
    const articles = items
      .map(item => ({
        id: item.guid,
        type: 'news',
        title: item.title,
        content: item.description,
        source: item.source,
        url: item.link,
        date: new Date(item.pubDate).toISOString()
      }))
      .filter(article => new Date(article.date) > cutoffDate) // Filter articles within last 20 days
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent first

    console.log(`Successfully fetched ${articles.length} articles within the last ${days} days`);
    return articles;
  } catch (error) {
    console.error('Google News RSS Error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Try an alternative news source
    try {
      console.log('Trying alternative news source...');
      const yahooNewsUrl = `https://news.yahoo.com/rss/search/antisemitism`;
      const response = await axios.get(yahooNewsUrl);
      const items = parseRSS(response.data);
      return items.map(item => ({
        id: item.guid,
        type: 'news',
        title: item.title,
        content: item.description,
        source: 'Yahoo News',
        url: item.link,
        date: new Date(item.pubDate).toISOString()
      }));
    } catch (altError) {
      console.error('Alternative source error:', altError);
      return [];
    }
  }
};

export const fetchSocialMediaPosts = async (keywords) => {
  // Temporarily return empty array while Twitter API is not configured
  return [];
  
  /* Commented out Twitter API logic
  try {
    // Example using Twitter API v2
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
      },
      params: {
        query: keywords,
        'tweet.fields': 'created_at,geo,context_annotations',
        expansions: 'geo.place_id',
        'place.fields': 'contained_within,country,country_code,full_name,geo,id,name,place_type'
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Twitter API Error:', error);
    throw new Error('Failed to fetch social media posts');
  }
  */
}; 