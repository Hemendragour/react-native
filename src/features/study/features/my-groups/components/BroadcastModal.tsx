import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { GroupBroadcastItem } from '../../../../../services/group-broadcast.service';

interface BroadcastModalProps {
  visible: boolean;
  onClose: () => void;
  isAdmin: boolean;
  groupId: string | number;
  groupName: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  broadcasts: GroupBroadcastItem[];
  onSendBroadcast: (message: string) => Promise<void>;
}

const QUICK_PROMPTS = [
  '🔥 Live study session starting now! Join in!',
  '⚡ We are reviewing important questions, come join!',
  '⏰ 10-minute break starting now!',
  '🎯 Today goal session is live. Hop in!',
];

export function BroadcastModal({
  visible,
  onClose,
  isAdmin,
  groupName,
  broadcasts,
  onSendBroadcast,
}: BroadcastModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Empty Message', 'Please enter a message to broadcast.');
      return;
    }
    try {
      setIsSending(true);
      await onSendBroadcast(message.trim());
      setMessage('');
      Alert.alert('Announcement Broadcasted', 'All group members have been notified!');
    } catch (e: any) {
      Alert.alert('Failed to Broadcast', e?.message || 'Could not broadcast announcement.');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return 'Just now';
      const now = new Date();
      const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Just now';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 20 }}>📢</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Group Announcements</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {groupName}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Admin Broadcast Box */}
            {isAdmin ? (
              <View style={styles.broadcastBox}>
                <View style={styles.badgeRow}>
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeTxt}>👑 ADMIN BROADCAST</Text>
                  </View>
                  <Text style={styles.audienceHint}>Live Room & Offline Members</Text>
                </View>

                <Text style={styles.inputLabel}>Write Message to All Members</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={3}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type an announcement (e.g. Join the room, we are solving previous years' questions!)..."
                  placeholderTextColor={colors.textMuted}
                  maxLength={300}
                />
                <View style={styles.charCountRow}>
                  <Text style={styles.charCount}>{message.length}/300</Text>
                </View>

                {/* Quick Prompts */}
                <Text style={styles.quickPromptLabel}>Quick Prompts:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPromptRow}>
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.quickPromptChip}
                      onPress={() => setMessage(prompt)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickPromptTxt} numberOfLines={1}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Send Button */}
                <TouchableOpacity
                  style={[styles.sendBtn, (!message.trim() || isSending) && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!message.trim() || isSending}
                  activeOpacity={0.8}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.sendBtnIcon}>📢</Text>
                      <Text style={styles.sendBtnTxt}>Broadcast to All Members</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.memberInfoBox}>
                <Text style={styles.memberInfoTitle}>ℹ️ Live Group Broadcasts</Text>
                <Text style={styles.memberInfoSubtitle}>
                  Announcements sent by the admin appear in this section in real time.
                </Text>
              </View>
            )}

            {/* Broadcast History */}
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>
                {isAdmin ? 'Recent Broadcasts' : 'All Announcements'}
              </Text>

              {broadcasts.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>🔔</Text>
                  <Text style={styles.emptyTitle}>No announcements yet</Text>
                  <Text style={styles.emptySubtitle}>
                    {isAdmin
                      ? 'Send your first broadcast announcement using the box above.'
                      : 'The group admin has not sent any announcements yet.'}
                  </Text>
                </View>
              ) : (
                broadcasts.map((b) => (
                  <View key={b.id} style={styles.announcementCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.senderRow}>
                        <View style={styles.senderAvatarBox}>
                          <Text style={{ fontSize: 14 }}>👑</Text>
                        </View>
                        <View>
                          <Text style={styles.senderName}>{b.senderName}</Text>
                          <Text style={styles.senderRole}>Group Admin</Text>
                        </View>
                      </View>
                      <Text style={styles.cardTime}>{formatTime(b.createdAt)}</Text>
                    </View>
                    <Text style={styles.cardMessage}>{b.message}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderBrown,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundMid,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnTxt: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 20,
  },
  broadcastBox: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.borderBrown,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  adminBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminBadgeTxt: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  audienceHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderBrown,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  quickPromptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 10,
    marginBottom: 6,
  },
  quickPromptRow: {
    marginBottom: 14,
  },
  quickPromptChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderBrown,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 220,
  },
  quickPromptTxt: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  sendBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnIcon: {
    fontSize: 16,
  },
  sendBtnTxt: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  memberInfoBox: {
    backgroundColor: colors.backgroundMid,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderBrown,
    marginBottom: 16,
  },
  memberInfoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  memberInfoSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  historySection: {},
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderBrown,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  announcementCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderBrown,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  senderAvatarBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  senderRole: {
    fontSize: 10,
    color: colors.textMuted,
  },
  cardTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    fontWeight: '500',
  },
});
