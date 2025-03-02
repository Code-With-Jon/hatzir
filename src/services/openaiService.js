import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const sanitizeContent = (content) => {
  // Remove any special characters and limit length
  return content
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/['"]/g, '') // Remove quotes that might break JSON
    .substring(0, 1000); // Limit content length
};

export const analyzeIncidentContent = async (content) => {
  try {
    console.log('OpenAI API Key:', OPENAI_API_KEY?.substring(0, 10) + '...');
    
    const sanitizedContent = sanitizeContent(content);
    console.log('Analyzing sanitized content:', sanitizedContent);

    const requestBody = {
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `You are an expert at analyzing antisemitic incidents. Extract key information from the provided content.
          Always try to identify a specific location that can be geocoded (city, state, country).
          If multiple locations are mentioned, choose the primary incident location.
          Always respond with valid JSON.`
      }, {
        role: "user",
        content: `Analyze this content and provide ONLY a JSON response in this exact format:
          {
            "location": "city, state, country",
            "date": "YYYY-MM-DD",
            "type": "vandalism/assault/harassment/other",
            "description": "brief summary",
            "severity": 1,
            "sourceReliability": 1
          }
          
          Content to analyze: ${sanitizedContent}`
      }],
      temperature: 0.3,
      max_tokens: 500
    };

    console.log('Making OpenAI request with:', JSON.stringify(requestBody, null, 2));

    const response = await openaiClient.post('/chat/completions', requestBody);

    console.log('Raw OpenAI response:', response.data);

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', response.data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const rawContent = response.data.choices[0].message.content.trim();
    console.log('Raw content from OpenAI:', rawContent);

    try {
      const result = JSON.parse(rawContent);
      
      // Validate required fields
      const requiredFields = ['location', 'date', 'type', 'description', 'severity', 'sourceReliability'];
      const missingFields = requiredFields.filter(field => !result[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('Successfully parsed OpenAI result:', result);
      return result;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse content:', rawContent);
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    console.error('OpenAI API Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(`Failed to analyze incident content: ${error.message}`);
  }
}; 