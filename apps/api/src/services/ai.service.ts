import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContentNiche, ContentTone } from '@contentcraft/shared';

class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateCaption(params: {
    videoDescription: string;
    tone: ContentTone;
    niche: ContentNiche;
    includeHashtags?: boolean;
    maxLength?: number;
  }): Promise<{ caption: string; hashtags: string[] }> {
    const { videoDescription, tone, niche, includeHashtags = true, maxLength = 300 } = params;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = this.buildCaptionPrompt(videoDescription, tone, niche, includeHashtags, maxLength);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseCaptionResponse(text);
    } catch (error) {
      console.error('Error generating caption:', error);
      throw new Error('Failed to generate caption');
    }
  }

  async generateHashtags(params: {
    content: string;
    niche: ContentNiche;
    count?: number;
  }): Promise<string[]> {
    const { content, niche, count = 10 } = params;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Generate ${count} relevant hashtags for the following ${niche} content:

"${content}"

Requirements:
- Focus on ${niche} niche
- Mix of popular and niche-specific hashtags
- Include trending hashtags when relevant
- No spaces in hashtags
- Return as comma-separated list

Hashtags:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseHashtagsResponse(text);
    } catch (error) {
      console.error('Error generating hashtags:', error);
      throw new Error('Failed to generate hashtags');
    }
  }

  async analyzeVideoContent(videoDescription: string): Promise<{
    niche: ContentNiche;
    tone: ContentTone;
    keywords: string[];
    summary: string;
  }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Analyze the following video content and provide insights:

"${videoDescription}"

Please analyze and return in this exact format:
NICHE: [one of: FITNESS, FOOD, EDUCATION, LIFESTYLE, BUSINESS, TECH]
TONE: [one of: CASUAL, PROFESSIONAL, FUN, MOTIVATIONAL, EDUCATIONAL, TRENDY]
KEYWORDS: [comma-separated list of 5-10 relevant keywords]
SUMMARY: [2-3 sentence summary of the content]

