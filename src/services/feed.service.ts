// src/services/feed.service.ts
import axios from 'axios';
import { api } from './auth.service';
import {
  FeedResponse,
  ReactionType,
  ReportReason,
  PostReactor,
} from '../features/home/types/feed.types';

export class FeedService {
  // ── In-Memory Cache for Author Data (mirroring website architecture) ──
  private static usersCache: Record<string, any> = {};
  private static photosCache: Record<string, string> = {};
  private static headlinesCache: Record<string, string> = {};

  /**
   * Bulk enrich feed posts with real author details (real names, profile photos, headlines)
   * Exactly matching website logic in throne8_client_main (useAllUsersPosts & transformApiPostToFeedPost)
   * with guaranteed per-user fallback via /api/v1/auth/get-user/:id
   */
  static async enrichPostsWithAuthorData(posts: any[]): Promise<any[]> {
    if (!Array.isArray(posts) || posts.length === 0) return posts;

    // 1. Gather all unique author user IDs
    const uniqueUserIds = Array.from(
      new Set(
        posts
          .flatMap((p: any) => [
            p.userId,
            p.authorId,
            p.currentUserId,
            p.repostedBy,
            p.author?._id || p.author?.id || p.author?.userId,
            p.user?._id || p.user?.id || p.user?.userId,
            p.originalPost?.userId,
            p.originalPost?.authorId,
            p.originalPost?.author?._id || p.originalPost?.author?.id || p.originalPost?.author?.userId,
            p.originalPost?.user?._id || p.originalPost?.user?.id || p.originalPost?.user?.userId,
          ])
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      )
    );

    // 2. Fetch missing users in bulk
    const idsToFetch = uniqueUserIds.filter((id) => !this.usersCache[id]);
    if (idsToFetch.length > 0) {
      try {
        const { data } = await api.post('/api/v1/auth/get-users-bulk', { userIds: idsToFetch });
        const usersList = data?.data?.users || data?.users || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
        if (Array.isArray(usersList)) {
          usersList.forEach((u: any) => {
            const uid = u.userId || u.id || u._id;
            if (uid) {
              this.usersCache[uid] = u;
              if (u.userId) this.usersCache[u.userId] = u;
              if (u.id) this.usersCache[u.id] = u;
              if (u._id) this.usersCache[u._id] = u;
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ [FEED_SERVICE] Bulk users fetch failed:', err);
      }
    }

    // 2b. Guaranteed Fallback: Fetch any users still missing or without name via GET /api/v1/auth/get-user/:id
    const stillMissingIds = uniqueUserIds.filter(
      (id) => !this.usersCache[id] || (!this.usersCache[id].firstName && !this.usersCache[id].username && !this.usersCache[id].name)
    );
    if (stillMissingIds.length > 0) {
      await Promise.allSettled(
        stillMissingIds.map(async (uid) => {
          try {
            const { data } = await api.get(`/api/v1/auth/get-user/${uid}`);
            const raw = data?.data || data?.user || data;
            if (raw) {
              const u = raw.user || raw.account || raw;
              const p = raw.profile || {};
              const merged = { ...u, ...p, userId: uid };
              if (merged.firstName || merged.lastName || merged.username || merged.name) {
                this.usersCache[uid] = merged;
                if (merged.userId) this.usersCache[merged.userId] = merged;
                if (merged._id) this.usersCache[merged._id] = merged;
                if (merged.profileImage && (merged.profilePhotoId || uid)) {
                  this.photosCache[merged.profilePhotoId || uid] = merged.profileImage;
                }
                if (merged.headline && (merged.headlineId || uid)) {
                  this.headlinesCache[merged.headlineId || uid] = merged.headline;
                }
              }
            }
          } catch (e) {
            // Non-critical: Individual user fetch failed
          }
        })
      );
    }

    // 3. Fetch missing profile photos in bulk
    const photoIdsToFetch = uniqueUserIds
      .map((id) => this.usersCache[id]?.profilePhotoId)
      .filter((pid): pid is string => Boolean(pid) && !this.photosCache[pid]);

    if (photoIdsToFetch.length > 0) {
      try {
        const { data } = await api.post('/api/v1/profile/profile-photo/get-multiple-photos', {
          photoIds: photoIdsToFetch,
        });
        const photosList = data?.data?.photos || data?.photos || [];
        if (Array.isArray(photosList)) {
          photosList.forEach((photo: any) => {
            if (photo.photoId && photo.cloudinarySecureUrl) {
              this.photosCache[photo.photoId] = photo.cloudinarySecureUrl;
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ [FEED_SERVICE] Bulk profile photos fetch failed:', err);
      }
    }

    // 4. Fetch missing headlines in bulk
    const headlineIdsToFetch = uniqueUserIds
      .map((id) => this.usersCache[id]?.headlineId)
      .filter((hid): hid is string => Boolean(hid) && !this.headlinesCache[hid]);

    if (headlineIdsToFetch.length > 0) {
      try {
        const { data } = await api.post('/api/v1/profile/headlines/get-multiple-headlines', {
          headlineIds: headlineIdsToFetch,
        });
        const headlinesList = data?.data?.headlines || data?.headlines || [];
        if (Array.isArray(headlinesList)) {
          headlinesList.forEach((hl: any) => {
            if (hl.headlineId && hl.title) {
              this.headlinesCache[hl.headlineId] = hl.title;
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ [FEED_SERVICE] Bulk headlines fetch failed:', err);
      }
    }

    // 5. Enrich all posts with real names, usernames, avatars, and roles
    return posts.map((p) => {
      const authorUserId =
        p.userId ||
        p.authorId ||
        p.currentUserId ||
        p.author?._id ||
        p.author?.id ||
        p.author?.userId ||
        p.user?._id ||
        p.user?.id ||
        p.user?.userId;
      const userData = authorUserId ? this.usersCache[authorUserId] : null;

      const profilePhoto = userData?.profilePhotoId
        ? this.photosCache[userData.profilePhotoId]
        : (this.photosCache[authorUserId] || userData?.profileImage || userData?.profilePhotoUrl || userData?.avatar);

      const headlineText = userData?.headlineId
        ? this.headlinesCache[userData.headlineId]
        : (this.headlinesCache[authorUserId] || userData?.headline);

      // Resolve author full name exactly like transformApiPostToFeedPost in throne8_client_main
      const resolvedName =
        (userData && (userData.firstName || userData.lastName)
          ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
          : '') ||
        userData?.username ||
        userData?.name ||
        (typeof p.author === 'object' && p.author
          ? `${p.author.firstName || ''} ${p.author.lastName || ''}`.trim() || p.author.username || p.author.name
          : '') ||
        (typeof p.user === 'object' && p.user
          ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() || p.user.username || p.user.name
          : '') ||
        p.authorName ||
        p.fullName ||
        p.userName ||
        p.username ||
        (typeof p.user === 'string' && p.user !== 'Unknown User' && p.user !== 'Throne8 User' ? p.user : '') ||
        (typeof p.author === 'string' && p.author !== 'Unknown User' && p.author !== 'Throne8 User' ? p.author : '') ||
        (p.firstName || p.lastName ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : '') ||
        p.name ||
        'Throne8 User';

      const resolvedUsername =
        userData?.username ||
        p.username ||
        p.userName ||
        (typeof p.author === 'object' ? p.author?.username : '') ||
        (typeof p.user === 'object' ? p.user?.username : '') ||
        '';

      const resolvedAvatar =
        profilePhoto ||
        userData?.profilePhotoUrl ||
        userData?.profileImage ||
        userData?.avatar ||
        p.authorAvatar ||
        p.avatar ||
        (typeof p.author === 'object' ? p.author?.profilePhotoUrl : '') ||
        (typeof p.user === 'object' ? p.user?.profilePhotoUrl : '') ||
        '';

      const resolvedHeadline =
        headlineText ||
        userData?.headline ||
        p.authorHeadline ||
        p.role ||
        p.headline ||
        (typeof p.author === 'object' ? p.author?.headline : '') ||
        (typeof p.user === 'object' ? p.user?.headline : '') ||
        '';

      // Also enrich originalPost if this is a repost
      let updatedOriginalPost = p.originalPost;
      if (p.feedItemType === 'repost' && p.originalPost) {
        const op = p.originalPost;
        const opUserId = op.userId || op.authorId;
        const opUserData = opUserId ? this.usersCache[opUserId] : null;
        const opPhoto = opUserData?.profilePhotoId ? this.photosCache[opUserData.profilePhotoId] : null;
        const opHeadline = opUserData?.headlineId ? this.headlinesCache[opUserData.headlineId] : null;

        const opResolvedName =
          (opUserData && (opUserData.firstName || opUserData.lastName)
            ? `${opUserData.firstName || ''} ${opUserData.lastName || ''}`.trim()
            : '') ||
          opUserData?.username ||
          op.authorName ||
          op.userName ||
          op.fullName ||
          (typeof op.user === 'string' && op.user !== 'Unknown User' && op.user !== 'Throne8 User' ? op.user : '') ||
          'Throne8 User';

        updatedOriginalPost = {
          ...op,
          user: opResolvedName,
          authorName: opResolvedName,
          username: opUserData?.username || op.username || op.userName || '',
          avatar: opPhoto || opUserData?.profilePhotoUrl || opUserData?.profileImage || op.authorAvatar || op.avatar || '',
          authorAvatar: opPhoto || opUserData?.profilePhotoUrl || opUserData?.profileImage || op.authorAvatar || op.avatar || '',
          role: opHeadline || opUserData?.headline || op.authorHeadline || op.role || '',
          authorHeadline: opHeadline || opUserData?.headline || op.authorHeadline || op.role || '',
        };
      }

      const pollValid = Boolean(
        p.pollData &&
        typeof p.pollData.question === 'string' &&
        p.pollData.question.trim().length > 0 &&
        Array.isArray(p.pollData.options) &&
        p.pollData.options.length >= 2
      );

      const eventTitle = p.eventData?.eventName || p.eventData?.title;
      const eventValid = Boolean(
        p.eventData &&
        typeof eventTitle === 'string' &&
        eventTitle.trim().length > 0 &&
        Boolean(p.eventData.startDate || p.eventData.eventDate || p.eventData.registrationLink || p.eventData.location)
      );

      return {
        ...p,
        user: resolvedName,
        authorName: resolvedName,
        username: resolvedUsername,
        avatar: resolvedAvatar,
        authorAvatar: resolvedAvatar,
        role: resolvedHeadline,
        authorHeadline: resolvedHeadline,
        pollData: pollValid ? p.pollData : null,
        eventData: eventValid ? p.eventData : null,
        originalPost: updatedOriginalPost,
      };
    });
  }

  /**
   * 1A. Get Algorithmic Home Feed (Primary Recommended API)
   * GET /api/v1/profile/home-post/feed
   */
  static async getAlgorithmicFeed(page: number = 1, limit: number = 20): Promise<FeedResponse> {
    try {
      const { data } = await api.get('/api/v1/profile/home-post/feed', {
        params: { page, limit },
      });
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] getAlgorithmicFeed failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch algorithmic home feed');
    }
  }

  /**
   * 1B. Get All Posts for Home Feed (Chronological / Reach Feed)
   * GET /api/v1/profile/activity/posts/feed/all
   */
  static async getChronologicalFeed(
    page: number = 1,
    limit: number = 20,
    includeArchived: boolean = false
  ): Promise<any> {
    try {
      const { data } = await api.get('/api/v1/profile/activity/posts/feed/all', {
        params: { page, limit, includeArchived },
      });
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] getChronologicalFeed failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch chronological feed');
    }
  }

  // ══════════════════════════════════════════════════════════
  // 2. FEED POST CREATION
  // ══════════════════════════════════════════════════════════

  /**
   * Create Post from Home Feed
   * POST /api/v1/profile/home-post/create
   */
  static async createPost(postData: any, config?: any): Promise<any> {
    try {
      let payload: any = postData;
      let headers: Record<string, string> = {};

      if (postData instanceof FormData) {
        payload = postData;
        headers['Content-Type'] = 'multipart/form-data';
      } else if (
        (postData.images && postData.images.length > 0) ||
        (postData.videos && postData.videos.length > 0) ||
        (postData.documents && postData.documents.length > 0)
      ) {
        const formData = new FormData();
        formData.append('title', postData.title);
        if (postData.content) formData.append('content', postData.content);
        if (postData.mood) formData.append('mood', postData.mood);
        if (postData.isPublic !== undefined) formData.append('isPublic', String(postData.isPublic));
        if (postData.scheduledFor) formData.append('scheduledFor', postData.scheduledFor);
        if (postData.pollData) formData.append('pollData', JSON.stringify(postData.pollData));
        if (postData.eventData) formData.append('eventData', JSON.stringify(postData.eventData));

        postData.images?.forEach((f: any) =>
          formData.append('images', {
            uri: f.uri,
            name: f.name || f.fileName || `image_${Date.now()}.jpg`,
            type: f.mimeType || f.type || 'image/jpeg',
          } as any)
        );
        postData.videos?.forEach((f: any) =>
          formData.append('videos', {
            uri: f.uri,
            name: f.name || f.fileName || `video_${Date.now()}.mp4`,
            type: f.mimeType || f.type || 'video/mp4',
          } as any)
        );
        postData.documents?.forEach((f: any) =>
          formData.append('documents', {
            uri: f.uri,
            name: f.name || f.fileName || `doc_${Date.now()}.pdf`,
            type: f.mimeType || f.type || 'application/octet-stream',
          } as any)
        );

        payload = formData;
        headers['Content-Type'] = 'multipart/form-data';
      }

      const { data } = await api.post('/api/v1/profile/home-post/create', payload, {
        headers,
        transformRequest: payload instanceof FormData ? () => payload : undefined,
        ...config,
      });
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] createPost failed:', error?.response?.data || error?.message);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const apiError = error.response?.data as any;
        const errors = Array.isArray(apiError?.errors)
          ? apiError.errors.map((e: any) => (typeof e === 'string' ? e : e.message)).filter(Boolean).join(', ')
          : '';
        throw new Error(errors || apiError?.message || 'Validation failed');
      }
      throw new Error(error?.response?.data?.message || 'Failed to create post');
    }
  }

  // ══════════════════════════════════════════════════════════
  // 3. LIKES & REACTIONS
  // ══════════════════════════════════════════════════════════

  /**
   * Like Post
   * POST /api/v1/profile/activity/posts/:postId/like
   */
  static async likePost(postId: string): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/posts/${postId}/like`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to like post');
    }
  }

  /**
   * Unlike Post
   * DELETE /api/v1/profile/activity/posts/:postId/like
   */
  static async unlikePost(postId: string): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/profile/activity/posts/${postId}/like`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to unlike post');
    }
  }

  /**
   * Add / Switch Reaction
   * POST /api/v1/profile/activity/posts/:postId/react
   * Body: { "type": "like" | "celebrate" | "support" | "love" | "insightful" | "funny" }
   */
  static async reactToPost(postId: string, type: ReactionType): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/posts/${postId}/react`, { type });
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] reactToPost failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to react to post');
    }
  }

  /**
   * Remove Reaction
   * DELETE /api/v1/profile/activity/posts/:postId/react
   */
  static async removeReaction(postId: string): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/profile/activity/posts/${postId}/react`);
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] removeReaction failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to remove reaction');
    }
  }

  /**
   * Get Post Reactors
   * GET /api/v1/profile/activity/posts/:postId/reactors
   */
  static async getPostReactors(postId: string): Promise<PostReactor[]> {
    try {
      const { data } = await api.get(`/api/v1/profile/activity/posts/${postId}/reactors`);
      const list = data?.data?.reactors || data?.data || data?.reactors || [];
      return Array.isArray(list) ? list : [];
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] getPostReactors failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to fetch reactors');
    }
  }

  // ══════════════════════════════════════════════════════════
  /**
   * Helper to retrieve cached user data synchronously
   */
  static getUserFromCache(userId: string): { name: string; avatar: string; headline?: string } | null {
    if (!userId) return null;
    const u = this.usersCache[userId];
    if (!u) return null;
    const photo = u.profilePhotoId ? this.photosCache[u.profilePhotoId] : (this.photosCache[userId] || u.profileImage || u.avatar);
    const name = (u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '') || u.name || u.fullName || u.username || '';
    return { name, avatar: photo || '', headline: u.headline || '' };
  }

  /**
   * Fetch single user details with in-memory caching
   */
  static async getUser(userId: string): Promise<{ name: string; avatar: string; headline?: string } | null> {
    if (!userId || typeof userId !== 'string' || !userId.trim()) return null;
    const cached = this.getUserFromCache(userId);
    if (cached && cached.name) return cached;

    try {
      const { data } = await api.get(`/api/v1/auth/get-user/${userId}`);
      const raw = data?.data || data?.user || data;
      if (raw) {
        const u = raw.user || raw.account || raw;
        const p = raw.profile || {};
        const merged = { ...u, ...p, userId };
        this.usersCache[userId] = merged;
        if (merged.profileImage) this.photosCache[userId] = merged.profileImage;
        if (merged.profilePhotoId && merged.profileImage) this.photosCache[merged.profilePhotoId] = merged.profileImage;
        const photo = merged.profileImage || merged.avatar || '';
        const name = (merged.firstName || merged.lastName ? `${merged.firstName || ''} ${merged.lastName || ''}`.trim() : '') || merged.name || merged.fullName || merged.username || 'User';
        return { name, avatar: photo };
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  /**
   * Bulk enrich comments and replies with real author names and profile avatars
   */
  static async enrichCommentsWithAuthorData(comments: any[]): Promise<any[]> {
    if (!Array.isArray(comments) || comments.length === 0) return comments;

    // 1. Collect all unique user IDs from comments and nested replies
    const uniqueUserIds = Array.from(
      new Set(
        comments
          .flatMap((c: any) => [
            c.userId,
            c.authorId,
            c.user?._id || c.user?.id || c.user?.userId || (typeof c.user === 'string' ? c.user : null),
            c.author?._id || c.author?.id || c.author?.userId || (typeof c.author === 'string' ? c.author : null),
            c.commenter?._id || c.commenter?.id || (typeof c.commenter === 'string' ? c.commenter : null),
            c.createdBy?._id || c.createdBy?.id || (typeof c.createdBy === 'string' ? c.createdBy : null),
            ...(Array.isArray(c.replies)
              ? c.replies.flatMap((r: any) => [
                  r.userId,
                  r.authorId,
                  r.user?._id || r.user?.id || (typeof r.user === 'string' ? r.user : null),
                  r.author?._id || r.author?.id || (typeof r.author === 'string' ? r.author : null),
                ])
              : []),
          ])
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      )
    );

    // 2. Fetch missing users in bulk
    const idsToFetch = uniqueUserIds.filter((id) => !this.usersCache[id]);
    if (idsToFetch.length > 0) {
      try {
        const { data } = await api.post('/api/v1/auth/get-users-bulk', { userIds: idsToFetch });
        const usersList = data?.data?.users || data?.users || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
        if (Array.isArray(usersList)) {
          usersList.forEach((u: any) => {
            const uid = u.userId || u.id || u._id;
            if (uid) {
              this.usersCache[uid] = u;
              if (u.userId) this.usersCache[u.userId] = u;
              if (u.id) this.usersCache[u.id] = u;
              if (u._id) this.usersCache[u._id] = u;
              if (u.profileImage) this.photosCache[uid] = u.profileImage;
              if (u.profilePhotoId && u.profileImage) this.photosCache[u.profilePhotoId] = u.profileImage;
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ [FEED_SERVICE] Bulk users fetch for comments failed:', err);
      }
    }

    // 2b. Guaranteed Fallback: Fetch any users still missing or without name via GET /api/v1/auth/get-user/:id
    const stillMissingIds = uniqueUserIds.filter(
      (id) => !this.usersCache[id] || (!this.usersCache[id].firstName && !this.usersCache[id].username && !this.usersCache[id].name)
    );
    if (stillMissingIds.length > 0) {
      await Promise.allSettled(
        stillMissingIds.map(async (uid) => {
          try {
            const { data } = await api.get(`/api/v1/auth/get-user/${uid}`);
            const raw = data?.data || data?.user || data;
            if (raw) {
              const u = raw.user || raw.account || raw;
              const p = raw.profile || {};
              const merged = { ...u, ...p, userId: uid };
              if (merged.firstName || merged.lastName || merged.username || merged.name) {
                this.usersCache[uid] = merged;
                if (merged.userId) this.usersCache[merged.userId] = merged;
                if (merged._id) this.usersCache[merged._id] = merged;
                if (merged.profileImage) {
                  this.photosCache[uid] = merged.profileImage;
                  if (merged.profilePhotoId) this.photosCache[merged.profilePhotoId] = merged.profileImage;
                }
              }
            }
          } catch (e) {
            // Non-critical
          }
        })
      );
    }

    // 3. Fetch missing profile photos in bulk
    const photoIdsToFetch = uniqueUserIds
      .map((id) => this.usersCache[id]?.profilePhotoId)
      .filter((pid): pid is string => Boolean(pid) && !this.photosCache[pid]);

    if (photoIdsToFetch.length > 0) {
      try {
        const { data } = await api.post('/api/v1/profile/profile-photo/get-multiple-photos', {
          photoIds: photoIdsToFetch,
        });
        const photosList = data?.data?.photos || data?.photos || [];
        if (Array.isArray(photosList)) {
          photosList.forEach((photo: any) => {
            if (photo.photoId && photo.cloudinarySecureUrl) {
              this.photosCache[photo.photoId] = photo.cloudinarySecureUrl;
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ [FEED_SERVICE] Bulk profile photos fetch for comments failed:', err);
      }
    }

    // 4. Map enriched author details to comments and replies
    const isId = (str: any) => {
      if (!str || typeof str !== 'string') return false;
      const s = str.trim();
      return /^[0-9a-fA-F]{24}$/.test(s) || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(s) || /^(usr_|user_|auth_|com_|comment_|post_)[a-zA-Z0-9_-]+$/i.test(s);
    };

    const enrichSingleItem = (item: any) => {
      const uid = item.userId || item.authorId || item.user?._id || item.user?.id || (typeof item.user === 'string' ? item.user : null);
      const userData = uid ? this.usersCache[uid] : null;

      const profilePhoto = userData?.profilePhotoId
        ? this.photosCache[userData.profilePhotoId]
        : (this.photosCache[uid] || userData?.profileImage || userData?.profilePhotoUrl || userData?.avatar);

      const resolvedName =
        (userData && (userData.firstName || userData.lastName)
          ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
          : '') ||
        userData?.name ||
        userData?.fullName ||
        userData?.username ||
        (typeof item.user === 'string' && !isId(item.user) ? item.user : '') ||
        (typeof item.authorName === 'string' && !isId(item.authorName) ? item.authorName : '') ||
        '';

      return {
        ...item,
        authorName: resolvedName || item.authorName,
        authorAvatar: profilePhoto || item.authorAvatar || item.avatar || '',
        avatar: profilePhoto || item.avatar || item.authorAvatar || '',
        profileImage: profilePhoto || item.profileImage || '',
        user: userData ? { ...userData, name: resolvedName, profileImage: profilePhoto } : (typeof item.user === 'object' ? item.user : { name: resolvedName, profileImage: profilePhoto }),
      };
    };

    return comments.map((c) => {
      const enrichedComment = enrichSingleItem(c);
      if (Array.isArray(c.replies) && c.replies.length > 0) {
        enrichedComment.replies = c.replies.map((r: any) => enrichSingleItem(r));
      }
      return enrichedComment;
    });
  }

  // 4. COMMENTS & REPLIES
  // ══════════════════════════════════════════════════════════

  /**
   * Get Post Comments
   * GET /api/v1/profile/activity/posts/:postId/comments
   */
  static async getComments(postId: string): Promise<any> {
    try {
      const { data } = await api.get(`/api/v1/profile/activity/posts/${postId}/comments`);
      let commentsList = [];
      if (Array.isArray(data)) commentsList = data;
      else if (Array.isArray(data?.data)) commentsList = data.data;
      else if (data?.data && Array.isArray(data.data.comments)) commentsList = data.data.comments;
      else if (Array.isArray(data?.comments)) commentsList = data.comments;

      const enriched = await this.enrichCommentsWithAuthorData(commentsList);
      if (Array.isArray(data)) return enriched;
      if (Array.isArray(data?.data)) return { ...data, data: enriched };
      if (data?.data?.comments) return { ...data, data: { ...data.data, comments: enriched } };
      return { ...data, comments: enriched };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch comments');
    }
  }

  /**
   * Add Comment
   * POST /api/v1/profile/activity/create-comment/comments
   */
  static async addComment(postId: string, content: string, image?: any): Promise<any> {
    try {
      const trimmed = (content || '').trim();
      if (image) {
        const formData = new FormData();
        formData.append('postId', postId);
        formData.append('content', trimmed);
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || image.fileName || `comment_image_${Date.now()}.jpg`,
        } as any);

        const { data } = await api.post('/api/v1/profile/activity/create-comment/comments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          transformRequest: () => formData,
        });
        return data;
      }
      const { data } = await api.post('/api/v1/profile/activity/create-comment/comments', {
        postId,
        content: trimmed,
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to add comment');
    }
  }

  /**
   * Reply to Comment
   * POST /api/v1/profile/activity/comments/:commentId/reply
   */
  static async replyToComment(commentId: string, content: string): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/comments/${commentId}/reply`, {
        content: (content || '').trim(),
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to post reply');
    }
  }

  /**
   * Update Comment
   * PUT /api/v1/profile/activity/update-comments/:commentId
   */
  static async updateComment(commentId: string, content: string): Promise<any> {
    try {
      const { data } = await api.put(`/api/v1/profile/activity/update-comments/${commentId}`, {
        content: (content || '').trim(),
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to update comment');
    }
  }

  /**
   * Delete Comment
   * DELETE /api/v1/profile/activity/delete-comments/:commentId
   */
  static async deleteComment(commentId: string, permanent: boolean = false): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/profile/activity/delete-comments/${commentId}`, {
        params: { permanent },
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to delete comment');
    }
  }

  /**
   * Like Comment
   * POST /api/v1/profile/activity/comments/:commentId/like
   */
  static async likeComment(commentId: string): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/comments/${commentId}/like`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to like comment');
    }
  }

  /**
   * Unlike Comment
   * DELETE /api/v1/profile/activity/comments/:commentId/like
   */
  static async unlikeComment(commentId: string): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/profile/activity/comments/${commentId}/like`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to unlike comment');
    }
  }

  /**
   * React to Comment (emoji reaction)
   * POST /api/v1/profile/activity/comments/:commentId/react
   */
  static async reactToComment(commentId: string, reactionType: string): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/comments/${commentId}/react`, { reactionType });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to react to comment');
    }
  }

  /**
   * Get My Comments
   * GET /api/v1/profile/activity/comments/my-comments
   */
  static async getMyComments(): Promise<any> {
    try {
      const { data } = await api.get('/api/v1/profile/activity/comments/my-comments');
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch my comments');
    }
  }

  // ══════════════════════════════════════════════════════════
  // 5. REPOSTS & QUOTES
  // ══════════════════════════════════════════════════════════

  /**
   * Create Repost / Quote
   * POST /api/v1/profile/activity/posts/:entryId/repost
   */
  static async createRepost(
    entryId: string,
    payload: {
      type: 'repost' | 'quote';
      thoughtText?: string;
      visibility?: 'public' | 'connections' | 'private';
      repostSource?: string;
    }
  ): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/posts/${entryId}/repost`, {
        visibility: 'public',
        repostSource: 'feed',
        ...payload,
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to repost');
    }
  }

  /**
   * Delete Repost
   * DELETE /api/v1/profile/activity/posts/reposts/:repostId
   */
  static async deleteRepost(repostId: string): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/profile/activity/posts/reposts/${repostId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to delete repost');
    }
  }

  /**
   * Get Reposts of Post
   * GET /api/v1/profile/activity/posts/:entryId/reposts
   */
  static async getRepostsOfPost(entryId: string): Promise<any> {
    try {
      const { data } = await api.get(`/api/v1/profile/activity/posts/${entryId}/reposts`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch reposts');
    }
  }

  /**
   * Check Repost Status
   * GET /api/v1/profile/activity/posts/:entryId/repost-status
   * Returns { "hasReposted": boolean, "repostId": "..." }
   */
  static async checkRepostStatus(entryId: string): Promise<{ hasReposted: boolean; repostId?: string }> {
    try {
      const { data } = await api.get(`/api/v1/profile/activity/posts/${entryId}/repost-status`);
      return data?.data || data || { hasReposted: false };
    } catch (error: any) {
      return { hasReposted: false };
    }
  }

  /**
   * Like / React Repost
   * POST /api/v1/profile/activity/posts/reposts/:repostId/react
   */
  static async likeRepost(repostId: string): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/posts/reposts/${repostId}/react`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to react to repost');
    }
  }

  /**
   * Unlike Repost
   * DELETE /api/v1/profile/activity/posts/reposts/:repostId/react
   */
  static async unlikeRepost(repostId: string): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/profile/activity/posts/reposts/${repostId}/react`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to remove reaction from repost');
    }
  }

  // ══════════════════════════════════════════════════════════
  // 6. FEED POST ACTIONS (Save, Pin, Polls, Share, Dwell Time)
  // ══════════════════════════════════════════════════════════

  /**
   * Save / Unsave Post
   * PUT /api/v1/profile/activity/posts/:postId/save
   */
  static async savePost(postId: string, isSaved: boolean): Promise<any> {
    try {
      const { data } = await api.put(`/api/v1/profile/activity/posts/${postId}/save`, { isSaved });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to save post');
    }
  }

  /**
   * Get Saved Posts
   * GET /api/v1/profile/activity/posts/saved
   */
  static async getSavedPosts(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const { data } = await api.get('/api/v1/profile/activity/posts/saved', {
        params: { page, limit },
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch saved posts');
    }
  }

  /**
   * Pin / Unpin Post
   * PUT /api/v1/profile/activity/posts/:postId/pin
   */
  static async pinPost(postId: string, isPinned: boolean): Promise<any> {
    try {
      const { data } = await api.put(`/api/v1/profile/activity/posts/${postId}/pin`, { isPinned });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to pin post');
    }
  }

  /**
   * Vote on Poll
   * POST /api/v1/profile/activity/posts/:postId/vote
   * Body: { "optionId": "<uuid-of-option>" }
   */
  static async votePoll(postId: string, optionId: string): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/posts/${postId}/vote`, { optionId });
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] votePoll failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to record vote');
    }
  }

  /**
   * Record Share / Send
   * POST /api/v1/profile/activity/posts/:postId/record-send
   * Increments share/send counter in backend
   */
  static async recordSend(postId: string, recipientCount: number = 1): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/posts/${postId}/record-send`, {
        recipientCount,
      });
      return data;
    } catch (error: any) {
      console.warn('⚠️ [FEED_SERVICE] recordSend non-critical failure:', error?.message);
      return null;
    }
  }

  /**
   * Track View / Dwell Time
   * POST /api/v1/profile/activity/posts/:postId/track-view
   * Body: { "dwellTime": 12, "expanded": true }
   * Powers algorithmic feed candidate ranking
   */
  static async trackPostView(postId: string, dwellTime: number, expanded: boolean = false): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/posts/${postId}/track-view`, {
        dwellTime,
        expanded,
      });
      return data;
    } catch (error: any) {
      console.warn('⚠️ [FEED_SERVICE] trackPostView non-critical failure:', error?.message);
      return null;
    }
  }

  /**
   * Get Single Post by ID
   * GET /api/v1/profile/activity/get-post/:postId
   */
  static async getPostById(postId: string): Promise<any> {
    try {
      const { data } = await api.get(`/api/v1/profile/activity/get-post/${postId}`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to fetch post');
    }
  }

  /**
   * Update Post (Author)
   * PUT /api/v1/profile/activity/update-post/:postId
   */
  static async updatePost(postId: string, updates: { title?: string; content?: string }): Promise<any> {
    try {
      const { data } = await api.put(`/api/v1/profile/activity/update-post/${postId}`, updates);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to update post');
    }
  }

  /**
   * Delete Post (Author)
   * DELETE /api/v1/profile/activity/delete-post/:postId
   */
  static async deletePost(postId: string, permanent: boolean = false): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/profile/activity/delete-post/${postId}`, {
        params: { permanent },
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to delete post');
    }
  }

  // ══════════════════════════════════════════════════════════
  // 7. MODERATION, REPORTING & MUTING (Feed 3-Dot Menu)
  // ══════════════════════════════════════════════════════════

  /**
   * Report a Post
   * POST /api/v1/profile/reports/
   */
  static async reportPost(payload: {
    postId: string;
    reason: ReportReason;
    details?: string;
    postOwnerId?: string;
  }): Promise<any> {
    try {
      const { data } = await api.post('/api/v1/profile/reports/', {
        postId: payload.postId,
        reason: payload.reason,
        details: payload.details,
        postOwnerId: payload.postOwnerId,
        targetType: 'post',
      });
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] reportPost failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to submit report');
    }
  }

  /**
   * Report a Comment
   * POST /api/v1/profile/activity/comments/:commentId/report
   */
  static async reportComment(commentId: string, reason: string): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/comments/${commentId}/report`, {
        reason,
      });
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to report comment');
    }
  }

  /**
   * Mute Post Thread
   * POST /api/v1/profile/activity/posts/:postId/mute-thread
   */
  static async mutePostThread(postId: string): Promise<any> {
    try {
      const { data } = await api.post(`/api/v1/profile/activity/posts/${postId}/mute-thread`);
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] mutePostThread failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to mute thread');
    }
  }

  /**
   * Unmute Post Thread
   * DELETE /api/v1/profile/activity/posts/:postId/mute-thread
   */
  static async unmutePostThread(postId: string): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/profile/activity/posts/${postId}/mute-thread`);
      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Failed to unmute thread');
    }
  }

  /**
   * Get Muted Threads
   * GET /api/v1/profile/activity/muted-threads
   */
  static async getMutedThreads(): Promise<string[]> {
    try {
      const { data } = await api.get('/api/v1/profile/activity/muted-threads');
      const list = data?.data?.mutedThreads || data?.data || data?.muted || [];
      return Array.isArray(list) ? list : [];
    } catch (error: any) {
      return [];
    }
  }

  // ══════════════════════════════════════════════════════════
  // 8. AUTHOR ACTIONS (Follow / Connect)
  // ══════════════════════════════════════════════════════════

  /**
   * Follow Author
   * POST /api/v1/connections/follow/
   * Passes both followingId and targetUserId for backend compatibility
   */
  static async followAuthor(targetUserId: string): Promise<any> {
    try {
      const { data } = await api.post('/api/v1/connections/follow/', {
        followingId: targetUserId,
        targetUserId,
      });
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] followAuthor failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to follow author');
    }
  }

  /**
   * Unfollow Author
   * DELETE /api/v1/connections/follow/:targetUserId
   */
  static async unfollowAuthor(targetUserId: string): Promise<any> {
    try {
      const { data } = await api.delete(`/api/v1/connections/follow/${targetUserId}`);
      return data;
    } catch (error: any) {
      console.error('❌ [FEED_SERVICE] unfollowAuthor failed:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Failed to unfollow author');
    }
  }

  /**
   * Follow Status
   * GET /api/v1/connections/follow/status/:targetUserId
   */
  static async getFollowStatus(targetUserId: string): Promise<{ isFollowing: boolean }> {
    try {
      const { data } = await api.get(`/api/v1/connections/follow/status/${targetUserId}`);
      const res = data?.data || data || {};
      return { isFollowing: Boolean(res.isFollowing ?? res.following) };
    } catch (error: any) {
      return { isFollowing: false };
    }
  }

  /**
   * Send Connection Request
   * POST /api/v1/connections/requests
   */
  static async sendConnectionRequest(toUserId: string, message: string = "Hi! I'd like to connect with you."): Promise<any> {
    const { ConnectionService } = require('./connection.service');
    return ConnectionService.sendConnectionRequest({ toUserId, message });
  }
}

export default FeedService;
