// features/home/screens/DashboardScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, TextInput, SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
// import { useNavigation, useRoute  } from '@react-navigation/native';

import LeftSidebar, { HamburgerIcon } from '../components/LeftSideDrawer';
import CreatePostPrompt from '../components/Createpostprompt';
import FeedContainer from '../components/FeedContainer';
import { dummyProfile } from '../../profile/components/ProfileHeader';
import { EMOJI_LIST } from '../components/Emojipicker';
// import { Route } from 'lucide-react-native';
import BottomBar from '../../../shared/components/BottomBar';

// ─── Dummy posts ──────────────────────────────────────────────────────────────

const DUMMY_POSTS = [
  {
    postId: 'p1', entryId: 'p1',
    user: 'Er.Sujal sharma',
    avatar: 'https://i.pravatar.cc/150?img=8',
    role: 'Founder lolo.com',
    time: '3w ago',
    content: 'Even the sound of the sirens on the news can send a chill down your spine.....',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    likesCount: 30, commentsCount: 5, shares: 2,
    isLikedByCurrentUser: false, userId: 'user2',
  },
  {
    postId: 'p2', entryId: 'p2',
    user: 'Therone8',
    avatar: dummyProfile.profileImage,
    role: 'Pvt. Limited',
    time: '2w ago',
    content: 'Excited to share our latest platform update! AI-powered networking is now live for all users. Connect smarter, grow faster. 🚀',
    image: null,
    likesCount: 14, commentsCount: 3, shares: 1,
    isLikedByCurrentUser: false, userId: 'user1',
  },
  {
    postId: 'p3', entryId: 'p3',
    user: 'Sarah Wilson',
    avatar: 'https://i.pravatar.cc/150?img=20',
    role: 'Product Designer',
    time: '4h ago',
    content: 'Just launched our new design system! Working with an amazing team to create consistent, beautiful experiences. 🎨',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
    likesCount: 247, commentsCount: 18, shares: 8,
    isLikedByCurrentUser: false, userId: 'user3',
  },
];



// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const MessageIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

