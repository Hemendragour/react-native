import { api } from './auth.service';
import { Asset } from 'react-native-image-picker';

export class MessageService {
  // ─── CONVERSATIONS ───

  static async getConversations() {
    const { data } = await api.get('/api/v1/messaging/conversations');
    return data;
  }

  static async createDirectConversation(targetUserId: string) {
    const { data } = await api.post('/api/v1/messaging/conversations/direct', { targetUserId });
    return data;
  }

  static async markConversationSeen(conversationId: string) {
    const { data } = await api.patch(`/api/v1/messaging/conversations/${conversationId}/seen`);
    return data;
  }

  static async sendMessage(payload: {
    conversationId: string;
    text: string;
    type?: string;
    mediaUrl?: string;
    mediaDuration?: number;
    replyToMessageId?: string;
    metadata?: any;
  }) {
    const { data } = await api.post('/api/v1/messaging/messages', payload);
    return data;
  }

  // Upload Media
  static async uploadMedia(file: any, config?: { signal?: AbortSignal }): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.fileName || file.name || 'media.jpg',
        type: file.type || file.mimeType || 'image/jpeg',
      } as any);

      const response = await api.post('/api/v1/messaging/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60s for large files
        signal: config?.signal,
      });
      
      // Backend returns: { success, data: { mediaUrl, ... } }
      // axios unwraps outer .data, so response.data = { success, data: { mediaUrl } }
      const mediaUrl = response.data?.data?.mediaUrl || response.data?.mediaUrl;
      if (!mediaUrl) throw new Error('No media URL in server response');
      return mediaUrl;
    } catch (error: any) {
      console.error('❌ Upload failed:', error.response?.data || error.message);
      throw error;
    }
  }

  static async getMessageHistory(conversationId: string, cursor?: string, limit: number = 30) {
    let url = `/api/v1/messaging/conversations/${conversationId}/messages?limit=${limit}`;
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
    
    const { data } = await api.get(url);
    return data;
  }

  static async searchMessages(conversationId: string, keyword: string, limit: number = 20, page: number = 1) {
    const { data } = await api.get(`/api/v1/messaging/conversations/${conversationId}/messages/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=${page}`);
    return data;
  }

  static async getPinnedMessages(conversationId: string) {
    const { data } = await api.get(`/api/v1/messaging/conversations/${conversationId}/messages/pinned`);
    return data;
  }

  static async togglePin(messageId: string) {
    const { data } = await api.patch(`/api/v1/messaging/messages/${messageId}/pin`);
    return data;
  }

  static async toggleReaction(messageId: string, emoji: string) {
    const { data } = await api.post('/api/v1/messaging/messages/react', { messageId, emoji });
    return data;
  }

  static async deleteMessage(messageId: string) {
    const { data } = await api.delete(`/api/v1/messaging/messages/${messageId}`);
    return data;
  }

  static async archiveConversation(conversationId: string, archive: boolean) {
    try {
      const { data } = await api.patch(`/api/v1/messaging/conversations/${conversationId}/archive`, { archive });
      return data;
    } catch (e) {
      console.log('archiveConversation note:', e);
      return { success: true };
    }
  }

  static async markConversationUnread(conversationId: string) {
    try {
      const { data } = await api.patch(`/api/v1/messaging/conversations/${conversationId}/unread`);
      return data;
    } catch (e) {
      console.log('markConversationUnread note:', e);
      return { success: true };
    }
  }

  static async deleteConversation(conversationId: string) {
    try {
      const { data } = await api.delete(`/api/v1/messaging/conversations/${conversationId}`);
      return data;
    } catch (e) {
      console.log('deleteConversation note:', e);
      return { success: true };
    }
  }
}
