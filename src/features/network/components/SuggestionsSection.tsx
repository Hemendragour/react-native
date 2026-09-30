import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Users } from 'lucide-react-native';
import { Person } from '../types/network.types';
import PersonCard from './PersonCard';
import PersonCardLoader from './PersonCardLoader';

const C = { dark: '#4a3728' };

const SuggestionsSection: React.FC<{
  title?: string;
  people?: Person[];
  connectedUsers?: Set<string>;
  onConnect: (id: string) => void;
  onConnectWithNote?: (person: Person) => void;
  onDismiss?: (id: string) => void;
  onMutualPress?: (person: Person) => void;
  onProfilePress?: (id: string) => void;
  isLoading?: boolean;
}> = ({
  title = 'People You May Know',
  people = [],
  connectedUsers = new Set(),
  onConnect,
  onConnectWithNote,
  onDismiss,
  onMutualPress,
  onProfilePress,
  isLoading = false,
}) => {
  const [showAll, setShowAll] = useState(false);
  const safePeople = Array.isArray(people) ? people : [];
  const displayed = showAll ? safePeople : safePeople.slice(0, 4);

  return (
    <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
      <View className="flex-row items-center justify-between mb-4 gap-x-2">
        <View className="flex-row items-center gap-x-2.5 flex-1 min-w-0 pr-1">
          <View className="w-9 h-9 rounded-xl bg-[#f6ede8] items-center justify-center shrink-0">
            <Users size={18} color={C.dark} />
          </View>
          <Text
            className="text-sm font-black text-[#4a3728] flex-1"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {title}
          </Text>
        </View>
        {safePeople.length > 4 && (
          <TouchableOpacity
            onPress={() => setShowAll(p => !p)}
            activeOpacity={0.8}
            className="bg-[#f6ede8] px-2.5 py-1.5 rounded-xl border border-[#4a3728]/20 shrink-0"
          >
            <Text className="text-[11px] font-bold text-[#4a3728]">
              {showAll ? 'Hide ▲' : `View all (${safePeople.length}) →`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {[0, 1, 2, 3].map(i => (
            <View key={i} className="w-[48%]">
              <PersonCardLoader />
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {displayed.map((p, i) => (
            <View key={`suggestion-${p.id || p.userId || i}-${i}`} className="w-[48%]">
              <PersonCard
                person={p}
                isConnected={Boolean(
                  (p.id && connectedUsers.has(p.id)) || (p.userId && connectedUsers.has(p.userId))
                )}
                onConnect={onConnect}
                onConnectWithNote={onConnectWithNote}
                onDismiss={onDismiss}
                onMutualPress={onMutualPress}
                onProfilePress={onProfilePress}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SuggestionsSection;

