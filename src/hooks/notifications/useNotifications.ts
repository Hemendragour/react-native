import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../../services/notification.service';
import AuthService from '../../services/auth.service';
import { onNewNotification, onUnreadNotificationCount, onGroupRoomBroadcast } from '../../services/socket.service';
import { GroupBroadcastService } from '../../services/group-broadcast.service';

export interface AppNotification {
  id: string;
  type: 'connection' | 'view' | 'like' | 'comment' | 'system' | 'study_group_broadcast';
  content: string;
  isRead: boolean;
  time: string;
  actor: {
    name: string;
    image?: string;
  };
  raw?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, savedBroadcasts] = await Promise.all([
        NotificationService.getNotifications().catch(() => null),
        GroupBroadcastService.getBroadcasts().catch(() => []),
      ]);

      let rawData = res?.data?.data || res?.data || [];
      let data = Array.isArray(rawData) ? rawData : (rawData.notifications || []);

      // Map backend notification to frontend interface
      const mapped = await Promise.all(data.map(async (notif: any) => {
        // Safe extraction
        const id = notif.notificationId || notif._id || notif.id || Math.random().toString();
        const type = notif.type || 'system';
        const content = notif.message || notif.content || 'New notification';
        const isRead = !!notif.isRead;
        
        // Format time safely
        let time = 'Just now';
        if (notif.createdAt) {
           const date = new Date(notif.createdAt);
           if (!isNaN(date.getTime())) {
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
              if (diffHrs < 1) time = 'Just now';
              else if (diffHrs < 24) time = `${diffHrs}h`;
              else time = `${Math.floor(diffHrs / 24)}d`;
           }
        }
        
        let actorName = notif.senderName || 'User';
        let actorImage = notif.senderPhoto;

        // Check if actor data is nested (in case of populated fields)
        const sender = notif.actor || notif.sender || {};
        if (sender && (sender.firstName || sender.name || sender.username)) {
           actorName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || sender.name || sender.username;
           actorImage = sender.profileImage || sender.avatar || sender.profilePicture || actorImage;
        }
        
        // If we still don't have a valid image URL, try fetching profile by senderId
        const hasValidImage = actorImage && typeof actorImage === 'string' && actorImage.startsWith('http');
        const senderId = notif.senderId || sender?._id || sender?.id;
        
        if (!hasValidImage && senderId && typeof senderId === 'string') {
           try {
               const profileRes = await AuthService.getUserProfileById(senderId);
               const rawProfile = profileRes?.data?.data || profileRes?.data || profileRes || {};
               const p = rawProfile?.profile || {};
               const account = rawProfile?.user || rawProfile?.data || rawProfile || {};
               
               // Resolve name if still default
               if (actorName === 'User') {
                 actorName = `${p.firstName || account.firstName || ''} ${p.lastName || account.lastName || ''}`.trim() || p.name || account.username || 'User';
               }
               
               // Resolve image
               const resolvedImage = p.profileImage || account.profileImage || p.avatar || account.avatar || p.profilePicture || account.profilePicture;
               if (resolvedImage && typeof resolvedImage === 'string' && resolvedImage.startsWith('http')) {
                   actorImage = resolvedImage;
               }
           } catch (e) {
               console.log('Failed to fetch profile for notification sender:', senderId);
           }
        }

        // Final fallback: generate avatar from initials if nothing worked
        if (!actorImage || typeof actorImage !== 'string' || !actorImage.startsWith('http')) {
            actorImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(actorName)}&background=e0d8cf&color=4a3728&size=128`;
        }

        let frontendType = 'system';
        if (type === 'post_liked') frontendType = 'like';
        else if (type === 'post_commented') frontendType = 'comment';
        else if (type === 'connection_request' || type === 'connection_accepted') frontendType = 'connection';
        else if (type === 'study_group_broadcast') frontendType = 'study_group_broadcast';
        else if (type === 'post_created') frontendType = 'system';

        return {
          id,
          type: frontendType as any,
          content,
          isRead,
          time,
          actor: {
            name: actorName,
            image: actorImage
          },
          raw: notif
        };
      }));

      // Map local study group broadcasts
      const mappedBroadcasts: AppNotification[] = (savedBroadcasts || []).map((b) => {
        let time = 'Just now';
        if (b.createdAt) {
          const date = new Date(b.createdAt);
          if (!isNaN(date.getTime())) {
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHrs < 1) time = 'Just now';
            else if (diffHrs < 24) time = `${diffHrs}h`;
            else time = `${Math.floor(diffHrs / 24)}d`;
          }
        }
        return {
          id: b.id,
          type: 'study_group_broadcast' as any,
          content: `📢 [${b.groupName}] Announcement: ${b.message}`,
          isRead: b.isRead,
          time,
          actor: {
            name: b.groupName || b.senderName,
            image: b.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.senderName || 'Admin')}&background=4a3728&color=ffffff&size=128`,
          },
          raw: {
            type: 'study_group_broadcast',
            entityType: 'study_group',
            entityId: String(b.groupId),
            groupId: String(b.groupId),
            groupName: b.groupName,
            message: b.message,
            senderName: b.senderName,
            senderId: b.senderId,
            createdAt: b.createdAt,
          },
        };
      });

      // Merge avoiding duplicate IDs and order unread / newest first
      const combined = [...mappedBroadcasts, ...mapped];
      const seen = new Set<string>();
      const deduplicated = combined.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      setNotifications(deduplicated);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    const unsubNew = onNewNotification((payload) => {
      fetchNotifications();
    });
    
    const unsubUnread = onUnreadNotificationCount((payload) => {
      fetchNotifications();
    });

    const unsubBcast = onGroupRoomBroadcast((payload) => {
      if (payload?.broadcast) {
        GroupBroadcastService.saveBroadcast(payload.broadcast).then(() => {
          fetchNotifications();
        });
      } else {
        fetchNotifications();
      }
    });

    return () => {
      unsubNew();
      unsubUnread();
      unsubBcast();
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      if (id.startsWith('bcast_')) {
        await GroupBroadcastService.markAsRead(id);
      } else {
        await NotificationService.markAsRead(id);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
      fetchNotifications(); // revert
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await Promise.allSettled([
        NotificationService.markAllAsRead(),
        GroupBroadcastService.markAllAsRead(),
      ]);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      fetchNotifications(); // revert
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (id.startsWith('bcast_')) {
        await GroupBroadcastService.deleteBroadcast(id);
      } else {
        await NotificationService.deleteNotification(id);
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      fetchNotifications(); // revert
    }
  };

  return { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  };
};
