// Update the sendMessage method in the store
sendMessage: async (content) => {
    const state = get();
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    get().addMessage(newMessage);
    set({ isLoading: true });
    
    try {
      const response = await sendMessage(
        [...state.messages, newMessage],
        modelConfigs[state.selectedModel]
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date()
      };

      get().addMessage(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: error instanceof Error ? error.message : 'An error occurred while processing your request.',
        role: 'assistant',
        timestamp: new Date()
      };
      get().addMessage(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },



