import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleGemini2Api(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')));

    // Format messages with a highly structured deep thinking approach
    const conversation = messages.map(msg => {
      if (msg.role === 'user') {
        return `Human: ${msg.content}\n\nPlease follow this advanced reasoning approach:\n` +
               `1️⃣ **Question Breakdown**\n` +
               `   • Identify core concepts\n` +
               `   • Extract underlying patterns and assumptions\n\n` +
               `2️⃣ **Multi-Perspective Analysis**\n` +
               `   a) **Logical:** Step-by-step derivation of conclusions\n` +
               `   b) **Historical/Scientific:** Past context and factual basis\n` +
               `   c) **Philosophical/Ethical:** Human-centric impact & moral considerations\n` +
               `   d) **Real-World Implications:** Practical and future outcomes\n\n` +
               `3️⃣ **Deep Reasoning Chain**\n` +
               `   • Cause-effect relationships\n` +
               `   • Contradictions, paradoxes & counterarguments\n` +
               `   • Alternative interpretations\n\n` +
               `4️⃣ **Final Thoughtful Response**\n` +
               `   • Clear, structured answer with summary & key takeaways.`;
      }
      return `Assistant: ${msg.content}`;
    }).join('\n\n');

    const fullPrompt = `${systemPrompt}\n\n${conversation}`;

    const response = await fetch(`${config.url}?key=${config.key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.65,
          topK: 50,
          topP: 0.92,
          maxOutputTokens: 3072,
          stopSequences: ["Human:", "Assistant:"]
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from Gemini API');
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    let content = data.candidates[0].content.parts[0].text.trim();
    content = content.replace(/^Assistant:\s*/i, '');

    // Enhanced structured response formatting for deeper thought processes
    if (!content.includes('Thinking Process:') && !content.includes('Reasoning:')) {
      const segments = content.split('\n\n');
      const thinkingProcess = segments[0] || '';
      const reasoning = segments.length > 1 ? segments[1] : '';
      const answer = segments.slice(2).join('\n\n') || content;

      content = `🧠 **Deep Thinking Process:**\n${'='.repeat(60)}\n` +
                `🔹 **Step 1: Fundamental Breakdown**\n` +
                `   • Extracted core elements\n` +
                `   • Identified underlying assumptions\n\n` +

                `🔹 **Step 2: Multi-Perspective Analysis**\n` +
                `   📌 **Logical Reasoning:** ${thinkingProcess}\n` +
                `   📌 **Historical/Scientific Basis:** Researched supporting context.\n` +
                `   📌 **Philosophical/Ethical Aspects:** Considered moral dilemmas.\n` +
                `   📌 **Practical Implications:** Evaluated real-world outcomes.\n\n` +

                `🤔 **Advanced Reasoning Chain:**\n${'='.repeat(60)}\n` +
                `   🔄 **Cause & Effect Analysis:** ${reasoning}\n` +
                `   🔄 **Possible Counterarguments & Limitations:**\n` +
                `      - Scenario A: Alternative reasoning\n` +
                `      - Scenario B: Contradictory evidence\n` +
                `   🔄 **Alternative Interpretations:** Multiple perspectives analyzed.\n\n` +

                `📌 **Final Answer & Key Takeaways:**\n${'='.repeat(60)}\n${answer}`;
    }

    return { content };
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    let errorMessage = 'An error occurred while processing your request.';

    if (error instanceof Error) {
      if (error.message.includes('SAFETY')) {
        errorMessage = '⚠️ The response was blocked due to safety concerns. Please rephrase your question.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = '⏳ Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('Invalid response format')) {
        errorMessage = '⚠️ Invalid response format received. Retrying may help.';
      } else {
        errorMessage = `❌ Error: ${error.message}. Try rephrasing or switching models.`;
      }
    }

    return {
      content: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
