import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Users, Check } from 'lucide-react-native';
import AuthService, { api } from '../../../services/auth.service';
import { StudyService } from '../../../services/study.service';
import FeedService from '../../../services/feed.service';
import { useNavigation } from '@react-navigation/native';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Top Voices', 'Companies', 'Groups', 'Newsletters', 'Schools'] as const;
type Tab = (typeof TABS)[number];

export interface InterestItem {
  id: string;
  itemType: 'user' | 'company' | 'group' | 'newsletter' | 'school';
  name: string;
  connection?: string;
  title: string;
  followers?: string;
  image: string;
  growth?: string;
  expertise?: string[];
  isFollowing?: boolean;
}

// ─── Interest Card ─────────────────────────────────────────────────────────────
const InterestCard: React.FC<{ 
  item: InterestItem; 
  onToggle: () => void;
  onPressItem: (item: InterestItem) => void;
}> = ({ item, onToggle, onPressItem }) => {
  const [following, setFollowing] = useState(Boolean(item.isFollowing));
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setFollowing(Boolean(item.isFollowing));
    setImageError(false);
  }, [item.isFollowing, item.image]);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        if (item.itemType === 'company') {
          await AuthService.unfollowCompany(item.id).catch(() => null);
        } else if (item.itemType === 'group') {
          await StudyService.leaveGroup(item.id).catch(() => null);
        } else {
          await AuthService.unfollowUser(item.id).catch(() => null);
        }
        setFollowing(false);
      } else {
        if (item.itemType === 'company') {
          await AuthService.followCompany(item.id).catch(() => null);
        } else if (item.itemType === 'group') {
          await StudyService.joinGroup(item.id).catch(() => null);
        } else {
          await AuthService.followUser(item.id).catch(() => null);
        }
        setFollowing(true);
      }
      onToggle();
    } catch (error) {
      console.log('Follow toggle error', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = useCallback(() => {
    onPressItem(item);
  }, [item, onPressItem]);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=4a3728&color=f6ede8&size=128`;
  const imageUri = (!imageError && item.image && item.image.startsWith('http'))
    ? item.image
    : fallbackAvatar;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.cardContainer}
    >
      <View style={styles.cardRow}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.avatarImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Header Row: Name & Connection Tag + Growth Badge on Right */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                {item.name}
              </Text>
              {item.connection ? (
                <Text style={styles.connectionText} numberOfLines={1}>
                  {item.connection}
                </Text>
              ) : null}
            </View>
            {item.growth ? (
              <View style={styles.growthBadge}>
                <Text style={styles.growthText}>{item.growth}</Text>
              </View>
            ) : null}
          </View>

          {/* Title / Headline / Job info */}
          <Text style={styles.titleText} numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Text>

          {/* Expertise Tags */}
          {item.expertise && item.expertise.length > 0 ? (
            <View style={styles.tagsRow}>
              {item.expertise.slice(0, 3).map((tag: any, i: number) => {
                const label = typeof tag === 'object' ? (tag.skillName || tag.name || String(tag)) : String(tag);
                return (
                  <View key={i} style={styles.tagBadge}>
                    <Text style={styles.tagText} numberOfLines={1}>{label}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* Followers */}
          {item.followers ? (
            <View style={styles.followersRow}>
              <Users size={11} color="#4a3728" opacity={0.6} />
              <Text style={styles.followersText} numberOfLines={1}>{item.followers}</Text>
            </View>
          ) : null}

          {/* Following / Join Button */}
          {following ? (
            <TouchableOpacity
              onPress={handleToggle}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.followingBtn}
            >
              {!loading && <Check size={12} color="#f6ede8" />}
              {loading && <ActivityIndicator size="small" color="#f6ede8" />}
              {!loading && (
                <Text style={styles.followingBtnText}>
                  {item.itemType === 'group' ? 'Joined' : 'Following'}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleToggle}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.followBtn}
            >
              {loading && <ActivityIndicator size="small" color="#4a3728" />}
              {!loading && (
                <Text style={styles.followBtnText}>
                  {item.itemType === 'group' ? 'Join' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const InterestsSection: React.FC<{ currentUserId?: string; followingCount?: number }> = ({ currentUserId, followingCount = 0 }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Top Voices');
  const [dynamicInterests, setDynamicInterests] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [realFollowingCount, setRealFollowingCount] = useState(followingCount);
  const navigation = useNavigation<any>();

  const handleNavigateItem = useCallback((item: InterestItem) => {
    if (item.itemType === 'user' && item.id) {
      navigation.push('Profile', { userId: item.id });
    } else if (item.itemType === 'group' && item.id) {
      if (item.isFollowing) {
        navigation.navigate('Study', {
          screen: 'GroupRoom',
          params: { groupId: item.id, groupName: item.name },
        });
      } else {
        Alert.alert(
          'Join Group',
          `You are not a member of "${item.name}". Would you like to join this group to access the study room and chat?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Join & Enter',
              onPress: async () => {
                try {
                  await StudyService.joinGroup(item.id);
                  setDynamicInterests(prev => prev.map(p => p.id === item.id ? { ...p, isFollowing: true } : p));
                  navigation.navigate('Study', {
                    screen: 'GroupRoom',
                    params: { groupId: item.id, groupName: item.name },
                  });
                } catch (err: any) {
                  // If already joined (400 / 409), still enter
                  if (err?.response?.status === 400 || err?.response?.status === 409 || err?.response?.data?.message?.toLowerCase().includes('already')) {
                    navigation.navigate('Study', {
                      screen: 'GroupRoom',
                      params: { groupId: item.id, groupName: item.name },
                    });
                  } else {
                    Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to join group');
                  }
                }
              },
            },
          ]
        );
      }
    }
  }, [navigation]);

  useEffect(() => {
    const fetchCounts = async () => {
      const u = AuthService.getCurrentUser() as any;
      const targetUserId = currentUserId || u?.userId || u?.id || u?._id;
      if (!targetUserId) return;
      try {
        const countsRes = await api.get(`/api/v1/connections/follow/counts/${targetUserId}`);
        const cData = countsRes.data?.data || countsRes.data || {};
        setRealFollowingCount(cData.following ?? cData.followingCount ?? followingCount);
      } catch (_err) {}
    };
    fetchCounts();
  }, [currentUserId, followingCount]);

  // ── 1. Top Voices ──
  const fetchTopVoices = async () => {
    const u = AuthService.getCurrentUser() as any;
    const targetUserId = currentUserId || u?.userId || u?.id || u?._id;
    const currentLoggedId = u?.userId || u?.id || u?._id;
    if (!targetUserId) return;

    try {
      setDynamicInterests([]);
      setLoading(true);

      // 1. Fetch current logged-in user's active following list to accurately know follow state
      const myFollowingIds = new Set<string>();
      if (currentLoggedId) {
        try {
          const myFollowingRes = await AuthService.getFollowing(currentLoggedId);
          const myFList = myFollowingRes?.data?.data?.data || myFollowingRes?.data?.data || myFollowingRes?.data || [];
          if (Array.isArray(myFList)) {
            myFList.forEach((fItem: any) => {
              const fUid = fItem.followingId?.userId || fItem.followingId?._id || fItem.followingId?.id || (typeof fItem.followingId === 'string' ? fItem.followingId : null) || fItem.userId || fItem._id;
              if (typeof fUid === 'string' && fUid) myFollowingIds.add(fUid);
            });
          }
        } catch (_e) {}
      }

      // 2. Fetch users followed by target user
      const res = await AuthService.getFollowing(targetUserId).catch(() => null);
      let followingList: any[] = [];
      if (Array.isArray(res?.data?.data?.data)) followingList = res.data.data.data;
      else if (Array.isArray(res?.data?.data)) followingList = res.data.data;
      else if (Array.isArray(res?.data)) followingList = res.data;

      // 3. Also fetch suggested / platform users if following list is small
      let combinedUsers = [...followingList];
      if (combinedUsers.length < 5) {
        const allUsersRes = await AuthService.getAllUsers({ limit: 10 }).catch(() => null);
        const allUsersData = allUsersRes?.data?.users || allUsersRes?.users || (Array.isArray(allUsersRes?.data) ? allUsersRes.data : []) || [];
        allUsersData.forEach((usr: any) => {
          const uId = usr.userId || usr._id || usr.id;
          if (
            uId &&
            uId !== targetUserId &&
            uId !== currentLoggedId &&
            !combinedUsers.some(existing => {
              const exId = existing.followingId?.userId || existing.followingId?._id || existing.followingId || existing.userId || existing._id || existing.id;
              return exId === uId;
            })
          ) {
            combinedUsers.push({ ...usr, isSuggested: true });
          }
        });
      }

      const populatedList = await Promise.all(
        combinedUsers.slice(0, 10).map(async (f: any) => {
          try {
            let baseUser = f.followingId && typeof f.followingId === 'object' ? f.followingId : (f.user && typeof f.user === 'object' ? f.user : f);

            const allPossibleIds = [
              typeof f.followingId === 'string' ? f.followingId : null,
              f.followingId?.userId, f.followingId?._id, f.followingId?.id,
              f.userId, f.user?.userId, f.user?._id, f.user?.id,
              f.followedId, f.followerId,
              baseUser.userId, baseUser._id, baseUser.id,
              f._id, f.id,
            ].filter(id => typeof id === 'string' && id.length > 5);

            let validUid = allPossibleIds.find(id => id.includes('-') && id !== targetUserId && id !== currentLoggedId) || '';
            if (!validUid) validUid = allPossibleIds.find(id => id.includes('-') && id !== targetUserId) || '';
            if (!validUid) validUid = allPossibleIds.find(id => id.length >= 24 && id !== targetUserId && id !== currentLoggedId) || '';
            if (!validUid && allPossibleIds.length > 0) validUid = allPossibleIds[0];

            if (!validUid) return baseUser;

            // Fetch target user's authentic data
            const [profileRes, countsRes, photosRes, headlineRes, followStatusRes] = await Promise.allSettled([
              AuthService.getUserProfileById(validUid),
              api.get(`/api/v1/connections/follow/counts/${validUid}`),
              api.get(`/api/v1/profile/profile-photo/get-all-photos/${validUid}`).catch(() => api.get(`/api/v1/profile/profile-photo/user/${validUid}/active`)),
              api.get(`/api/v1/profile/headlines/get-all-headlines/${validUid}`).catch(() => api.get(`/api/v1/profile/headlines/user/${validUid}`)),
              api.get(`/api/v1/connections/follow/status/${validUid}`).catch(() => null),
            ]);

            const rawProfileData = profileRes.status === 'fulfilled' ? (profileRes.value?.data?.data || profileRes.value?.data || profileRes.value) : {};
            const rawUserObj = rawProfileData?.user || rawProfileData?.account || (rawProfileData?.data?.user ? rawProfileData.data.user : rawProfileData) || {};
            const rawProfileObj = rawProfileData?.profile || (rawProfileData?.data?.profile ? rawProfileData.data.profile : {}) || {};
            const rawOnboardingObj = rawProfileData?.onboarding || rawUserObj?.onboarding || {};

            const mergedUser = {
              ...f,
              ...baseUser,
              ...rawOnboardingObj,
              ...rawUserObj,
              ...rawProfileObj,
              ...(typeof rawProfileData === 'object' ? rawProfileData : {}),
            };

            const countsData = countsRes.status === 'fulfilled' ? (countsRes.value?.data?.data || countsRes.value?.data || countsRes.value) : {};
            const followersCount = countsData?.followers ?? countsData?.followersCount ?? countsData?.followerCount ?? mergedUser?.followersCount ?? mergedUser?.followers ?? baseUser.followersCount ?? 0;

            // Extract target user's profile image
            let profileImage: string | undefined;
            if (photosRes.status === 'fulfilled' && photosRes.value?.data) {
              const photosData = photosRes.value.data?.data || photosRes.value.data || [];
              const photosArray = Array.isArray(photosData) ? photosData : photosData.photos || (photosData.url || photosData.cloudinarySecureUrl ? [photosData] : []);
              const activePhoto = Array.isArray(photosArray)
                ? photosArray.find((p: any) => (p.isActive || p.active) && (!p.userId || p.userId === validUid)) ||
                  photosArray.find((p: any) => !p.userId || p.userId === validUid) || photosArray[0]
                : null;
              if (activePhoto) {
                profileImage = activePhoto.cloudinarySecureUrl || activePhoto.cloudinaryUrl || activePhoto.url || activePhoto.imageUrl || activePhoto.photoUrl;
              }
            }

            const photoId = mergedUser.profilePhotoId || rawProfileObj.profilePhotoId || rawUserObj.profilePhotoId;
            if (!profileImage && photoId) {
              if (typeof photoId === 'object') {
                profileImage = photoId.cloudinarySecureUrl || photoId.cloudinaryUrl || photoId.url || photoId.imageUrl;
              } else if (typeof photoId === 'string' && photoId.startsWith('http')) {
                profileImage = photoId;
              } else if (typeof photoId === 'string' && photoId.length > 5) {
                try {
                  const singlePhotoRes = await AuthService.getProfilePhotoById(photoId);
                  const spData = singlePhotoRes?.data?.photo || singlePhotoRes?.data || singlePhotoRes;
                  profileImage = spData?.cloudinarySecureUrl || spData?.cloudinaryUrl || spData?.url || spData?.imageUrl;
                } catch (_e) {}
              }
            }

            if (!profileImage || typeof profileImage !== 'string' || !profileImage.startsWith('http')) {
              const cachedUser: any = FeedService.getUserFromCache(validUid) || {};
              profileImage = cachedUser.profileImage || cachedUser.avatar || cachedUser.profilePhoto ||
                mergedUser.profileImage || mergedUser.avatar || mergedUser.profilePhoto || mergedUser.imageUrl || mergedUser.photoUrl ||
                mergedUser.onboarding?.profileImage || rawUserObj.profileImage || rawUserObj.avatar || rawProfileObj.profileImage;
            }

            // Extract target user's headline / bio
            let fetchedHeadline = '';
            if (headlineRes.status === 'fulfilled' && headlineRes.value?.data) {
              const hlData = headlineRes.value.data?.data || headlineRes.value.data;
              let activeHl = Array.isArray(hlData)
                ? hlData.find((h: any) => (h.isActive || h.active) && (!h.userId || h.userId === validUid)) ||
                  hlData.find((h: any) => !h.userId || h.userId === validUid) || hlData[0]
                : hlData;
              const realHeadline = activeHl?.headline || activeHl;
              fetchedHeadline = realHeadline?.title || realHeadline?.headlineText || realHeadline?.text || (typeof realHeadline === 'string' ? realHeadline : '');
            }

            const isValidHeadline = (val: any): boolean => {
              if (!val || typeof val !== 'string') return false;
              const trimmed = val.trim().toLowerCase();
              return (
                trimmed.length > 0 &&
                trimmed !== 'user' &&
                trimmed !== 'admin' &&
                trimmed !== 'member' &&
                trimmed !== 'null' &&
                trimmed !== 'undefined' &&
                trimmed !== 'new user' &&
                trimmed !== 'unknown'
              );
            };

            if (!isValidHeadline(fetchedHeadline)) {
              fetchedHeadline = '';
            }

            if (!fetchedHeadline) {
              if (typeof mergedUser.headline === 'string' && isValidHeadline(mergedUser.headline)) {
                fetchedHeadline = mergedUser.headline.trim();
              } else if (typeof mergedUser.headline === 'object' && mergedUser.headline) {
                const cand = mergedUser.headline.title || mergedUser.headline.headlineText || mergedUser.headline.text || '';
                if (isValidHeadline(cand)) fetchedHeadline = cand.trim();
              }
            }

            if (!fetchedHeadline) {
              if (mergedUser.workingProfile?.jobTitle) {
                fetchedHeadline = mergedUser.workingProfile.companyName 
                  ? `${mergedUser.workingProfile.jobTitle} at ${mergedUser.workingProfile.companyName}`
                  : mergedUser.workingProfile.jobTitle;
              } else if (mergedUser.onboarding?.workingProfile?.jobTitle) {
                fetchedHeadline = mergedUser.onboarding.workingProfile.companyName
                  ? `${mergedUser.onboarding.workingProfile.jobTitle} at ${mergedUser.onboarding.workingProfile.companyName}`
                  : mergedUser.onboarding.workingProfile.jobTitle;
              } else if (mergedUser.studentProfile?.degree || mergedUser.onboarding?.studentProfile?.degree) {
                const deg = mergedUser.studentProfile?.degree || mergedUser.onboarding?.studentProfile?.degree;
                const col = mergedUser.studentProfile?.collegeName || mergedUser.onboarding?.studentProfile?.collegeName;
                fetchedHeadline = col ? `${deg} Student at ${col}` : `${deg} Student`;
              } else if (Array.isArray(mergedUser.experiences) && mergedUser.experiences.length > 0) {
                const exp = mergedUser.experiences.find((e: any) => e.currentlyWorking || e.current) || mergedUser.experiences[0];
                if (exp?.currentPosition || exp?.position) {
                  const pos = exp.currentPosition || exp.position;
                  const comp = exp.companyName || exp.company;
                  fetchedHeadline = comp ? `${pos} at ${comp}` : pos;
                }
              } else if (isValidHeadline(mergedUser.role)) {
                fetchedHeadline = mergedUser.role.trim();
              } else if (isValidHeadline(mergedUser.bio || mergedUser.about)) {
                fetchedHeadline = (mergedUser.bio || mergedUser.about).trim();
              }
            }

            // Accurate following calculation for current logged in user
            let isFollowing = myFollowingIds.has(validUid);
            if (followStatusRes.status === 'fulfilled' && followStatusRes.value?.data) {
              const fsData = followStatusRes.value.data?.data || followStatusRes.value.data;
              if (typeof fsData?.isFollowing === 'boolean') {
                isFollowing = fsData.isFollowing;
              } else if (typeof fsData?.following === 'boolean') {
                isFollowing = fsData.following;
              }
            }

            return {
              ...mergedUser,
              validUid,
              followersCount,
              profileImage,
              fetchedHeadline,
              isFollowing,
            };
          } catch (_e) {
            return f.followingId && typeof f.followingId === 'object' ? f.followingId : f;
          }
        })
      );

      const mapped: InterestItem[] = populatedList.map((user: any) => {
        const fName = user.firstName || user.name?.split(' ')[0] || user.onboarding?.firstName;
        const lName = user.lastName || user.name?.split(' ').slice(1).join(' ') || user.onboarding?.lastName;
        let fullName = fName ? `${fName} ${lName || ''}`.trim() : (user.name || user.username || user.email || 'Member');

        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4a3728&color=f6ede8&size=128`;
        const photo = (user.profileImage && typeof user.profileImage === 'string' && user.profileImage.startsWith('http'))
          ? user.profileImage
          : fallbackAvatar;

        const rawSkills = user.skills || user.skillsList || user.onboarding?.skills || user.profile?.skills || [];
        const expertiseList = Array.isArray(rawSkills)
          ? rawSkills.map((s: any) => typeof s === 'object' ? (s.skillName || s.name || '') : String(s)).filter(Boolean)
          : typeof rawSkills === 'string' ? [rawSkills] : [];

        return {
          id: user.validUid || user._id || user.userId || user.id,
          itemType: 'user' as const,
          name: fullName,
          connection: '• 2nd',
          title: user.fetchedHeadline || user.headline || 'Member on Throne8',
          followers: (user.followersCount && user.followersCount > 0) ? `${user.followersCount.toLocaleString()} followers` : '',
          image: photo,
          growth: 'Top Voice',
          expertise: expertiseList,
          isFollowing: user.isFollowing ?? false,
        };
      });

      setDynamicInterests(mapped);
    } catch (err) {
      console.error('Failed to fetch top voices:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── 2. Companies ──
  const fetchCompanies = async () => {
    const u = AuthService.getCurrentUser() as any;
    const targetUserId = currentUserId || u?.userId || u?.id || u?._id;
    if (!targetUserId) return;

    try {
      setDynamicInterests([]);
      setLoading(true);
      const res = await AuthService.getCompanies(targetUserId).catch(() => null);
      let companiesList = [];
      if (Array.isArray(res?.data?.data?.data)) companiesList = res.data.data.data;
      else if (Array.isArray(res?.data?.data)) companiesList = res.data.data;
      else if (Array.isArray(res?.data)) companiesList = res.data;

      // Curated tech & innovation companies if none are returned
      if (companiesList.length === 0) {
        companiesList = [
          {
            _id: 'throne8-corp',
            name: 'Throne8 Network',
            industry: 'Professional Networking & Career Technology',
            description: 'AI-driven career development and networking platform for high-impact professionals.',
            followersCount: 15420,
            logo: 'https://img.icons8.com/color/96/briefcase.png',
            specialties: ['AI Tech', 'Professional Network', 'Career Guidance'],
            isFollowing: true,
          },
          {
            _id: 'google-inc',
            name: 'Google',
            industry: 'Internet & Technology Services',
            description: 'Organizing the world’s information and making it universally accessible and useful.',
            followersCount: 28490000,
            logo: 'https://img.icons8.com/color/96/google-logo.png',
            specialties: ['Cloud Computing', 'AI / ML', 'Software'],
            isFollowing: false,
          },
          {
            _id: 'microsoft-corp',
            name: 'Microsoft',
            industry: 'Computer Software & Cloud Computing',
            description: 'Empowering every person and every organization on the planet to achieve more.',
            followersCount: 21300000,
            logo: 'https://img.icons8.com/color/96/microsoft.png',
            specialties: ['Azure Cloud', 'Enterprise Software', 'AI'],
            isFollowing: false,
          },
        ];
      }

      const mapped: InterestItem[] = companiesList.map((company: any) => ({
        id: company._id || company.companyId || company.id,
        itemType: 'company' as const,
        name: company.name || company.companyName || 'Company',
        connection: '• Org',
        title: company.description || company.industry || 'Technology & Innovation',
        followers: `${(company.followersCount || 0).toLocaleString()} followers`,
        image: company.logo || company.profileImage || 'https://img.icons8.com/color/96/briefcase.png',
        growth: company.growth || '',
        expertise: Array.isArray(company.specialties)
          ? company.specialties.map((s: any) => s?.specialtyName || s?.name || (typeof s === 'string' ? s : '')).filter(Boolean)
          : typeof company.specialties === 'string' ? [company.specialties] : ['Technology', 'Innovation'],
        isFollowing: company.isFollowing !== undefined ? company.isFollowing : true,
      }));
      setDynamicInterests(mapped);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── 3. Groups ──
  const fetchGroups = async () => {
    const u = AuthService.getCurrentUser() as any;
    const currentLoggedId = u?.userId || u?.id || u?._id;
    const isOwnProfile = !currentUserId || currentUserId === currentLoggedId;

    try {
      setDynamicInterests([]);
      setLoading(true);

      // 1. Fetch current logged-in user's joined group IDs
      const joinedGroupIds = new Set<string>();
      try {
        const myRes = await StudyService.getMyGroups();
        const myGroupList = myRes?.data?.groups || myRes?.data?.data || myRes?.data || myRes?.groups || (Array.isArray(myRes) ? myRes : []);
        if (Array.isArray(myGroupList)) {
          myGroupList.forEach((g: any) => {
            if (g.groupId) joinedGroupIds.add(String(g.groupId));
            if (g.id) joinedGroupIds.add(String(g.id));
            if (g._id) joinedGroupIds.add(String(g._id));
            if (g.group?._id) joinedGroupIds.add(String(g.group._id));
            if (g.group?.id) joinedGroupIds.add(String(g.group.id));
            if (g.group?.groupId) joinedGroupIds.add(String(g.group.groupId));
          });
        }
      } catch (_e) {}

      // 2. Fetch appropriate groups list
      let rawList: any[] = [];
      if (isOwnProfile) {
        const myRes = await StudyService.getMyGroups().catch(() => null);
        if (Array.isArray(myRes?.data?.groups)) rawList = myRes.data.groups;
        else if (Array.isArray(myRes?.data?.data)) rawList = myRes.data.data;
        else if (Array.isArray(myRes?.data)) rawList = myRes.data;
        else if (Array.isArray(myRes?.groups)) rawList = myRes.groups;
        else if (Array.isArray(myRes)) rawList = myRes;
      }

      if (rawList.length === 0) {
        const allRes = await StudyService.getAllGroups({ limit: 10 }).catch(() => null);
        if (Array.isArray(allRes?.data?.groups)) rawList = allRes.data.groups;
        else if (Array.isArray(allRes?.data?.data)) rawList = allRes.data.data;
        else if (Array.isArray(allRes?.data)) rawList = allRes.data;
        else if (Array.isArray(allRes?.groups)) rawList = allRes.groups;
        else if (Array.isArray(allRes)) rawList = allRes;
      }

      if (Array.isArray(rawList)) {
        const mapped: InterestItem[] = rawList.map((grp: any) => {
          const groupId = String(grp.groupId || grp._id || grp.id || '');
          const realName = grp.title || grp.name || grp.groupName || grp.topic || 'Study Group';
          const memberCount = grp.currentMemberCount || grp.memberCount || grp.members || (Array.isArray(grp.membersList) ? grp.membersList.length : 1);
          const isPrivate = grp.visibility === 'private' || grp.isPrivate;
          const isMember = Boolean(
            grp.isMember === true ||
            (groupId && joinedGroupIds.has(groupId)) ||
            (grp._id && joinedGroupIds.has(String(grp._id))) ||
            (grp.groupId && joinedGroupIds.has(String(grp.groupId))) ||
            (grp.id && joinedGroupIds.has(String(grp.id)))
          );
          const groupImage = grp.avatar || grp.coverImage || grp.image || grp.icon || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop';
          const tags = Array.isArray(grp.tags) && grp.tags.length > 0
            ? grp.tags
            : (Array.isArray(grp.subjects) && grp.subjects.length > 0 ? grp.subjects : [grp.category || 'Study', 'Collaboration']);

          return {
            id: groupId,
            itemType: 'group' as const,
            name: realName,
            connection: '• Group',
            title: grp.description || (grp.category ? `${grp.category} Study & Discussion` : 'Study & Networking Space'),
            followers: `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`,
            image: groupImage,
            growth: isPrivate ? 'Private' : 'Public',
            expertise: tags,
            isFollowing: isMember,
          };
        });
        setDynamicInterests(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch groups in Interests:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── 4. Newsletters ──
  const fetchNewsletters = async () => {
    try {
      setDynamicInterests([]);
      setLoading(true);
      const newsletters = [
        {
          id: 'nl-tech-digest',
          name: 'Tech & AI Weekly Dispatch',
          title: 'Curated insights on modern software engineering, scalable architectures, and emerging AI tools.',
          followers: '14,800 subscribers',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&h=150&fit=crop',
          growth: 'Weekly',
          expertise: ['AI Trends', 'System Design', 'Cloud Architecture'],
          isFollowing: true,
        },
        {
          id: 'nl-career-edge',
          name: 'The Leadership & Career Edge',
          title: 'Actionable strategies for engineering managers, product leaders, and high-growth innovators.',
          followers: '9,250 subscribers',
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&h=150&fit=crop',
          growth: 'Bi-Weekly',
          expertise: ['Career Growth', 'Tech Leadership', 'Networking'],
          isFollowing: true,
        },
        {
          id: 'nl-fullstack-bytes',
          name: 'Full-Stack Mastery',
          title: 'Deep dives into React Native, TypeScript, distributed databases, and high-throughput microservices.',
          followers: '18,400 subscribers',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&h=150&fit=crop',
          growth: 'Weekly',
          expertise: ['React Native', 'Node.js', 'Distributed Systems'],
          isFollowing: false,
        },
      ];

      const mapped: InterestItem[] = newsletters.map(nl => ({
        id: nl.id,
        itemType: 'newsletter' as const,
        name: nl.name,
        connection: '• Newsletter',
        title: nl.title,
        followers: nl.followers,
        image: nl.image,
        growth: nl.growth,
        expertise: nl.expertise,
        isFollowing: nl.isFollowing,
      }));

      setDynamicInterests(mapped);
    } catch (err) {
      console.error('Failed to fetch newsletters:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── 5. Schools ──
  const fetchSchools = async () => {
    const u = AuthService.getCurrentUser() as any;
    const targetUserId = currentUserId || u?.userId || u?.id || u?._id;

    try {
      setDynamicInterests([]);
      setLoading(true);

      // Fetch user's schools from education endpoint
      let userSchools: any[] = [];
      try {
        const eduRes = targetUserId
          ? await api.get(`/api/v1/profile/education/get-all-education/${targetUserId}`).catch(() => api.get(`/api/v1/profile/education/get-all-education`))
          : await api.get(`/api/v1/profile/education/get-all-education`);
        const eduData = eduRes?.data?.data || eduRes?.data?.educationList || eduRes?.data || [];
        userSchools = Array.isArray(eduData) ? eduData : (eduData?.educationList || eduData?.educations || []);
      } catch (_e) {}

      const schoolsList = userSchools.length > 0 ? userSchools.map((edu: any) => ({
        id: edu.educationId || edu._id || edu.schoolCollegeName || 'school-1',
        name: edu.schoolCollegeName || edu.schoolcollegename || 'University',
        title: edu.degree ? `${edu.degree}${edu.specialization ? ` • ${edu.specialization}` : ''}` : 'Higher Education & Research',
        followers: edu.location ? `${edu.location}` : 'Alumni & Students Network',
        image: 'https://img.icons8.com/color/96/graduation-cap.png',
        growth: 'Alma Mater',
        expertise: edu.skills && edu.skills.length > 0 ? edu.skills : ['Academic Excellence', 'Research'],
        isFollowing: true,
      })) : [
        {
          id: 'school-mit',
          name: 'Massachusetts Institute of Technology',
          title: 'Pioneering research in computer science, artificial intelligence, and applied engineering.',
          followers: '2,400,000 alumni & followers',
          image: 'https://img.icons8.com/color/96/graduation-cap.png',
          growth: 'Top Tier',
          expertise: ['Computer Science', 'AI Research', 'Engineering'],
          isFollowing: true,
        },
        {
          id: 'school-stanford',
          name: 'Stanford University',
          title: 'Leading incubator of Silicon Valley technology founders, venture capital, and deep learning.',
          followers: '1,950,000 alumni & followers',
          image: 'https://img.icons8.com/color/96/graduation-cap.png',
          growth: 'Top Tier',
          expertise: ['Entrepreneurship', 'AI', 'System Design'],
          isFollowing: false,
        },
      ];

      const mapped: InterestItem[] = schoolsList.map(s => ({
        id: s.id,
        itemType: 'school' as const,
        name: s.name,
        connection: '• School',
        title: s.title,
        followers: s.followers,
        image: s.image,
        growth: s.growth,
        expertise: s.expertise,
        isFollowing: s.isFollowing,
      }));

      setDynamicInterests(mapped);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Top Voices') {
      fetchTopVoices();
    } else if (activeTab === 'Companies') {
      fetchCompanies();
    } else if (activeTab === 'Groups') {
      fetchGroups();
    } else if (activeTab === 'Newsletters') {
      fetchNewsletters();
    } else if (activeTab === 'Schools') {
      fetchSchools();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUserId]);

  return (
    <View style={styles.sectionContainer}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Interests</Text>
        </View>

        {/* Following Count */}
        <View style={styles.followingBadge}>
          <Text style={styles.followingCountText}>{realFollowingCount}</Text>
          <Text style={styles.followingLabelText}>Following</Text>
        </View>
      </View>

      {/* ── Tab Bar ── */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 4 }}
        >
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Interest Cards ── */}
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#4a3728" style={{ marginVertical: 32 }} />
        ) : dynamicInterests.length > 0 ? (
          dynamicInterests.map((item, idx) => (
            <InterestCard
              key={`${item.id}-${idx}`}
              item={item}
              onPressItem={handleNavigateItem}
              onToggle={() => {
                if (activeTab === 'Top Voices') fetchTopVoices();
                else if (activeTab === 'Companies') fetchCompanies();
                else if (activeTab === 'Groups') fetchGroups();
                else if (activeTab === 'Newsletters') fetchNewsletters();
                else if (activeTab === 'Schools') fetchSchools();
              }}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found yet.</Text>
          </View>
        )}
      </View>

      {/* ── Show All Button ── */}
      <View style={styles.showAllWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.showAllBtn}
        >
          <Text style={styles.showAllText}>
            Show all {activeTab}
          </Text>
          <View style={styles.showAllArrow}>
            <Text style={styles.showAllArrowText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Stylesheet (Guarantees zero NativeWind arbitrary opacity crashes) ─────────
const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: 'rgba(246, 237, 232, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(224, 216, 207, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a3728',
    letterSpacing: -0.3,
  },
  followingBadge: {
    backgroundColor: 'rgba(74, 55, 40, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(224, 216, 207, 0.5)',
    alignItems: 'center',
  },
  followingCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a3728',
    textAlign: 'center',
  },
  followingLabelText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(74, 55, 40, 0.7)',
    textAlign: 'center',
  },
  tabBarContainer: {
    backgroundColor: 'rgba(224, 216, 207, 0.4)',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#4a3728',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(74, 55, 40, 0.6)',
  },
  tabButtonTextActive: {
    color: '#f6ede8',
  },
  cardContainer: {
    backgroundColor: 'rgba(224, 216, 207, 0.45)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0d8cf',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e0d8cf',
    backgroundColor: 'rgba(74, 55, 40, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 4,
  },
  titleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4a3728',
    flexShrink: 1,
  },
  connectionText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(74, 55, 40, 0.6)',
  },
  growthBadge: {
    backgroundColor: '#4a3728',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    flexShrink: 0,
  },
  growthText: {
    color: '#f6ede8',
    fontSize: 10,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 12,
    color: 'rgba(74, 55, 40, 0.75)',
    lineHeight: 16,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(74, 55, 40, 0.08)',
    borderRadius: 6,
  },
  tagText: {
    color: '#4a3728',
    fontSize: 11,
    fontWeight: '500',
  },
  followersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  followersText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(74, 55, 40, 0.6)',
  },
  followingBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#4a3728',
    gap: 5,
  },
  followingBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f6ede8',
  },
  followBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#e0d8cf',
    borderWidth: 1,
    borderColor: '#4a3728',
    gap: 5,
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4a3728',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(74, 55, 40, 0.5)',
    fontWeight: '500',
  },
  showAllWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  showAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(74, 55, 40, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  showAllText: {
    color: '#4a3728',
    fontWeight: 'bold',
    fontSize: 14,
  },
  showAllArrow: {
    width: 28,
    height: 28,
    backgroundColor: '#4a3728',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showAllArrowText: {
    color: '#f6ede8',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default InterestsSection;