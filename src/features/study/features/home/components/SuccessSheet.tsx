import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, Share,
  StyleSheet, Clipboard,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { CreateGroupFormData } from '../types/createGroup.types';

interface Props {
  visible: boolean;
  groupTitle: string;
  groupLink: string;
  formData: CreateGroupFormData;
  onClose: () => void;
  onCreateAnother: () => void;
}

export function SuccessSheet({ visible, groupTitle, groupLink, formData, onClose, onCreateAnother }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    Clipboard.setString(groupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    await Share.share({ message: `Join my study group: ${groupLink}`, url: groupLink });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.headerTitle}>Group Created! 🎉</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={s.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={s.body}>
            {/* Success icon */}
            <View style={s.iconWrap}>
              <Text style={s.iconEmoji}>✅</Text>
            </View>
            <Text style={s.groupName}>"{groupTitle}" is now live!</Text>

            {/* Share link */}
            <Text style={s.sectionLabel}>Share Link</Text>
            <View style={s.linkRow}>
              <Text style={s.linkText} numberOfLines={1} ellipsizeMode="tail">{groupLink}</Text>
              <TouchableOpacity
                style={[s.copyBtn, copied && s.copyBtnDone]}
                onPress={handleCopy}
              >
                <Text style={s.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>

            {/* Native share */}
            <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
              <Text style={s.shareBtnText}>📤 Share via…</Text>
            </TouchableOpacity>

            {/* Details summary */}
            <View style={s.details}>
              <Text style={s.detailsTitle}>Group Details</Text>
              <View style={s.detailsGrid}>
                <DetailItem icon="👥" label={`${formData.capacity} members`} />
                <DetailItem icon="🎯" label={`${formData.goalHours}h/day`} />
                <DetailItem icon={formData.visibility === 'public' ? '🌐' : '🔒'} label={formData.visibility} />
                <DetailItem icon={formData.cameraOn ? '📷' : '📷'} label={`Camera ${formData.cameraOn ? 'on' : 'off'}`} />
              </View>
            </View>

            {/* Actions */}
            <View style={s.actions}>
              <TouchableOpacity style={s.secondaryBtn} onPress={onCreateAnother}>
                <Text style={s.secondaryBtnText}>Create Another</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.primaryBtn} onPress={onClose}>
                <Text style={s.primaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DetailItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={sd.item}>
      <Text style={sd.icon}>{icon}</Text>
      <Text style={sd.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: colors.borderBrown,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  closeX: { fontSize: 18, color: colors.textMuted },
  body: { padding: 20 },

  iconWrap: { alignItems: 'center', marginBottom: 10 },
  iconEmoji: { fontSize: 48 },
  groupName: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 20 },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.text, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: colors.borderBrown, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
    backgroundColor: colors.backgroundMid,
  },
  linkText: { flex: 1, fontSize: 12, fontFamily: 'monospace', color: colors.textMid },
  copyBtn: { backgroundColor: colors.primaryLight, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  copyBtnDone: { backgroundColor: colors.success },
  copyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  shareBtn: {
    backgroundColor: colors.backgroundMid, borderRadius: 10, paddingVertical: 13,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.borderBrown, marginBottom: 16,
  },
  shareBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },

  details: { backgroundColor: colors.backgroundMid, borderRadius: 12, padding: 14, marginBottom: 20 },
  detailsTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  actions: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.primary,
  },
  secondaryBtnText: { fontWeight: '700', color: colors.primary },
  primaryBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center', backgroundColor: colors.primaryLight },
  primaryBtnText: { fontWeight: '700', color: '#fff' },
});

const sd = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '48%' },
  icon: { fontSize: 14 },
  label: { fontSize: 12, color: colors.textMid, textTransform: 'capitalize' },
});