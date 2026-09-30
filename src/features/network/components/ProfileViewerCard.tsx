import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Eye, ArrowRight } from 'lucide-react-native';

const C = { dark: '#4a3728' };

interface Viewer {
  id: string;
  name: string;
  image: string;
}

const ProfileViewerCard: React.FC<{
  viewerCount?: number;
  recentViewers?: Viewer[];
  isLoading?: boolean;
  onViewDetails?: () => void;
}> = ({ viewerCount = 0, recentViewers = [], isLoading = false, onViewDetails }) => {
  const displayViewers = recentViewers.slice(0, 3);
  const hasData = viewerCount > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onViewDetails}
      className="rounded-3xl border-2 border-[#4a3728] bg-[#f6ede8] p-5 mb-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-3 flex-1">
          <View className="w-12 h-12 rounded-2xl bg-[#e0d8cf] items-center justify-center">
            <Eye size={22} color={C.dark} />
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-black text-base text-[#4a3728] mb-0.5">
              Who Viewed Your Profile?
            </Text>
            {isLoading ? (
              <Text className="text-xs text-[#4a3728]/50">Loading...</Text>
            ) : hasData ? (
              <Text className="text-xs text-[#4a3728]/70 leading-4">
                {viewerCount} {viewerCount === 1 ? 'person' : 'people'} viewed your profile recently
              </Text>
            ) : (
              <Text className="text-xs text-[#4a3728]/70 leading-4">
                Discover who's interested in your professional journey
              </Text>
            )}
          </View>
        </View>
        {hasData && (
          <View className="bg-[#4a3728] px-3 py-1.5 rounded-full ml-2">
            <Text className="text-xs font-black text-[#f6ede8]">{viewerCount}</Text>
          </View>
        )}
      </View>

      {/* Show recent viewer avatars & action footer */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#4a3728]/10">
        {displayViewers.length > 0 ? (
          <View className="flex-row items-center gap-x-2">
            <View className="flex-row">
              {displayViewers.map((viewer, i) => (
                <View
                  key={viewer.id}
                  className="w-7 h-7 rounded-full border-2 border-[#f6ede8] overflow-hidden bg-[#e0d8cf]"
                  style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }}
                >
                  <Image
                    source={{
                      uri:
                        viewer.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          viewer.name || 'U'
                        )}&background=e0d8cf&color=4a3728&size=128`,
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
            <Text className="text-[10px] text-[#4a3728]/60 font-semibold ml-1">
              {viewerCount > 3 ? `+${viewerCount - 3} more` : 'Recent visitors'}
            </Text>
          </View>
        ) : (
          <Text className="text-[10px] text-[#4a3728]/60 font-semibold">
            Track your profile activity
          </Text>
        )}

        <View className="flex-row items-center gap-x-1">
          <Text className="text-xs font-bold text-[#4a3728]">View all</Text>
          <ArrowRight size={13} color={C.dark} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProfileViewerCard;

