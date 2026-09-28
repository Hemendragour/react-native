import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { UserCheck } from 'lucide-react-native';
import { ConnectionRequest, SentRequest, RequestTabType } from '../types/network.types';
import ConnectionRequestCard from './ConnectionRequestCard';

const C = { dark: '#4a3728' };

const ConnectionRequestsList: React.FC<{
  requests?: ConnectionRequest[];
  sentRequests?: SentRequest[];
  isLoading?: boolean;
  showRequestsPanel: boolean;
  activeReqTab: RequestTabType;
  setActiveReqTab: (t: RequestTabType) => void;
  onTogglePanel: () => void;
  onAccept: (id: string) => void;
  onIgnore: (id: string) => void;
  onWithdraw: (id: string) => void;
  onProfilePress: (userId: string) => void;
}> = ({ requests = [], sentRequests = [], isLoading = false, showRequestsPanel, activeReqTab, setActiveReqTab, onTogglePanel, onAccept, onIgnore, onWithdraw, onProfilePress }) => {
  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeSentRequests = Array.isArray(sentRequests) ? sentRequests : [];

  if (isLoading) {
    return (
      <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-6 mb-4">
        <ActivityIndicator size="small" color={C.dark} />
        <Text className="text-center text-[#4a3728] text-sm mt-2">Loading requests...</Text>
      </View>
    );
  }
  return (
    <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
      <View className="flex-row items-center justify-between mb-4 gap-x-2">
        <View className="flex-row items-center gap-x-2.5 flex-1 min-w-0 pr-1">
          <View className="w-9 h-9 rounded-xl bg-[#f6ede8] items-center justify-center shrink-0">
            <UserCheck size={18} color={C.dark} />
          </View>
          <Text
            className="text-sm font-black text-[#4a3728] flex-1"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Connection Requests
          </Text>
        </View>
        <TouchableOpacity
          onPress={onTogglePanel}
          activeOpacity={0.8}
          className="bg-[#f6ede8] px-2.5 py-1.5 rounded-xl border border-[#4a3728]/20 shrink-0"
        >
          <Text className="text-[11px] font-bold text-[#4a3728]">
            {showRequestsPanel ? 'Hide ▲' : 'Show more →'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-x-6 mb-5 border-b border-[#4a3728]/20 pb-2">
        {(['received', 'sent'] as RequestTabType[]).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveReqTab(tab)} activeOpacity={0.8}>
            <Text className={`font-black text-sm text-[#4a3728] pb-2 ${activeReqTab === tab ? 'border-b-4 border-[#4a3728]' : 'opacity-50'}`}>
              {tab === 'received' ? `Received (${safeRequests.length})` : `Sent (${safeSentRequests.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeReqTab === 'received' ? (
        safeRequests.slice(0, showRequestsPanel ? undefined : 3).map(u => (
          <ConnectionRequestCard key={u.id || Math.random().toString()} user={u} onAccept={onAccept} onIgnore={onIgnore} onProfilePress={onProfilePress} />
        ))
      ) : (
        safeSentRequests.slice(0, showRequestsPanel ? undefined : 3).map(u => (
          <View key={u.id || Math.random().toString()} className="flex-row items-center justify-between p-4 rounded-2xl bg-[#f6ede8] mb-3 shadow-sm border border-[#e0d8cf]/50">
            <TouchableOpacity 
              className="flex-row items-center gap-x-3 flex-1"
              onPress={() => onProfilePress((u as any).userId || u.id)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: u.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }} className="w-12 h-12 rounded-full bg-[#e0d8cf]" resizeMode="cover" />
              <View>
                <Text className="font-bold text-sm text-[#4a3728]">{u.name}</Text>
                <Text className="text-xs text-[#4a3728]/70" numberOfLines={1}>{u.title}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onWithdraw(u.id)} activeOpacity={0.85}
              className="px-3 py-1.5 rounded-xl border border-[#4a3728] bg-transparent ml-2">
              <Text className="text-xs font-bold text-[#4a3728]">Withdraw</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

export default ConnectionRequestsList;
