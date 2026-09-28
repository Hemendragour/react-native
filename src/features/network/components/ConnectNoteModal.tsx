import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, TextInput, Image } from 'react-native';
import { UserPlus, Send, X, Sparkles } from 'lucide-react-native';
import { Person } from '../types/network.types';

const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#f6ede8',
  card: '#e0d8cf',
};

interface ConnectNoteModalProps {
  visible: boolean;
  onClose: () => void;
  targetPerson: Person | null;
  onSend: (targetUserId: string, message?: string) => Promise<void> | void;
}

const ConnectNoteModal: React.FC<ConnectNoteModalProps> = ({
  visible,
  onClose,
  targetPerson,
  onSend,
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!targetPerson) return null;

  const handleSendWithoutNote = async () => {
    setIsSending(true);
    try {
      await onSend(targetPerson.userId || targetPerson.id);
      setMessage('');
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  const handleSendWithNote = async () => {
    setIsSending(true);
    try {
      await onSend(targetPerson.userId || targetPerson.id, message.trim());
      setMessage('');
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-center p-4" onPress={onClose}>
        <Pressable
          className="bg-[#f6ede8] rounded-3xl p-6 border-2 border-[#4a3728]"
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-x-3">
              <Image
                source={{
                  uri:
                    targetPerson.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      targetPerson.name || 'User'
                    )}&background=e0d8cf&color=4a3728&size=128`,
                }}
                className="w-12 h-12 rounded-2xl bg-[#e0d8cf] border border-[#4a3728]/30"
              />
              <View>
                <Text className="text-base font-black text-[#4a3728]" numberOfLines={1}>
                  Connect with {targetPerson.name}
                </Text>
                <Text className="text-xs text-[#4a3728]/70" numberOfLines={1}>
                  {targetPerson.title || 'In your network'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
              <X size={20} color={C.dark} />
            </TouchableOpacity>
          </View>

          {/* Prompt */}
          <View className="bg-[#e0d8cf] p-3.5 rounded-2xl mb-4 border border-[#4a3728]/20">
            <View className="flex-row items-center gap-x-1.5 mb-1">
              <Sparkles size={14} color={C.dark} />
              <Text className="text-xs font-bold text-[#4a3728]">Pro-Tip</Text>
            </View>
            <Text className="text-xs text-[#4a3728]/80 leading-4">
              Adding a personal note increases the acceptance rate by over 70%.
            </Text>
          </View>

          {/* Text input */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={`Hi ${targetPerson.name}, I'd love to connect and follow your journey!`}
            placeholderTextColor="#7a5c3e80"
            multiline
            numberOfLines={4}
            maxLength={300}
            className="bg-[#e0d8cf] p-4 rounded-2xl text-[#4a3728] font-medium text-sm border border-[#4a3728]/30 mb-2 h-28"
            textAlignVertical="top"
          />

          <Text className="text-right text-[10px] text-[#4a3728]/60 mb-5 font-semibold">
            {message.length}/300 characters
          </Text>

          {/* Action buttons */}
          <View className="flex-row gap-x-2.5">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSendWithoutNote}
              disabled={isSending}
              className="flex-1 py-3.5 rounded-2xl bg-[#e0d8cf] items-center justify-center border border-[#4a3728]"
            >
              <Text className="font-bold text-xs text-[#4a3728]">Send Without Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendWithNote}
              disabled={isSending}
              className="flex-1 py-3.5 rounded-2xl bg-[#4a3728] flex-row items-center justify-center gap-x-2 shadow-sm"
            >
              <Send size={14} color="#f6ede8" />
              <Text className="font-black text-xs text-[#f6ede8]">
                {isSending ? 'Sending...' : 'Send Note'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConnectNoteModal;
