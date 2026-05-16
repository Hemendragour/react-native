import { View, Text, Image } from 'react-native';
import React, { useState } from 'react';

interface PostContentProps {
  post: any;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const content = post.content || post.title || '';
  const isLong = content.length > 180;
  const display = isLong && !expanded ? content.slice(0, 180) + '...' : content;

  const images: string[] = [];
  if (post.image) images.push(post.image);
  if (post.images?.length) {
    post.images.forEach((img: any) => {
      const url = img.cloudinarySecureUrl || img.url || img;
      if (url && typeof url === 'string') images.push(url);
    });
  }

  return (
    <View className="mb-3">
      {/* Text content */}
      {content ? (
        <View className="mb-3">
          <Text className="text-[#6b4e3d] text-sm font-medium leading-relaxed">
            {display}
          </Text>
          {isLong && (
            <Text
              className="text-xs font-bold mt-1"
              style={{ color: '#6b4e3d' }}
              onPress={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </Text>
          )}
        </View>
      ) : null}

      {/* Images */}
      {images.length === 1 && (
        <View className="rounded-2xl overflow-hidden">
          <Image
            source={{ uri: images[0] }}
            className="w-full h-56"
            resizeMode="cover"
          />
        </View>
      )}

      {images.length > 1 && (
        <View className="flex-row flex-wrap gap-1 rounded-2xl overflow-hidden">
          {images.slice(0, 4).map((uri, idx) => (
            <View
              key={idx}
              style={{
                width: images.length === 2 ? '49%' : '49%',
                aspectRatio: 1,
              }}
              className="overflow-hidden rounded-xl"
            >
              <Image
                source={{ uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {idx === 3 && images.length > 4 && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <Text className="text-white text-xl font-black">
                    +{images.length - 4}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PostContent;
