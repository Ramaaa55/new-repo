import { Topic } from './types';

export function validateTopicStructure(topic: any): topic is Topic {
  try {
    // Check required fields
    if (!topic || typeof topic !== 'object') {
      console.error('Topic must be an object');
      return false;
    }

    if (!topic.title || typeof topic.title !== 'string') {
      console.error('Topic must have a valid title string');
      return false;
    }

    // Validate optional fields if present
    if (topic.description !== undefined && typeof topic.description !== 'string') {
      console.error('Description must be a string if present');
      return false;
    }

    if (topic.examples !== undefined && !Array.isArray(topic.examples)) {
      console.error('Examples must be an array if present');
      return false;
    }

    if (topic.context !== undefined && typeof topic.context !== 'string') {
      console.error('Context must be a string if present');
      return false;
    }

    if (topic.icon !== undefined && typeof topic.icon !== 'string') {
      console.error('Icon must be a string if present');
      return false;
    }

    if (topic.color !== undefined && typeof topic.color !== 'string') {
      console.error('Color must be a string if present');
      return false;
    }

    // Validate relationships if present
    if (topic.relationships !== undefined) {
      if (!Array.isArray(topic.relationships)) {
        console.error('Relationships must be an array if present');
        return false;
      }

      for (const rel of topic.relationships) {
        if (!rel.to || typeof rel.to !== 'string') {
          console.error('Each relationship must have a valid "to" field');
          return false;
        }

        if (!['related', 'depends', 'influences', 'part-of'].includes(rel.type)) {
          console.error('Invalid relationship type:', rel.type);
          return false;
        }
      }
    }

    // Validate subtopics recursively if present
    if (topic.subtopics !== undefined) {
      if (!Array.isArray(topic.subtopics)) {
        console.error('Subtopics must be an array if present');
        return false;
      }

      for (const subtopic of topic.subtopics) {
        if (!validateTopicStructure(subtopic)) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating topic structure:', error);
    return false;
  }
}