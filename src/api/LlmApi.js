// LlmApi.js - OpenRouter API service
class LlmApi {
    constructor(apiKey, model = 'openai/gpt-3.5-turbo') {
      this.apiKey = apiKey;
      this.model = model;
      this.baseUrl = 'https://openrouter.ai/api/v1';
    }
  
    /**
     * Set the API key
     * @param {string} apiKey - OpenRouter API key
     */
    setApiKey(apiKey) {
      this.apiKey = apiKey;
    }
  
    /**
     * Set the model to use
     * @param {string} model - Model identifier (e.g., 'openai/gpt-3.5-turbo')
     */
    setModel(model) {
      this.model = model;
    }
  
    /**
     * Send a message to OpenRouter API
     * @param {Array} messages - Conversation history in OpenAI format
     * @returns {Promise<Object>} - API response
     */
    async sendMessage(messages) {
      if (!this.apiKey) {
        throw new Error('OpenRouter API key is required');
      }
  
      if (!messages || messages.length === 0) {
        throw new Error('Messages array cannot be empty');
      }
  
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('OpenRouter API error:', error);
        throw new Error(`Failed to communicate with OpenRouter: ${error.message}`);
      }
    }
  
    /**
     * Get available models from OpenRouter
     * @returns {Promise<Array>} - List of available models
     */
    async getAvailableModels() {
      try {
        const response = await fetch(`${this.baseUrl}/models`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching models:', error);
        throw new Error(`Could not retrieve models: ${error.message}`);
      }
    }
  
    /**
     * Simplified method for single prompt response
     * @param {string} prompt - User's prompt/message
     * @returns {Promise<string>} - AI response content
     */
    async getResponse(prompt) {
      const messages = [
        { role: 'user', content: prompt }
      ];
      
      const response = await this.sendMessage(messages);
      return response.choices[0].message.content;
    }
  
    /**
     * Continue conversation with existing message history
     * @param {Array} conversationHistory - Previous messages
     * @param {string} newMessage - Latest user message
     * @returns {Promise<string>} - AI response content
     */
    async continueConversation(conversationHistory, newMessage) {
      const messages = [
        ...conversationHistory,
        { role: 'user', content: newMessage }
      ];
      
      const response = await this.sendMessage(messages);
      return response.choices[0].message.content;
    }
  }
  
  export default LlmApi;