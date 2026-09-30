import { ScrollView, View, ActivityIndicator, Text, RefreshControl, InteractionManager, TouchableOpacity } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProfileBanner from '../components/ProfileBanner'
import ProfileHeader from '../components/ProfileHeader'
import AboutSection from '../components/AboutSection'
import ProfileActions from '../components/ProfileActions'
import ExperienceSection from '../components/ExperienceSection'
import ProfessionalJourney from '../components/ProfessionalJourney'
import EducationSection from '../components/EducationSection'
import ActivitySection from '../components/ProfileActivity'
import InterestsSection from '../components/Interest'
import SkillsSection from '../components/SkillSection'
// old code: import ProfileService from '../../../services/profile.service'
// ✅ new code: use Redux hook
import { useProfile } from '../../../store/hooks/useProfile'
import { useRoute, RouteProp } from '@react-navigation/native'
import AuthService, { api } from '../../../services/auth.service'
import { FeedService } from '../../../services/feed.service'
import AnalyticsDashboard from '../components/Analytics'
//     const userid="user123";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const routeUserId = route.params?.userId;
  const currentUser = AuthService.getCurrentUser();
  const currentUserId = currentUser?.userId || (currentUser as any)?.id || (currentUser as any)?._id;
  const isOwnProfile = !routeUserId || routeUserId === currentUserId;

  const { 
    profile: ownProfile, 
    loading: ownLoading, 
    error: ownError, 
    fetchProfile: fetchOwnProfile,
    profilePhotos,
    coverPhotos,
    fetchAllProfilePhotos,
    fetchAllCovers
  } = useProfile();
  
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [otherLoading, setOtherLoading] = useState(false);
  const [otherError, setOtherError] = useState<string | null>(null);
  const [otherPosts, setOtherPosts] = useState<any[]>([]);

  const fetchOtherProfile = async () => {
    if (!routeUserId) return;
    setOtherLoading(true);
    try {
      console.log('👤 [OTHER_PROFILE] Fetching full profile for userId:', routeUserId);

      // ── Parallel fetch: auth info + all profile sub-data ──
      const [
        authRes,
        profilePhotosRes,
        coverPhotosRes,
        experienceRes,
        educationRes,
        headlineRes,
        aboutRes,
        skillsRes,
        postsRes,
        connectionRes,
        outgoingReqsRes,
        incomingReqsRes,
        followCountsRes,
        followersListRes,
        connCountRes,
      ] = await Promise.allSettled([
        api.get(`/api/v1/auth/get-user/${routeUserId}`),
        api.get(`/api/v1/profile/profile-photo/get-all-photos/${routeUserId}`).catch(() => api.get(`/api/v1/profile/profile-photo/user/${routeUserId}/active`)),
        api.get(`/api/v1/profile/cover/user/${routeUserId}/active`).catch(() => api.get(`/api/v1/profile/cover/get-all-covers/${routeUserId}`)),
        api.get(`/api/v1/profile/experience/get-all-experiences/${routeUserId}`).catch(() => api.get(`/api/v1/profile/experience/user/${routeUserId}`)),
        api.get(`/api/v1/profile/education/get-all-education/${routeUserId}`).catch(() => api.get(`/api/v1/profile/education/user/${routeUserId}`)),
        api.get(`/api/v1/profile/headlines/get-all-headlines/${routeUserId}`).catch(() => api.get(`/api/v1/profile/headlines/user/${routeUserId}`)),
        api.get(`/api/v1/profile/about/get-all-about/${routeUserId}`).catch(() => api.get(`/api/v1/profile/about/user/${routeUserId}`)),
        api.get(`/api/v1/profile/skills/get-all-skills/${routeUserId}`).catch(() => api.get(`/api/v1/profile/skills/user/${routeUserId}`)),
        AuthService.getPostsByUserId(routeUserId),
        api.get(`/api/v1/connections/connection/user/${currentUserId}`),
        api.get(`/api/v1/connections/requests/user/${currentUserId}/outgoing`),
        api.get(`/api/v1/connections/requests/user/${currentUserId}/incoming`),
        api.get(`/api/v1/connections/follow/counts/${routeUserId}`).catch(() => null),
        api.get(`/api/v1/connections/follow/followers/${routeUserId}`).catch(() => null),
        api.get(`/api/v1/connections/connection/user/${routeUserId}/count`).catch(() => null),
      ]);

      // ── Auth-level base data unpacking ──
      const rawAuth = authRes.status === 'fulfilled'
        ? (authRes.value.data?.data || authRes.value.data)
        : null;

      const cachedUser: any = FeedService.getUserFromCache(routeUserId) || {};
      const rawUser = rawAuth?.user || rawAuth?.account || (rawAuth?.data?.user ? rawAuth.data.user : rawAuth) || {};
      const rawProfileObj = rawAuth?.profile || (rawAuth?.data?.profile ? rawAuth.data.profile : {}) || {};
      
      const mergedUser: any = {
        ...cachedUser,
        ...rawProfileObj,
        ...rawUser,
        ...(typeof rawAuth === 'object' ? rawAuth : {}),
      };

      // ── Profile Photo (active one) ──
      let profileImage: string | undefined;
      if (profilePhotosRes.status === 'fulfilled' && profilePhotosRes.value?.data) {
        let photosData = profilePhotosRes.value.data?.data || profilePhotosRes.value.data || [];
        let photosArray = Array.isArray(photosData) ? photosData : photosData.photos || (photosData.url || photosData.cloudinarySecureUrl ? [photosData] : []);
        const activePhoto = Array.isArray(photosArray)
          ? photosArray.find((p: any) => (p.isActive || p.active) && (!p.userId || p.userId === routeUserId)) ||
            photosArray.find((p: any) => !p.userId || p.userId === routeUserId) || photosArray[0]
          : null;
        profileImage = activePhoto?.cloudinarySecureUrl || activePhoto?.cloudinaryUrl || activePhoto?.url || activePhoto?.imageUrl || activePhoto?.photoUrl;
      }
      if (!profileImage) {
        profileImage = mergedUser.profileImage || mergedUser.avatar || mergedUser.profilePhoto || mergedUser.imageUrl || mergedUser.photoUrl || mergedUser.onboarding?.profileImage || rawUser.profileImage || rawUser.avatar || rawProfileObj.profileImage;
      }
      if (!profileImage) {
        profileImage = cachedUser?.avatar || (cachedUser as any)?.profileImage;
      }

      // ── Cover Photo (active one) ──
      let coverImage: string | undefined;
      if (coverPhotosRes.status === 'fulfilled' && coverPhotosRes.value?.data) {
        let coversData = coverPhotosRes.value.data?.data || coverPhotosRes.value.data || [];
        let coversArray = Array.isArray(coversData) ? coversData : coversData.covers || (coversData.url || coversData.cloudinarySecureUrl ? [coversData] : []);
        const activeCover = Array.isArray(coversArray)
          ? coversArray.find((c: any) => (c.isActive || c.active) && (!c.userId || c.userId === routeUserId)) ||
            coversArray.find((c: any) => !c.userId || c.userId === routeUserId) || coversArray[0]
          : null;
        coverImage = activeCover?.cloudinarySecureUrl || activeCover?.cloudinaryUrl || activeCover?.url || activeCover?.imageUrl || activeCover?.coverUrl;
      }
      if (!coverImage) {
        coverImage = mergedUser.coverImage || mergedUser.banner || mergedUser.coverPhoto || mergedUser.bannerImage || mergedUser.onboarding?.coverImage || rawUser.coverImage || rawProfileObj.coverImage;
      }

      // ── Experience List ──
      let experienceList: any[] = [];
      if (experienceRes.status === 'fulfilled' && experienceRes.value?.data) {
        const expData = experienceRes.value.data?.data || experienceRes.value.data || [];
        experienceList = Array.isArray(expData) ? expData : (expData?.experiences || expData?.experienceList || []);
      }
      if (experienceList.length === 0) {
        const fallbackExp = mergedUser.experienceList || mergedUser.experiences || rawProfileObj.experienceList || rawProfileObj.experiences || rawUser.experienceList || rawUser.experiences;
        if (Array.isArray(fallbackExp)) {
          experienceList = fallbackExp;
        }
      }

      // ── Education List ──
      let educationList: any[] = [];
      if (educationRes.status === 'fulfilled' && educationRes.value?.data) {
        const eduData = educationRes.value.data?.data || educationRes.value.data || [];
        educationList = Array.isArray(eduData) ? eduData : (eduData?.educationList || eduData?.educations || eduData?.education || []);
      }
      if (educationList.length === 0) {
        const fallbackEdu = mergedUser.educationList || mergedUser.educations || mergedUser.education || rawProfileObj.educationList || rawProfileObj.educations || rawUser.educationList || rawUser.educations;
        if (Array.isArray(fallbackEdu)) {
          educationList = fallbackEdu;
        }
      }

      // ── Helper to validate professional headline strings ──
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

      // ── Headline ──
      let headline: string | undefined;
      if (headlineRes.status === 'fulfilled' && headlineRes.value?.data) {
        const hlData = headlineRes.value.data?.data || headlineRes.value.data;
        let activeHl = Array.isArray(hlData)
          ? hlData.find((h: any) => (h.isActive || h.active) && (!h.userId || h.userId === routeUserId)) ||
            hlData.find((h: any) => !h.userId || h.userId === routeUserId) || hlData[0]
          : hlData;
        const realHeadline = activeHl?.headline || activeHl;
        const candidateTitle = realHeadline?.title || realHeadline?.headlineText || realHeadline?.text || (typeof realHeadline === 'string' ? realHeadline : undefined);
        if (isValidHeadline(candidateTitle)) {
          headline = candidateTitle.trim();
        }
      }
      if (!headline) {
        const rawHl = mergedUser.headline || rawProfileObj.headline || mergedUser.onboarding?.headline || mergedUser.onboarding?.professionalHeadline;
        if (typeof rawHl === 'string' && isValidHeadline(rawHl)) {
          headline = rawHl.trim();
        } else if (typeof rawHl === 'object' && rawHl !== null) {
          const rawTitle = (rawHl as any).title || (rawHl as any).headlineText || (rawHl as any).text;
          if (isValidHeadline(rawTitle)) headline = rawTitle.trim();
        }
      }
      if (!headline) {
        const wp = mergedUser.workingProfile || mergedUser.onboarding?.workingProfile;
        if (wp?.jobTitle) {
          headline = wp.companyName ? `${wp.jobTitle} at ${wp.companyName}` : wp.jobTitle;
        }
      }
      if (!headline) {
        const sp = mergedUser.studentProfile || mergedUser.onboarding?.studentProfile;
        if (sp?.degree) {
          headline = sp.collegeName ? `${sp.degree} Student at ${sp.collegeName}` : `${sp.degree} Student`;
        }
      }
      if (!headline && Array.isArray(experienceList) && experienceList.length > 0) {
        const exp = experienceList.find((e: any) => e.currentlyWorking || e.current) || experienceList[0];
        if (exp?.currentPosition || exp?.position) {
          const pos = exp.currentPosition || exp.position;
          const comp = exp.companyName || exp.company;
          headline = comp ? `${pos} at ${comp}` : pos;
        }
      }
      if (!headline && isValidHeadline(mergedUser.bio || mergedUser.about)) {
        headline = (mergedUser.bio || mergedUser.about).trim();
      }
      if (!headline && isValidHeadline(mergedUser.role)) {
        headline = mergedUser.role.trim();
      }

      // ── About ──
      let about: string | undefined;
      let aboutId: string | undefined;
      let introVideoUrl: string | undefined;
      if (aboutRes.status === 'fulfilled' && aboutRes.value?.data) {
        const aboutData = aboutRes.value.data?.data || aboutRes.value.data;
        const aboutItem = Array.isArray(aboutData)
          ? aboutData.find((a: any) => (a.isActive || a.active) && (!a.userId || a.userId === routeUserId)) ||
            aboutData.find((a: any) => !a.userId || a.userId === routeUserId) || aboutData[0]
          : aboutData;
        const realAbout = aboutItem?.about || aboutItem;
        about = realAbout?.aboutText || realAbout?.text || (typeof realAbout === 'string' ? realAbout : undefined);
        aboutId = realAbout?.aboutId || realAbout?._id || realAbout?.id;
        introVideoUrl = realAbout?.coverStory?.videoUrl || realAbout?.videoUrl || realAbout?.introVideoUrl;
      }
      if (!about) {
        const rawAbout = mergedUser.about || rawProfileObj.about || mergedUser.bio || rawProfileObj.bio || mergedUser.onboarding?.about;
        if (typeof rawAbout === 'string') {
          about = rawAbout;
        } else if (typeof rawAbout === 'object' && rawAbout !== null) {
          about = (rawAbout as any).aboutText || (rawAbout as any).text || (rawAbout as any).description || undefined;
          aboutId = (rawAbout as any).aboutId || (rawAbout as any)._id || (rawAbout as any).id;
          introVideoUrl = (rawAbout as any).coverStory?.videoUrl || (rawAbout as any).videoUrl || (rawAbout as any).introVideoUrl;
        }
      }

      // ── Skills ──
      let skillsList: any[] = [];
      if (skillsRes.status === 'fulfilled' && skillsRes.value?.data) {
        const skillsData = skillsRes.value.data?.data || skillsRes.value.data || [];
        skillsList = Array.isArray(skillsData) ? skillsData : (skillsData?.skillsList || skillsData?.skills || []);
      }
      if (skillsList.length === 0) {
        const fallbackSkills = mergedUser.skillsList || mergedUser.skills || rawProfileObj.skillsList || rawProfileObj.skills || rawUser.skillsList || rawUser.skills;
        if (Array.isArray(fallbackSkills)) {
          skillsList = fallbackSkills;
        }
      }

      // ── Posts ──
      if (postsRes.status === 'fulfilled') {
        const postsData = postsRes.value;
        const posts = postsData?.data?.posts || postsData?.posts || [];
        setOtherPosts(posts);
      }

      let connectionStatus = 'none';
      if (connectionRes.status === 'fulfilled') {
        const connectionsPayload = connectionRes.value.data?.data || connectionRes.value.data || [];
        const connectionsArray = Array.isArray(connectionsPayload) 
          ? connectionsPayload 
          : (Array.isArray(connectionsPayload?.data) ? connectionsPayload.data : []);
        
        const existingConn = connectionsArray.find((conn: any) => 
          conn.userId === routeUserId || conn.user === routeUserId || conn.connectedUserId === routeUserId || conn.user1 === routeUserId || conn.user2 === routeUserId || conn._id === routeUserId || conn.fromUserId === routeUserId || conn.toUserId === routeUserId
        );
        if (existingConn) {
          connectionStatus = existingConn.status || 'active'; // Default to active if field missing just in case
        }
      }

      let connectionRequestId: string | undefined;

      if (connectionStatus === 'none') {
        if (outgoingReqsRes.status === 'fulfilled') {
          const outPayload = outgoingReqsRes.value.data?.data || outgoingReqsRes.value.data || [];
          const outArray = Array.isArray(outPayload) ? outPayload : (Array.isArray(outPayload?.data) ? outPayload.data : []);
          const pendingReq = outArray.find((req: any) => 
            (req.status === 'pending' || req.status === undefined) && (req.receiver === routeUserId || req.receiverId === routeUserId || req.toUserId === routeUserId || (req.receiver && req.receiver._id === routeUserId) || req.toUserId?.userId === routeUserId || req.toUserId?._id === routeUserId)
          );
          if (pendingReq) {
             connectionStatus = 'pending';
             connectionRequestId = pendingReq.requestId || pendingReq._id || pendingReq.id;
          }
        }

        if (connectionStatus === 'none' && incomingReqsRes.status === 'fulfilled') {
          const inPayload = incomingReqsRes.value.data?.data || incomingReqsRes.value.data || [];
          const inArray = Array.isArray(inPayload) ? inPayload : (Array.isArray(inPayload?.data) ? inPayload.data : []);
          const incomingReq = inArray.find((req: any) => {
            const senderId = req.fromUserId?.userId || req.fromUserId?._id || req.fromUserId?.id || req.fromUserId;
            return (req.status === 'pending' || req.status === undefined) && senderId === routeUserId;
          });
          if (incomingReq) {
             connectionStatus = 'incoming';
             connectionRequestId = incomingReq.requestId || incomingReq._id || incomingReq.id;
          }
        }
      }

      const firstName = typeof mergedUser.firstName === 'string' && mergedUser.firstName
        ? mergedUser.firstName
        : (typeof mergedUser.onboarding?.firstName === 'string' && mergedUser.onboarding.firstName
          ? mergedUser.onboarding.firstName
          : (typeof mergedUser.name === 'string' && mergedUser.name ? mergedUser.name.split(' ')[0] : ''));

      const lastName = typeof mergedUser.lastName === 'string' && mergedUser.lastName
        ? mergedUser.lastName
        : (typeof mergedUser.onboarding?.lastName === 'string' && mergedUser.onboarding.lastName
          ? mergedUser.onboarding.lastName
          : (typeof mergedUser.name === 'string' && mergedUser.name ? mergedUser.name.split(' ').slice(1).join(' ') : ''));

      let followersCount: number | undefined;
      if (followCountsRes?.status === 'fulfilled' && followCountsRes.value?.data) {
        const fc = followCountsRes.value.data?.data || followCountsRes.value.data;
        if (typeof fc.followers === 'number') followersCount = fc.followers;
        else if (typeof fc.followersCount === 'number') followersCount = fc.followersCount;
        else if (typeof fc.followerCount === 'number') followersCount = fc.followerCount;
        else if (typeof fc.count === 'number') followersCount = fc.count;
        else if (Array.isArray(fc.followers)) followersCount = fc.followers.length;
      }
      if ((followersCount === undefined || followersCount === 0) && followersListRes?.status === 'fulfilled' && followersListRes.value?.data) {
        const fList = followersListRes.value.data?.data || followersListRes.value.data;
        const arr = Array.isArray(fList) ? fList : (Array.isArray(fList?.followers) ? fList.followers : (Array.isArray(fList?.data) ? fList.data : []));
        if (arr.length > 0) followersCount = arr.length;
      }
      if (followersCount === undefined && typeof mergedUser.followersCount === 'number') {
        followersCount = mergedUser.followersCount;
      } else if (followersCount === undefined && typeof mergedUser.followers === 'number') {
        followersCount = mergedUser.followers;
      }

      let connectionsCount: string | number | undefined;
      if (connCountRes?.status === 'fulfilled' && connCountRes.value?.data) {
        const cc = connCountRes.value.data?.data || connCountRes.value.data;
        if (typeof cc.count === 'number') connectionsCount = cc.count;
        else if (typeof cc.totalCount === 'number') connectionsCount = cc.totalCount;
        else if (typeof cc.total === 'number') connectionsCount = cc.total;
      }

      // ── Assemble full profile object ──
      const assembledProfile = {
        userId: mergedUser.userId || mergedUser._id || mergedUser.id || routeUserId,
        firstName,
        lastName,
        username: mergedUser.username || mergedUser.name || '',
        location: typeof mergedUser.location === 'string' ? mergedUser.location : (typeof mergedUser.onboarding?.location === 'string' ? mergedUser.onboarding.location : ''),
        profileImage: typeof profileImage === 'string' ? profileImage : undefined,
        coverImage: typeof coverImage === 'string' ? coverImage : undefined,
        headline,
        about,
        aboutId,
        introVideoUrl,
        experienceList,
        educationList,
        skillsList,
        followers: followersCount,
        connections: connectionsCount !== undefined ? String(connectionsCount) : undefined,
        connectionStatus,
        connectionRequestId,
      };

      console.log('✅ [OTHER_PROFILE] Assembled profile:', JSON.stringify({
        name: `${assembledProfile.firstName} ${assembledProfile.lastName}`,
        hasPhoto: !!profileImage,
        hasCover: !!coverImage,
        expCount: experienceList.length,
        eduCount: educationList.length,
      }));

      setOtherProfile(assembledProfile);
      setOtherError(null);
      
      // ✅ Record profile view
      try {
        await AuthService.recordProfileView(routeUserId);
      } catch (viewErr) {
        console.log('Silently failed to record profile view:', viewErr);
      }
    } catch (e: any) {
      console.error('❌ [OTHER_PROFILE] Failed:', e.message);
      setOtherError(e.message || 'Failed to fetch profile');
    } finally {
      setOtherLoading(false);
    }
  };


  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    if (isOwnProfile) {
      await Promise.all([
        fetchOwnProfile(),
        fetchAllProfilePhotos(),
        fetchAllCovers()
      ]);
    } else {
      await fetchOtherProfile();
    }
    setRefreshing(false);
  }
  
  useEffect(() => {
    if (isOwnProfile) {
      fetchOwnProfile();
      fetchAllProfilePhotos();
      fetchAllCovers();
    } else {
      setOtherProfile(null);
      setOtherError(null);
      setOtherPosts([]);
      fetchOtherProfile();
    }
  }, [routeUserId, isOwnProfile]);

  useFocusEffect(
    useCallback(() => {
      if (isOwnProfile) {
        fetchOwnProfile();
      } else {
        fetchOtherProfile();
      }
    }, [isOwnProfile, routeUserId])
  );

  const rawProfile = isOwnProfile ? ownProfile : otherProfile;
  const loading = isOwnProfile ? ownLoading : otherLoading;
  const error = isOwnProfile ? ownError : otherError;
  const fetchProfile = isOwnProfile ? fetchOwnProfile : fetchOtherProfile;

  // Add fallback for profile images
  let finalProfileImage = rawProfile?.profileImage || rawProfile?.onboarding?.profileImage || rawProfile?.avatar || rawProfile?.profilePhoto || rawProfile?.imageUrl || rawProfile?.photoUrl;
  let finalCoverImage = rawProfile?.coverImage || rawProfile?.onboarding?.coverImage || rawProfile?.banner || rawProfile?.coverPhoto || rawProfile?.bannerImage;

  if (isOwnProfile) {
    if (profilePhotos && profilePhotos.length > 0) {
      const activePhoto = profilePhotos.find((p: any) => p.isActive || p.active) || profilePhotos[0];
      if (activePhoto) {
        const found = activePhoto.cloudinarySecureUrl || activePhoto.cloudinaryUrl || activePhoto.url || activePhoto.imageUrl || activePhoto.photoUrl;
        if (found) finalProfileImage = found;
      }
    }
    if (coverPhotos && coverPhotos.length > 0) {
      const activeCover = coverPhotos.find((c: any) => c.isActive || c.active) || coverPhotos[0];
      if (activeCover) {
        const found = activeCover.cloudinarySecureUrl || activeCover.cloudinaryUrl || activeCover.url || activeCover.imageUrl || activeCover.coverUrl;
        if (found) finalCoverImage = found;
      }
    }
  }

  // Extract headline string with all fallbacks
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

  let finalHeadline = rawProfile?.headline;
  if (typeof finalHeadline === 'object' && finalHeadline !== null) {
    finalHeadline = (finalHeadline as any).title || (finalHeadline as any).headlineText || (finalHeadline as any).text;
  }
  if (!isValidHeadline(finalHeadline)) {
    finalHeadline = undefined;
  }
  if (!finalHeadline) {
    const obHl = rawProfile?.onboarding?.headline || rawProfile?.onboarding?.professionalHeadline;
    if (isValidHeadline(obHl)) finalHeadline = obHl.trim();
  }
  if (!finalHeadline) {
    const wp = rawProfile?.onboarding?.workingProfile || rawProfile?.workingProfile;
    if (wp?.jobTitle) {
      finalHeadline = wp.companyName ? `${wp.jobTitle} at ${wp.companyName}` : wp.jobTitle;
    }
  }
  if (!finalHeadline) {
    const sp = rawProfile?.onboarding?.studentProfile || rawProfile?.studentProfile;
    if (sp?.degree) {
      finalHeadline = sp.collegeName ? `${sp.degree} Student at ${sp.collegeName}` : `${sp.degree} Student`;
    }
  }
  if (!finalHeadline && Array.isArray(rawProfile?.experienceList) && rawProfile.experienceList.length > 0) {
    const exp = rawProfile.experienceList.find((e: any) => e.currentlyWorking || e.current) || rawProfile.experienceList[0];
    if (exp?.currentPosition || exp?.position) {
      const pos = exp.currentPosition || exp.position;
      const comp = exp.companyName || exp.company;
      finalHeadline = comp ? `${pos} at ${comp}` : pos;
    }
  }
  if (!finalHeadline && isValidHeadline(rawProfile?.bio || rawProfile?.about)) {
    finalHeadline = (rawProfile.bio || rawProfile.about).trim();
  }
  if (!finalHeadline && isValidHeadline(rawProfile?.role)) {
    finalHeadline = rawProfile.role.trim();
  }

  const profile = rawProfile ? {
    ...rawProfile,
    profileImage: finalProfileImage,
    coverImage: finalCoverImage,
    headline: finalHeadline,
  } : null;


  // --- Delay heavy render to prevent navigation lag ---
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
    const timer = setTimeout(() => setIsReady(true), 250);
    return () => {
      handle.cancel();
      clearTimeout(timer);
    };
  }, []);
  // ----------------------------------------------------------------
  // ----------------------------------------------------------------

  // ── Loading State ──
  if (loading && !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#fcfcfc]">
        <ActivityIndicator size="large" color="#4a3728" />
        <Text style={{ marginTop: 12, color: '#4a3728', fontWeight: '600' }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // ── Error State ──
  // Only show the full screen error if we have NO profile data to show
  if (error && !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#fcfcfc]">
        <Text style={{ color: 'red', fontSize: 14 }}>❌ {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fcfcfc]">

    <ScrollView 
    refreshControl={
      <RefreshControl 
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#4a3728']}
      tintColor="#4a3728"
    /> }
    >
    <View>
      {/* old code:
      <ProfileBanner />
      */}
      <ProfileBanner 
        bannerImage={profile?.coverImage} 
        onDataRefresh={fetchProfile}
        isOwnProfile={isOwnProfile}
      />

      {/* old code: <ProfileHeader/> */}
      {/* ✅ new code: pass backend data as props */}
      <ProfileHeader
        name={profile?.firstName || profile?.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : (profile?.username || undefined)}
        firstName={profile?.firstName}
        lastName={profile?.lastName}
        location={typeof profile?.location === 'string' ? profile.location : ''}
        headline={typeof profile?.headline === 'string' ? profile.headline : undefined}
        profileImage={profile?.profileImage}
        educationList={profile?.educationList}
        experienceList={profile?.experienceList}
        followers={profile?.followers}
        connections={profile?.connections}
        onDataRefresh={fetchProfile}
        isOwnProfile={isOwnProfile}
        connectionStatus={profile?.connectionStatus}
        currentUserId={currentUserId}
        profileUserId={profile?.userId || profile?._id || profile?.id || routeUserId || currentUserId}
      />

      {isOwnProfile ? (
        <ProfileActions 
          userName={profile?.firstName || profile?.username || 'You'} 
        />
      ) : (
        <View className="flex-row items-center justify-between px-5 py-4 bg-[#f6ede8]/80 rounded-2xl mx-3 mb-8 border border-[#e0d8cf]/50 shadow-lg shadow-black/90 elevation-2xl">
           {(!profile?.connectionStatus || profile?.connectionStatus === 'none') && (
             <TouchableOpacity 
               className="bg-[#4a3728] rounded-xl px-6 py-3 flex-1 mr-2 items-center justify-center"
               activeOpacity={0.8}
               onPress={async () => {
                 try {
                   const { ConnectionService } = require('../../../services/connection.service');
                   // 1. Send connection request
                   const res = await ConnectionService.sendRequest(routeUserId);
                   // 2. Automatically follow the user (silently handle errors)
                   try {
                     await AuthService.followUser(routeUserId);
                   } catch (followError) {
                     console.log('Follow user failed silently:', followError);
                   }
                   
                   const newRequestId = res?.data?.requestId || res?.data?.data?.requestId || res?.requestId || res?.data?._id;
                   
                   // Optimistically update the UI to pending
                   setOtherProfile((prev: any) => ({ ...prev, connectionStatus: 'pending', connectionRequestId: newRequestId }));
                   ConnectionService.addPending(routeUserId);
                   
                   require('react-native').Alert.alert('Success', 'Connection request sent.');
                 } catch (error: any) {
                   if (error?.message?.includes('already exists')) {
                     const { ConnectionService } = require('../../../services/connection.service');
                     ConnectionService.addPending(routeUserId);
                     setOtherProfile((prev: any) => ({ ...prev, connectionStatus: 'pending' }));
                     require('react-native').Alert.alert('Info', 'Connection request already exists.');
                   } else {
                     require('react-native').Alert.alert('Error', error?.message || 'Failed to send connection request.');
                   }
                 }
               }}
             >
               <Text className="text-[#f6ede8] font-bold text-sm">Connect</Text>
             </TouchableOpacity>
           )}
           {profile?.connectionStatus === 'pending' && (
             <TouchableOpacity 
               className="bg-[#8b6f47] rounded-xl px-6 py-3 flex-1 mr-2 items-center justify-center opacity-70"
               activeOpacity={0.8}
               onPress={() => {
                 require('react-native').Alert.alert(
                   'Withdraw Invitation',
                   'Are you sure you want to withdraw your connection request?',
                   [
                     { text: 'Cancel', style: 'cancel' },
                     { 
                       text: 'Withdraw', 
                       style: 'destructive',
                       onPress: async () => {
                         try {
                           console.log('Withdrawing request with ID:', profile?.connectionRequestId);
                           if (!profile?.connectionRequestId) {
                             require('react-native').Alert.alert('Error', 'Request ID is missing. Please refresh the page.');
                             return;
                           }
                           const { ConnectionService } = require('../../../services/connection.service');
                           await ConnectionService.cancelRequest(profile.connectionRequestId);
                           ConnectionService.removePending(routeUserId);
                           ConnectionService.addWithdrawn(routeUserId);
                           
                           setOtherProfile((prev: any) => ({ ...prev, connectionStatus: 'none', connectionRequestId: undefined }));
                           require('react-native').Alert.alert('Success', 'Connection request withdrawn.');
                         } catch (error: any) {
                           console.log('Withdraw failed:', error?.response?.data || error);
                           require('react-native').Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to withdraw request.');
                         }
                       }
                     }
                   ]
                 );
               }}
             >
               <Text className="text-[#f6ede8] font-bold text-sm">Pending</Text>
             </TouchableOpacity>
           )}
           {profile?.connectionStatus === 'incoming' && (
              <>
                <TouchableOpacity 
                  className="bg-[#4a3728] rounded-xl px-5 py-3 flex-1 mr-2 items-center justify-center"
                  activeOpacity={0.8}
                  onPress={async () => {
                    try {
                      if (!profile?.connectionRequestId) {
                        require('react-native').Alert.alert('Error', 'Request ID is missing. Please refresh the page.');
                        return;
                      }
                      const { ConnectionService } = require('../../../services/connection.service');
                      await ConnectionService.acceptRequest(profile.connectionRequestId);
                      ConnectionService.addConnected(routeUserId);
                      
                      setOtherProfile((prev: any) => ({ ...prev, connectionStatus: 'active' }));
                      require('react-native').Alert.alert('Success', 'Connection request accepted.');
                    } catch (error: any) {
                      require('react-native').Alert.alert('Error', 'Failed to accept connection request.');
                    }
                  }}
                >
                  <Text className="text-[#f6ede8] font-bold text-sm">Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-[#8b6f47]/20 border border-[#8b6f47] rounded-xl px-5 py-3 flex-1 items-center justify-center"
                  activeOpacity={0.8}
                  onPress={async () => {
                    try {
                      if (!profile?.connectionRequestId) {
                        require('react-native').Alert.alert('Error', 'Request ID is missing. Please refresh the page.');
                        return;
                      }
                      const { ConnectionService } = require('../../../services/connection.service');
                      await ConnectionService.declineRequest(profile.connectionRequestId);
                      
                      setOtherProfile((prev: any) => ({ ...prev, connectionStatus: 'none', connectionRequestId: undefined }));
                      require('react-native').Alert.alert('Success', 'Connection request ignored.');
                    } catch (error: any) {
                      require('react-native').Alert.alert('Error', 'Failed to ignore connection request.');
                    }
                  }}
                >
                  <Text className="text-[#8b6f47] font-bold text-sm">Ignore</Text>
                </TouchableOpacity>
              </>
            )}
            {profile?.connectionStatus !== 'incoming' && (
              <TouchableOpacity 
                className={`bg-[#4a3728]/10 border border-[#4a3728] rounded-xl px-6 py-3 items-center justify-center flex-1 ${!(profile?.connectionStatus === 'active' || profile?.connectionStatus === 'accepted') ? 'opacity-50' : ''}`}
                activeOpacity={0.8}
                onPress={() => {
                   if (!(profile?.connectionStatus === 'active' || profile?.connectionStatus === 'accepted')) {
                     require('react-native').Alert.alert('Not Connected', 'You are not connected with this person.');
                     return;
                   }
                   const fullName = profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'User';
                   navigation.navigate('Chat', { 
                     userId: routeUserId,
                     userName: fullName,
                     userAvatar: profile?.profileImage,
                     userRole: profile?.headline,
                     isOnline: true 
                   });
                }}
              >
                <Text className="text-[#4a3728] font-bold text-sm">Message</Text>
              </TouchableOpacity>
            )}
        </View>
      )}

      {/* --- OLD CODE: Renders everything immediately, causing navigation lag ---
      <ProfessionalJourney
        userProfileData={profile}
        educationList={profile?.educationList}  
        experienceList={profile?.experienceList}
      />
      <AboutSection
        aboutData={typeof profile?.about === 'string' ? { aboutText: profile.about } : undefined}
        aboutId={typeof profile?.aboutId === 'string' ? profile.aboutId : undefined}
        videoUrl={profile?.introVideoUrl}
      />
      <ExperienceSection
        experienceIds={profile?.experienceIds}
        experienceList={profile?.experienceList}
        onDataRefresh={fetchProfile}
      />
      <EducationSection 
      educationList={profile?.educationList}
      educationIds={profile?.educationIds}
      onDataRefresh={fetchProfile}
      />
      <SkillsSection 
        skillsList={profile?.skillsList || profile?.skillList}
        onDataRefresh={fetchProfile}
      />
      <ActivitySection
        profileImage={profile?.profileImage}
        fullName={profile?.firstName || profile?.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : (profile?.username || undefined)}
        headline={profile?.headline}
        currentUserId={profile?._id || profile?.userId}
      />
      <InterestsSection/>
      ------------------------------------------------------------------------ */}

      {/* --- NEW CODE: Only render heavy sections after navigation animation finishes --- */}
      {isReady ? (
        <>
          <ProfessionalJourney
            userProfileData={profile}
            educationList={profile?.educationList}  
            experienceList={profile?.experienceList}
          />
          <AboutSection
            aboutData={typeof profile?.about === 'string' ? { aboutText: profile.about } : undefined}
            aboutId={typeof profile?.aboutId === 'string' ? profile.aboutId : undefined}
            videoUrl={profile?.introVideoUrl}
            isOwnProfile={isOwnProfile}
          />
          <ExperienceSection
            experienceIds={profile?.experienceIds}
            experienceList={profile?.experienceList}
            onDataRefresh={fetchProfile}
            isOwnProfile={isOwnProfile}
          />
          <EducationSection 
          educationList={profile?.educationList}
          educationIds={profile?.educationIds}
          onDataRefresh={fetchProfile}
          isOwnProfile={isOwnProfile}
          />
          <SkillsSection 
            skillsList={profile?.skillsList || profile?.skillList}
            onDataRefresh={fetchProfile}
            isOwnProfile={isOwnProfile}
          />
          <ActivitySection
            profileImage={profile?.profileImage}
            fullName={profile?.firstName || profile?.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : (profile?.username || undefined)}
            headline={profile?.headline}
            currentUserId={profile?._id || profile?.userId}
            isOwnProfile={isOwnProfile}
            posts={isOwnProfile ? profile?.posts : otherPosts}
          />
          <InterestsSection
            currentUserId={profile?._id || profile?.userId}
            followingCount={profile?.following || 0}
          />
        </>
      ) : (
        <View style={{ height: 400, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#4a3728" />
        </View>
      )}
      {/* ---------------------------------------------------------------------------- */}

      {isOwnProfile && <AnalyticsDashboard userId={currentUserId} />}
    </View>
    </ScrollView>
    </SafeAreaView>
  )
}