export default function DashboardScreen() {
  // const navigation = useNavigation<any>();
// const route = useRoute();
  // ── UI state ────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [isPostCreatorOpen, setIsPostCreatorOpen] = useState(false);

  // ── Feed state ───────────────────────────────────────────────────────────────
  const [posts, setPosts]                       = useState(DUMMY_POSTS);
  const [isLoadingPosts]                        = useState(false);
  const [likedPosts, setLikedPosts]             = useState<Record<string, boolean>>({});
  const [openMenuIndex, setOpenMenuIndex]       = useState<number | null>(null);
  const [openRepostIndex, setOpenRepostIndex]   = useState<number | null>(null);
  const [openCommentsIndex, setOpenCommentsIndex] = useState<string | null>(null);

  // ── Comment state ─────────────────────────────────────────────────────────
  const [commentText, setCommentText]           = useState('');
  const [replyingTo, setReplyingTo]             = useState<string | null>(null);
  const [openCommentMenuIndex, setOpenCommentMenuIndex] = useState<any>(null);
  const [editingCommentId, setEditingCommentId] = useState<any>(null);
  const [editCommentText, setEditCommentText]   = useState('');
  const [showEmojiPicker, setShowEmojiPicker]   = useState(false);
  const [postComments, setPostComments]         = useState<Record<string, any[]>>({});
  const [postCommentCounts, setPostCommentCounts] = useState<Record<string, number>>({});

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleLike = (postKey: string) => {
    setLikedPosts(prev => ({ ...prev, [postKey]: !prev[postKey] }));
  };

  const togglePostMenu = (index: number) => {
    setOpenMenuIndex(prev => prev === index ? null : index);
  };

  const toggleRepostMenu = (index: number) => {
    setOpenRepostIndex(prev => prev === index ? null : index);
  };

  const toggleComments = (postKey: string) => {
    setOpenCommentsIndex(prev => prev === postKey ? null : postKey);
    setCommentText('');
  };

  const handlePostAction = (action: string, index: number) => {
    setOpenMenuIndex(null);
    if (action === 'delete') {
      setPosts(prev => prev.filter((_, i) => i !== index));
    }
    // edit, save, report etc handled later with API
  };

  const handleCommentSubmit = (postKey: string) => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      commentId: Date.now().toString(),
      user: dummyProfile.name,
      avatar: dummyProfile.profileImage,
      time: 'Just now',
      content: commentText.trim(),
      reactions: {},
      replies: [],
    };
    setPostComments(prev => ({
      ...prev,
      [postKey]: [...(prev[postKey] || []), newComment],
    }));
    setPostCommentCounts(prev => ({
      ...prev,
      [postKey]: (prev[postKey] || 0) + 1,
    }));
    setCommentText('');
  };

  const handleReply = (commentId: string) => setReplyingTo(commentId);

  const handleCommentReaction = (commentId: string, emoji: string) => {
    setPostComments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(postKey => {
        updated[postKey] = updated[postKey].map(c => {
          if ((c.commentId || c.id) === commentId) {
            const reactions = { ...c.reactions };
            reactions[emoji] = (reactions[emoji] || 0) + 1;
            return { ...c, reactions };
          }
          return c;
        });
      });
      return updated;
    });
  };

  const toggleCommentMenu = (id: string) => {
    setOpenCommentMenuIndex((prev: any) => prev === id ? null : id);
  };

  const handleCommentAction = (action: string, comment: any) => {
    setOpenCommentMenuIndex(null);
    if (action === 'edit') {
      setEditingCommentId(comment.commentId || comment.id);
      setEditCommentText(comment.content || comment.text || '');
    } else if (action === 'delete') {
      setPostComments(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(postKey => {
          updated[postKey] = updated[postKey].filter(
            c => (c.commentId || c.id) !== (comment.commentId || comment.id)
          );
        });
        return updated;
      });
    } else if (action === 'cancelEdit') {
      setEditingCommentId(null);
      setEditCommentText('');
    }
  };

  const handleEditSubmit = (commentId: string) => {
    setPostComments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(postKey => {
        updated[postKey] = updated[postKey].map(c => {
          if ((c.commentId || c.id) === commentId) {
            return { ...c, content: editCommentText, text: editCommentText };
          }
          return c;
        });
      });
      return updated;
    });
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleEmojiClick = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleRepostInstant = (index: number) => {
    setOpenRepostIndex(null);
    // API call goes here
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <BottomBar>
    <View className="flex-1 bg-white">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <SafeAreaView className="bg-brand-light">
        <View className="flex-row items-center justify-between px-4 py-6 mt-2">

          {/* Left: hamburger + Throne8 */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-9 h-9 items-center justify-center"
              onPress={() => setSidebarOpen(true)}
              activeOpacity={0.7}
            >
              <HamburgerIcon />
            </TouchableOpacity>
            <Text
              className="font-black tracking-widest"
              style={{ fontSize: 20, color: '#8b6914' }}
            >
              THRONE8
            </Text>
          </View>

          {/* Right: profile avatar + message button */}
          <View className="flex-row items-center gap-2">
            <Image
              source={{ uri: dummyProfile.profileImage }}
              className="w-9 h-9 rounded-xl border border-brand-border"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="w-9 h-9 bg-brand-dark rounded-xl items-center justify-center"
              activeOpacity={0.8}
            >
              <MessageIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center gap-2 px-3 pb-2">
          <Image
            source={{ uri: dummyProfile.profileImage }}
            className="w-9 h-9 rounded-full border border-brand-border"
            resizeMode="cover"
          />
          <View className="flex-1 flex-row items-center bg-white/40 rounded-full px-4 py-2 border-2 border-dashed border-[#d4c4b5] gap-2">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor="rgba(74,55,40,0.5)"
              className="flex-1 text-brand-dark text-sm"
            />
            <SearchIcon />
          </View>
        </View>
      </SafeAreaView>

      {/* ── Feed ─────────────────────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Create post prompt */}
        <CreatePostPrompt
          setIsPostCreatorOpen={setIsPostCreatorOpen}
          profileImage={dummyProfile.profileImage}
        />

        {/* Posts feed */}
        <FeedContainer
          posts={posts}
          isLoadingPosts={isLoadingPosts}
          currentUserId="user1"
          likedPosts={likedPosts}
          handleLike={handleLike}
          openMenuIndex={openMenuIndex}
          openRepostIndex={openRepostIndex}
          openCommentsIndex={openCommentsIndex}
          commentText={commentText}
          setCommentText={setCommentText}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          openCommentMenuIndex={openCommentMenuIndex}
          editingCommentId={editingCommentId}
          editCommentText={editCommentText}
          setEditCommentText={setEditCommentText}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          handlePostAction={handlePostAction}
          togglePostMenu={togglePostMenu}
          toggleRepostMenu={toggleRepostMenu}
          toggleComments={toggleComments}
          handleCommentSubmit={handleCommentSubmit}
          handleReply={handleReply}
          handleCommentReaction={handleCommentReaction}
          toggleCommentMenu={toggleCommentMenu}
          handleCommentAction={handleCommentAction}
          handleEditSubmit={handleEditSubmit}
          handleEmojiClick={handleEmojiClick}
          postComments={postComments}
          postCommentCounts={postCommentCounts}
          emojiList={EMOJI_LIST}
          profileImage={dummyProfile.profileImage}
          onOpenWithPerspectiveModal={() => {}}
          handleRepostInstant={handleRepostInstant}
        />
      </ScrollView>

      

      {/* ── Left Sidebar Drawer ─────────────────────────────────────────── */}
      <LeftSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </View>
    </BottomBar>
  );
}