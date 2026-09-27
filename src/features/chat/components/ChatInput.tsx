import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const PaperclipIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SendIcon = ({ disabled }: { disabled: boolean }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={disabled ? "#4a3728" : "#f6ede8"} strokeOpacity={disabled ? 0.3 : 1} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface ChatInputProps {
  onSend: (text: string) => void;
  onAttachPress?: () => void;
}

export default function ChatInput({ onSend, onAttachPress }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View className="flex-row items-end px-3 py-2 bg-[#f6ede8] border-t border-[#e0d8cf]">
      <TouchableOpacity 
        className="w-10 h-10 items-center justify-center mr-1"
        onPress={onAttachPress}
      >
        <PaperclipIcon />
      </TouchableOpacity>
      
      <View className="flex-1 bg-[#e0d8cf] rounded-2xl min-h-[40px] max-h-[100px] justify-center px-4 py-2 border border-[#4a3728]/20">
        <TextInput
          className="text-sm font-bold text-[#4a3728] flex-1 py-0 m-0"
          placeholder="Write a message..."
          placeholderTextColor="rgba(74,55,40,0.5)"
          multiline
          value={text}
          onChangeText={setText}
        />
      </View>
      
      <TouchableOpacity 
        className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${text.trim() ? 'bg-[#4a3728]' : 'bg-[#e0d8cf] border border-[#4a3728]/20'}`}
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <SendIcon disabled={!text.trim()} />
      </TouchableOpacity>
    </View>
  );
}
