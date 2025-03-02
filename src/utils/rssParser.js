export const parseRSS = (xmlString) => {
  console.log('\n--- Starting RSS Parse ---');
  
  // First try to validate if we have XML content
  if (!xmlString.includes('<?xml') && !xmlString.includes('<rss')) {
    console.error('Invalid XML content received');
    console.log('Content preview:', xmlString.substring(0, 200));
    return [];
  }

  // Try different item patterns
  const itemPatterns = [
    /<item>([\s\S]*?)<\/item>/g,
    /<entry>([\s\S]*?)<\/entry>/g
  ];

  let items = [];
  
  for (const pattern of itemPatterns) {
    let match;
    while ((match = pattern.exec(xmlString)) !== null) {
      const itemContent = match[1];
      
      // Helper function to try multiple tag names for the same field
      const getFieldMulti = (fieldNames) => {
        for (const field of fieldNames) {
          const regex = new RegExp(`<${field}(?:\\s[^>]*)?>(.*?)<\/${field}>`, 's');
          const match = itemContent.match(regex);
          if (match) return match[1].trim();
        }
        return '';
      };

      const title = getFieldMulti(['title']);
      const link = getFieldMulti(['link', 'url']);
      const pubDate = getFieldMulti(['pubDate', 'published', 'date']);
      const description = getFieldMulti(['description', 'content', 'summary'])
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<[^>]*>/g, '');
      const guid = getFieldMulti(['guid', 'id']);
      const source = getFieldMulti(['source', 'publisher']);

      if (title || description) { // Only add if we have at least a title or description
        items.push({
          title,
          link,
          pubDate,
          description,
          guid: guid || link,
          source: source || 'Google News'
        });
      }
    }
    
    if (items.length > 0) break; // If we found items, don't try other patterns
  }

  console.log(`\nTotal items parsed: ${items.length}`);
  if (items.length > 0) {
    console.log('Sample item:', items[0]);
  }
  
  return items;
}; 