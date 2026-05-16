import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

const DotsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#4a3728">
    <Path d="M12 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostHeaderProps {
  post: any;
  index: number;
  openMenuIndex: number | null;
  togglePostMenu: (index: number) => void;
  handlePostAction: (action: string, index: number) => void;
  currentUserId?: string;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  index,
  openMenuIndex,
  togglePostMenu,
  handlePostAction,
  currentUserId,
}) => {
  const isOwner =
    currentUserId &&
    (currentUserId === post.userId || currentUserId === post.currentUserId);
  return (
    <View className="flex-row items-center justify-between mb-3">
      {/* Avatar + name + role + time */}
      <View className="flex-row items-center gap-3 flex-1">
        <Image
          source={{
            uri:
              post.avatar ||
              post.authorAvatar ||
              'https://i.pravatar.cc/150?img=5',
          }}
          className="w-12 h-12 rounded-2xl border-1 border-[#6b5643]"
          resizeMode="cover"
        />
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text
              className="text-[#4a3728] text-sm font-bold"
              numberOfLines={1}
            >
              {post.user || post.authorName || 'Unknown'}
            </Text>

            {/* Connect button — only show if not own post */}
            {!isOwner && (
              <TouchableOpacity
                className="bg-brand-border px-3 py-1 rounded-full border border-[#4a3728]"
                activeOpacity={0.7}
              >
                <Text className="text-[#4a3728] text-xs font-bold">
                  + Connect
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text
            className="text-xs font-semibold"
            style={{ color: '#6b5643' }}
            numberOfLines={1}
          >
            {post.role || post.authorHeadline || ''}
          </Text>
          <Text className="text-[#6b5643] text-xs">
            {post.time || post.timeAgo || ''}
          </Text>
        </View>
      </View>


      {/* 3-dot menu */}
      <View className="relative">
        <TouchableOpacity className="p-2 rounded-xl"
          onPress={() => togglePostMenu(index)}
          activeOpacity={0.7}>
            <DotsIcon />
          </TouchableOpacity>

          {/* Inline dropdown */}
          {openMenuIndex==index &&(
            <View className="absolute right-0 top-8 w-44 bg-[#f6ede8]/80 rounded-2xl border border-[#e0d8cf]/50  overflow-visible">
              {isOwner?(
                <>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-brand-border/30"
                  onPress={() => handlePostAction('edit', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] text-sm font-medium">Edit post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() => handlePostAction('delete', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-red-600 text-sm font-medium">Delete post</Text>
                </TouchableOpacity>
                </>
              ):(
                <>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-brand-border/30"
                  onPress={() => handlePostAction('save', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] text-sm font-medium">Save post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-brand-border/30"
                  onPress={() => handlePostAction('report', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-red-600 text-sm font-medium">Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() => { togglePostMenu(index); }}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] text-sm">Cancel</Text>
                </TouchableOpacity>
                </>
              )}
            </View>
          )}
      </View>
    </View>
  );
};

export default PostHeader;
