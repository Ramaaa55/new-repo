const DEEPSEEK_API_KEY = 'sk-96a7994b00d646809acf5e17fc63ce74';

interface Topic {
  title: string;
  subtopics?: Topic[];
}

export async function analyzeText(text: string): Promise<Topic[]> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'system',
          content: `You are an AI expert at analyzing text and creating hierarchical mind map structures. 
          Extract main topics and subtopics, maintaining clear relationships and logical grouping.
          IMPORTANT: Your response must be ONLY a valid JSON array with this exact structure, nothing else:
          [
            {
              "title": "Main Topic",
              "subtopics": [
                {
                  "title": "Subtopic 1",
                  "subtopics": []
                },
                {
                  "title": "Subtopic 2",
                  "subtopics": []
                }
              ]
            }
          ]`
        }, {
          role: 'user',
          content: `Analyze this text and create a hierarchical mind map structure: ${text}`
        }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze text');
    }

    const data = await response.json();
    console.log('Raw API Response:', data.choices[0].message.content);
    return parseAIResponse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
}

function cleanJsonContent(content: string): string {
  // Remove any text before the first [
  const startIndex = content.indexOf('[');
  if (startIndex === -1) return content;
  
  // Remove any text after the last ]
  const endIndex = content.lastIndexOf(']');
  if (endIndex === -1) return content.slice(startIndex);
  
  return content.slice(startIndex, endIndex + 1);
}

function parseAIResponse(content: string): Topic[] {
  try {
    console.log('Attempting to parse content:', content);

    // Clean the content to ensure we only have JSON
    const cleanedContent = cleanJsonContent(content);
    console.log('Cleaned content:', cleanedContent);

    // Try to parse the cleaned content
    let topics: Topic[];
    try {
      topics = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Initial parse failed:', parseError);
      
      // If parsing fails, try to repair the JSON
      const { jsonrepair } = require('jsonrepair');
      const repairedJson = jsonrepair(cleanedContent);
      console.log('Repaired JSON:', repairedJson);
      topics = JSON.parse(repairedJson);
    }

    // Validate the structure
    if (!Array.isArray(topics)) {
      console.error('Invalid topics structure - not an array:', topics);
      throw new Error('Invalid topics structure - expected array');
    }

    // Validate each topic has required properties
    const isValidTopic = (topic: any): topic is Topic => {
      return typeof topic === 'object' && 
             topic !== null && 
             typeof topic.title === 'string' &&
             (!topic.subtopics || Array.isArray(topic.subtopics));
    };

    if (!topics.every(isValidTopic)) {
      console.error('Invalid topic structure detected:', topics);
      throw new Error('Invalid topic structure - missing required properties');
    }

    return topics;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Failed content:', content);
    
    // Return a basic structure if parsing fails
    return [{
      title: 'Main Topic',
      subtopics: [
        { 
          title: 'Error parsing response',
          subtopics: [
            { title: 'Please try again with simpler text', subtopics: [] }
          ]
        }
      ]
    }];
  }
}