Analysis:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAnalysisResponse(text);
    } catch (error) {
      console.error('Error analyzing video content:', error);
      throw new Error('Failed to analyze video content');
    }
  }

  async suggestOptimalPostingTimes(params: {
    niche: ContentNiche;
    timezone: string;
    platform: string;
  }): Promise<{ dayOfWeek: number; hour: number; reason: string }[]> {
    const { niche, timezone, platform } = params;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Suggest the best posting times for ${niche} content on ${platform} for timezone ${timezone}.

Consider:
- Target audience activity patterns for ${niche}
- Platform-specific engagement patterns
- General social media best practices

Provide 3-5 optimal posting times with explanations.

Format:
DAY: [0-6, where 0=Sunday]
HOUR: [0-23]
REASON: [explanation]

Suggestions:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parsePostingTimesResponse(text);
    } catch (error) {
      console.error('Error suggesting posting times:', error);
      throw new Error('Failed to suggest posting times');
    }
  }

  private buildCaptionPrompt(
    description: string,
    tone: ContentTone,
    niche: ContentNiche,
    includeHashtags: boolean,
    maxLength: number
  ): string {
    const toneInstructions = {
      [ContentTone.CASUAL]: 'Use casual, conversational language. Be relatable and friendly.',
      [ContentTone.PROFESSIONAL]: 'Use professional, polished language. Be authoritative but approachable.',
      [ContentTone.FUN]: 'Use playful, energetic language. Include emojis and be entertaining.',
      [ContentTone.MOTIVATIONAL]: 'Use inspiring, uplifting language. Encourage and motivate the audience.',
      [ContentTone.EDUCATIONAL]: 'Use clear, informative language. Focus on teaching and explaining.',
      [ContentTone.TRENDY]: 'Use current slang and trending phrases. Be hip and relevant.',
    };

    const nicheInstructions = {
      [ContentNiche.FITNESS]: 'Focus on health, wellness, workout tips, and motivation.',
      [ContentNiche.FOOD]: 'Focus on recipes, cooking tips, ingredients, and food culture.',
      [ContentNiche.EDUCATION]: 'Focus on learning, teaching, knowledge sharing, and skill development.',
      [ContentNiche.LIFESTYLE]: 'Focus on daily life, personal experiences, and lifestyle choices.',
      [ContentNiche.BUSINESS]: 'Focus on entrepreneurship, productivity, and business insights.',
      [ContentNiche.TECH]: 'Focus on technology, innovation, and digital trends.',
    };

    return `
Create an engaging social media caption for this ${niche} content:

"${description}"

Requirements:
- Tone: ${tone} (${toneInstructions[tone]})
- Niche: ${niche} (${nicheInstructions[niche]})
- Maximum length: ${maxLength} characters
- ${includeHashtags ? 'Include relevant hashtags at the end' : 'No hashtags needed'}
- Include emojis where appropriate
- Make it engaging and likely to get likes/comments

${includeHashtags ? 'Format: Caption text\n\nHASHTAGS: #hashtag1 #hashtag2 #hashtag3' : 'Just return the caption text.'}

Caption:`;
  }

  private parseCaptionResponse(text: string): { caption: string; hashtags: string[] } {
    const lines = text.trim().split('\n');
    
    let caption = '';
    let hashtags: string[] = [];

    let isHashtagSection = false;
    
    for (const line of lines) {
      if (line.toUpperCase().includes('HASHTAGS:')) {
        isHashtagSection = true;
        const hashtagLine = line.replace(/HASHTAGS:/i, '').trim();
        if (hashtagLine) {
          hashtags = this.extractHashtags(hashtagLine);
        }
      } else if (isHashtagSection) {
        hashtags = [...hashtags, ...this.extractHashtags(line)];
      } else if (line.trim()) {
        caption += (caption ? ' ' : '') + line.trim();
      }
    }

    // If no hashtags section found, extract from caption
    if (hashtags.length === 0) {
      const captionHashtags = this.extractHashtags(caption);
      if (captionHashtags.length > 0) {
        // Remove hashtags from caption
        caption = caption.replace(/#\w+/g, '').trim();
        hashtags = captionHashtags;
      }
    }

    return {
      caption: caption.trim(),
      hashtags: hashtags.slice(0, 15), // Limit to 15 hashtags
    };
  }

  private parseHashtagsResponse(text: string): string[] {
    return this.extractHashtags(text);
  }

  private extractHashtags(text: string): string[] {
    const hashtags = text.match(/#\w+/g) || [];
    const cleanHashtags = text
      .split(/[,\s\n]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.startsWith('#') || /^[a-zA-Z]/.test(tag))
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .filter(tag => tag.length > 1);
    
    return [...new Set([...hashtags, ...cleanHashtags])];
  }

  private parseAnalysisResponse(text: string): {
    niche: ContentNiche;
    tone: ContentTone;
    keywords: string[];
    summary: string;
  } {
    const lines = text.split('\n');
    let niche = ContentNiche.LIFESTYLE;
    let tone = ContentTone.CASUAL;
    let keywords: string[] = [];
    let summary = '';

    for (const line of lines) {
      const upperLine = line.toUpperCase();
      
      if (upperLine.includes('NICHE:')) {
        const nicheValue = line.replace(/NICHE:/i, '').trim().toUpperCase();
        if (Object.values(ContentNiche).includes(nicheValue as ContentNiche)) {
          niche = nicheValue as ContentNiche;
        }
      } else if (upperLine.includes('TONE:')) {
        const toneValue = line.replace(/TONE:/i, '').trim().toUpperCase();
        if (Object.values(ContentTone).includes(toneValue as ContentTone)) {
          tone = toneValue as ContentTone;
        }
      } else if (upperLine.includes('KEYWORDS:')) {
        const keywordsText = line.replace(/KEYWORDS:/i, '').trim();
        keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k.length > 0);
      } else if (upperLine.includes('SUMMARY:')) {
        summary = line.replace(/SUMMARY:/i, '').trim();
      }
    }

    return { niche, tone, keywords, summary };
  }

  private parsePostingTimesResponse(text: string): { dayOfWeek: number; hour: number; reason: string }[] {
    const lines = text.split('\n');
    const postingTimes: { dayOfWeek: number; hour: number; reason: string }[] = [];

    let currentDay: number | null = null;
    let currentHour: number | null = null;
    let currentReason = '';

    for (const line of lines) {
      const upperLine = line.toUpperCase();
      
      if (upperLine.includes('DAY:')) {
        if (currentDay !== null && currentHour !== null) {
          postingTimes.push({
            dayOfWeek: currentDay,
            hour: currentHour,
            reason: currentReason.trim(),
          });
        }
        const dayMatch = line.match(/DAY:\s*(\d+)/i);
        currentDay = dayMatch ? parseInt(dayMatch[1]) : null;
        currentReason = '';
      } else if (upperLine.includes('HOUR:')) {
        const hourMatch = line.match(/HOUR:\s*(\d+)/i);
        currentHour = hourMatch ? parseInt(hourMatch[1]) : null;
      } else if (upperLine.includes('REASON:')) {
        currentReason = line.replace(/REASON:/i, '').trim();
      }
    }

    if (currentDay !== null && currentHour !== null) {
      postingTimes.push({
        dayOfWeek: currentDay,
        hour: currentHour,
        reason: currentReason.trim(),
      });
    }

    return postingTimes.filter(pt => 
      pt.dayOfWeek >= 0 && pt.dayOfWeek <= 6 && 
      pt.hour >= 0 && pt.hour <= 23
    );
  }
}

export const aiService = new AIService(); 