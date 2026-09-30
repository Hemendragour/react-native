import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSocket, sendChatMessage } from './socket.service';

export interface GroupBroadcastItem {
  id: string;
  groupId: string | number;
  groupName: string;
  message: string;
  senderName: string;
  senderId: string;
  senderAvatar?: string;
  createdAt: string;
  isRead: boolean;
}

const STORAGE_KEY = '@study_group_broadcast_notifications_v1';

export const GroupBroadcastService = {
  /**
   * Save a broadcast notification to local storage
   */
  async saveBroadcast(item: GroupBroadcastItem): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: GroupBroadcastItem[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((x) => x.id !== item.id);
      filtered.unshift(item);
      const trimmed = filtered.slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('[GroupBroadcastService] Failed to save broadcast:', e);
    }
  },

  /**
   * Get all saved broadcasts
   */
  async getBroadcasts(): Promise<GroupBroadcastItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('[GroupBroadcastService] Failed to get broadcasts:', e);
      return [];
    }
  },

  /**
   * Get broadcasts for a specific group
   */
  async getBroadcastsForGroup(groupId: string | number): Promise<GroupBroadcastItem[]> {
    try {
      const all = await this.getBroadcasts();
      return all.filter((b) => String(b.groupId) === String(groupId));
    } catch (e) {
      return [];
    }
  },

  /**
   * Mark a single broadcast as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list: GroupBroadcastItem[] = JSON.parse(raw);
      const updated = list.map((item) => (item.id === id ? { ...item, isRead: true } : item));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[GroupBroadcastService] Failed to mark broadcast as read:', e);
    }
  },

  /**
   * Mark all broadcasts as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list: GroupBroadcastItem[] = JSON.parse(raw);
      const updated = list.map((item) => ({ ...item, isRead: true }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[GroupBroadcastService] Failed to mark all as read:', e);
    }
  },

  /**
   * Delete a broadcast notification
   */
  async deleteBroadcast(id: string): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list: GroupBroadcastItem[] = JSON.parse(raw);
      const updated = list.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[GroupBroadcastService] Failed to delete broadcast:', e);
    }
  },

  /**
   * Send and broadcast an announcement from group admin
   */
  async sendBroadcast(params: {
    groupId: string | number;
    groupName: string;
    message: string;
    senderName: string;
    senderId: string;
    senderAvatar?: string;
  }): Promise<GroupBroadcastItem> {
    const broadcastItem: GroupBroadcastItem = {
      id: 'bcast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      groupId: params.groupId,
      groupName: params.groupName,
      message: params.message.trim(),
      senderName: params.senderName || 'Admin',
      senderId: params.senderId,
      senderAvatar: params.senderAvatar,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Save locally
    await this.saveBroadcast(broadcastItem);

    // Emit live room socket event
    const socket = getSocket();
    const payload = {
      roomId: String(params.groupId),
      groupId: String(params.groupId),
      groupName: params.groupName,
      broadcast: broadcastItem,
    };

    if (socket && socket.connected) {
      // 1. Live room broadcast event (for members currently in the room)
      socket.emit('group-room-broadcast', payload);

      // 2. Notification event (for offline / outside room members)
      socket.emit('notification:new', {
        notificationId: broadcastItem.id,
        id: broadcastItem.id,
        type: 'study_group_broadcast',
        entityType: 'study_group',
        entityId: String(params.groupId),
        title: `📢 ${params.groupName} Announcement`,
        message: params.message.trim(),
        groupName: params.groupName,
        groupId: String(params.groupId),
        senderName: params.senderName,
        senderId: params.senderId,
        senderPhoto: params.senderAvatar,
        createdAt: broadcastItem.createdAt,
        isRead: false,
      });
    }

    // 3. Post to group chat room so it is preserved in chat history
    try {
      sendChatMessage({
        groupId: String(params.groupId),
        content: `📢 [ANNOUNCEMENT] ${params.message.trim()}`,
      });
    } catch (err) {
      console.log('[GroupBroadcastService] Failed to send to chat:', err);
    }

    return broadcastItem;
  },
};

export default GroupBroadcastService;
