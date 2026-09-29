import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Group, PublicGroup } from '../features/home/types';
import { StudyService, StudyGroupInput } from '../../../services/study.service';

export interface MyGroup {
  id: string | number;
  title: string;
  description: string;
  category: string;
  members: number;
  capacity: number;
  goalHours: number;
  cameraRequired?: boolean;
  visibility: 'public' | 'private';
  isCreator?: boolean;
  joinedDate?: string;
  lastActive?: string;
  streak?: number;
  studyTime?: number;
  rank?: number;
  attendance?: number;
}

interface GroupsState {
  items: MyGroup[];
  browseItems: Group[];
  topRankedGroups: Group[];
  publicGroups: PublicGroup[];
  joinedGroupIds: (string | number)[];
  browseSearchQuery: string;
  expandedSections: {
    university: boolean;
    dsa: boolean;
    jee: boolean;
    public: boolean;
  };
  loading: boolean;
  error: string | null;
}

const mapGroup = (g: any): MyGroup => {
  const rawId = g.id || g.groupId || g._id;
  const finalId = (rawId !== undefined && rawId !== null && String(rawId).trim() !== '') 
    ? String(rawId) 
    : `group-fallback-${Math.random().toString(36).substring(2, 11)}`;

  return {
    id: finalId,
    title: g.title || '',
    description: g.description || '',
    category: g.category || 'Other',
    members: g.currentMemberCount || g.members || 1,
    capacity: g.capacity || 50,
    goalHours: g.goalHours || 0,
    cameraRequired: g.cameraRequired ?? false,
    visibility: g.visibility || 'public',
    isCreator: g.isCreator || false,
    joinedDate: g.createdAt || g.joinedDate,
    lastActive: g.lastActive || 'recently',
    streak: g.streak || 0,
    studyTime: g.studyTime || 0,
    rank: g.groupScore || g.rank || 0,
    attendance: g.attendance || 0,
  };
};

const formatLeader = (leaderId: any) => {
  if (!leaderId) return 'Creator';
  if (typeof leaderId === 'string' && leaderId.length === 36 && leaderId.includes('-')) {
    return 'Creator';
  }
  return leaderId;
};

export const fetchMyGroups = createAsyncThunk(
  'groups/fetchMyGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getMyGroups();
      const rawGroups = response.data || response;
      return Array.isArray(rawGroups) ? rawGroups.map(mapGroup) : [];
    } catch (err: any) {
      console.log('Error fetching my groups from backend, using fallback:', err.message);
      return rejectWithValue(err.message || 'Failed to fetch');
    }
  }
);

export const fetchBrowseGroups = createAsyncThunk(
  'groups/fetchBrowseGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getAllGroups();
      const rawGroups = response.data?.groups || response.groups || (Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : []);
      return rawGroups.map((g: any) => {
        const rawId = g.groupId || g.id || g._id;
        const finalId = (rawId !== undefined && rawId !== null && String(rawId).trim() !== '')
          ? String(rawId)
          : `group-fallback-${Math.random().toString(36).substring(2, 11)}`;

        // Map category to section for UI layout
        const cat = (g.category || '').toLowerCase();
        let section: 'university' | 'dsa' | 'jee' = 'university';
        if (cat.includes('jee')) section = 'jee';
        else if (cat.includes('dsa') || cat.includes('coding') || cat.includes('placement')) section = 'dsa';

        return {
          id: finalId,
          title: g.title || '',
          description: g.description || '',
          category: g.category || 'Other',
          rank: g.groupScore || 0,
          visibility: g.visibility || 'public',
          cameraOn: g.cameraRequired ?? false,
          members: g.currentMemberCount || g.members || 1,
          capacity: g.capacity || 50,
          leader: formatLeader(g.leaderId),
          goalHours: g.goalHours || 0,
          attendanceAvg: g.minAttendancePercent || (g.attendanceRequired ? 75 : 50),
          section,
          _isMember: g.isMember === true,  // temp flag for joinedGroupIds hydration
        } as Group & { _isMember?: boolean };
      });
    } catch (err: any) {
      console.log('Error fetching browse groups from backend:', err.message);
      return rejectWithValue(err.message || 'Failed to fetch');
    }
  }
);

// OLD: fetchTopRankedGroups — no debug logging, no fallback ID warning
// export const fetchTopRankedGroups = createAsyncThunk(
//   'groups/fetchTopRankedGroups',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await StudyService.getTopRankedGroups();
//       const rawGroups = response.data?.groups || response.groups || (Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : []);
//       return rawGroups.map((g: any, index: number) => {
//         const rawId = g.groupId || g.id || g._id;
//         const finalId = (rawId !== undefined && rawId !== null && String(rawId).trim() !== '')
//           ? String(rawId)
//           : `top-ranked-fallback-${Math.random().toString(36).substring(2, 11)}`;
//
//         return {
//           id: finalId,
//           title: g.title || '',
//           description: g.description || '',
//           category: g.category || 'Other',
//           rank: index + 1,
//           visibility: g.visibility || 'public',
//           cameraOn: g.cameraRequired ?? false,
//           members: g.currentMemberCount || g.members || 1,
//           capacity: g.capacity || 50,
//           leader: g.leaderId || 'Creator',
//           goalHours: g.goalHours || 0,
//           attendanceAvg: g.minAttendancePercent || (g.attendanceRequired ? 75 : 50),
//           _isMember: g.isMember === true,
//         } as Group & { _isMember?: boolean };
//       });
//     } catch (err: any) {
//       console.log('Error fetching top ranked groups from backend:', err.message);
//       return rejectWithValue(err.message || 'Failed to fetch');
//     }
//   }
// );

// NEW: fetchTopRankedGroups — added debug logging + fallback ID warning
export const fetchTopRankedGroups = createAsyncThunk(
  'groups/fetchTopRankedGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await StudyService.getTopRankedGroups();
      const rawGroups = response.data?.groups || response.groups || (Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : []);
      console.log('[fetchTopRankedGroups] Raw groups count:', rawGroups.length);
      if (rawGroups.length > 0) {
        console.log('[fetchTopRankedGroups] Sample group keys:', Object.keys(rawGroups[0]));
        console.log('[fetchTopRankedGroups] Sample group id/groupId/_id:', rawGroups[0].id, rawGroups[0].groupId, rawGroups[0]._id);
      }
      return rawGroups.map((g: any, index: number) => {
        const rawId = g.groupId || g.id || g._id;
        const finalId = (rawId !== undefined && rawId !== null && String(rawId).trim() !== '')
          ? String(rawId)
          : `top-ranked-fallback-${Math.random().toString(36).substring(2, 11)}`;

        if (finalId.startsWith('top-ranked-fallback')) {
          console.warn('[fetchTopRankedGroups] ⚠️ Group has no valid ID, using fallback:', g.title, '| Available keys:', Object.keys(g));
        }

        return {
          id: finalId,
          title: g.title || '',
          description: g.description || '',
          category: g.category || 'Other',
          rank: index + 1,
          visibility: g.visibility || 'public',
          cameraOn: g.cameraRequired ?? false,
          members: g.currentMemberCount || g.members || 1,
          capacity: g.capacity || 50,
          leader: formatLeader(g.leaderId),
          goalHours: g.goalHours || 0,
          attendanceAvg: g.minAttendancePercent || (g.attendanceRequired ? 75 : 50),
          _isMember: g.isMember === true,  // temp flag for joinedGroupIds hydration
        } as Group & { _isMember?: boolean };
      });
    } catch (err: any) {
      console.log('Error fetching top ranked groups from backend:', err.message);
      return rejectWithValue(err.message || 'Failed to fetch');
    }
  }
);

export const createStudyGroup = createAsyncThunk(
  'groups/createStudyGroup',
  async (groupData: StudyGroupInput, { rejectWithValue }) => {
    try {
      const response = await StudyService.createGroup(groupData);
      const rawGroup = response.data || response;
      return mapGroup(rawGroup);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create group');
    }
  }
);

// OLD: joinStudyGroup — no fallback ID guard
// export const joinStudyGroup = createAsyncThunk(
//   'groups/joinStudyGroup',
//   async (groupId: string | number, { rejectWithValue }) => {
//     try {
//       const response = await StudyService.joinGroup(String(groupId));
//       const rawGroup = response.data || response;
//       return { groupId, group: mapGroup(rawGroup) };
//     } catch (err: any) {
//       return rejectWithValue(err.message || 'Failed to join group');
//     }
//   }
// );

// NEW: joinStudyGroup — added fallback ID guard to prevent 404 errors
export const joinStudyGroup = createAsyncThunk(
  'groups/joinStudyGroup',
  async (groupId: string | number, { rejectWithValue }) => {
    try {
      const gid = String(groupId);
      if (gid.includes('-fallback-')) {
        console.error('[joinStudyGroup] Cannot join with a fallback ID:', gid);
        return rejectWithValue('Invalid group ID — group data may not have loaded properly. Try refreshing.');
      }
      const response = await StudyService.joinGroup(gid);
      const rawGroup = response.data || response;
      return { groupId, group: mapGroup(rawGroup) };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to join group');
    }
  }
);

export const leaveStudyGroup = createAsyncThunk(
  'groups/leaveStudyGroup',
  async (groupId: string | number, { rejectWithValue }) => {
    try {
      await StudyService.leaveGroup(String(groupId));
      return groupId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to leave group');
    }
  }
);

export const updateStudyGroup = createAsyncThunk(
  'groups/updateStudyGroup',
  async ({ id, data }: { id: string | number, data: any }, { rejectWithValue }) => {
    try {
      const response = await StudyService.updateGroup(String(id), data);
      return { id, data };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update group');
    }
  }
);

export const deleteStudyGroup = createAsyncThunk(
  'groups/deleteStudyGroup',
  async (groupId: string | number, { rejectWithValue }) => {
    try {
      await StudyService.deleteGroup(String(groupId));
      return groupId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete group');
    }
  }
);

const initialState: GroupsState = {
  items: [],
  browseItems: [],
  topRankedGroups: [],
  publicGroups: [],
  joinedGroupIds: [],
  browseSearchQuery: '',
  expandedSections: { university: false, dsa: false, jee: false, public: false },
  loading: false,
  error: null,
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    // My Groups actions
    updateGroup(state, action: PayloadAction<{ id: string | number; data: Partial<MyGroup> }>) {
      const idx = state.items.findIndex(g => g.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload.data };
    },
    deleteGroup(state, action: PayloadAction<string | number>) {
      state.items = state.items.filter(g => g.id !== action.payload);
    },
    addCreatedGroup(state, action: PayloadAction<MyGroup>) {
      state.items.unshift(action.payload);
      const browseGroup: Group = {
        id: action.payload.id,
        title: action.payload.title,
        description: action.payload.description,
        category: action.payload.category,
        rank: action.payload.rank ?? 0,
        visibility: action.payload.visibility,
        cameraOn: action.payload.cameraRequired ?? false,
        members: action.payload.members || 1,
        capacity: action.payload.capacity,
        leader: 'You',
        goalHours: action.payload.goalHours,
        attendanceAvg: action.payload.attendance ?? 75,
      };
      state.browseItems.unshift(browseGroup);
    },
    leaveGroup(state, action: PayloadAction<string | number>) {
      state.items = state.items.filter(g => g.id !== action.payload);
    },

    // Browse actions
    setBrowseSearchQuery(state, action: PayloadAction<string>) {
      state.browseSearchQuery = action.payload;
    },
    joinGroup(state, action: PayloadAction<string | number>) {
      if (!state.joinedGroupIds.includes(action.payload)) {
        state.joinedGroupIds.push(action.payload);
        const gid = action.payload;
        const b = state.browseItems.find(x => x.id === gid);
        if (b) b.members += 1;
        const t = state.topRankedGroups.find(x => x.id === gid);
        if (t) t.members += 1;
        const p = state.publicGroups.find(x => x.id === gid);
        if (p) p.members += 1;
      }
    },
    unjoinGroup(state, action: PayloadAction<string | number>) {
      state.joinedGroupIds = state.joinedGroupIds.filter(id => id !== action.payload);
      const gid = action.payload;
      const b = state.browseItems.find(x => x.id === gid);
      if (b && b.members > 0) b.members -= 1;
      const t = state.topRankedGroups.find(x => x.id === gid);
      if (t && t.members > 0) t.members -= 1;
      const p = state.publicGroups.find(x => x.id === gid);
      if (p && p.members > 0) p.members -= 1;
    },
    toggleSectionExpanded(state, action: PayloadAction<keyof GroupsState['expandedSections']>) {
      state.expandedSections[action.payload] = !state.expandedSections[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMyGroups
      .addCase(fetchMyGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        // Hydrate joinedGroupIds from the user's own groups
        const myIds = (action.payload || []).map(g => g.id);
        for (const id of myIds) {
          if (!state.joinedGroupIds.includes(id)) {
            state.joinedGroupIds.push(id);
          }
        }
      })
      .addCase(fetchMyGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchBrowseGroups
      .addCase(fetchBrowseGroups.fulfilled, (state, action) => {
        const groups = action.payload || [];
        // Hydrate joinedGroupIds from backend isMember flag
        for (const g of groups) {
          if ((g as any)._isMember && !state.joinedGroupIds.includes(g.id)) {
            state.joinedGroupIds.push(g.id);
          }
        }
        // Strip temp flag before storing
        state.browseItems = groups.map(({ _isMember, ...rest }: any) => rest);
        state.publicGroups = groups.map((g: any) => ({
          id: g.id,
          title: g.title,
          members: g.members
        }));
      })

      // fetchTopRankedGroups
      .addCase(fetchTopRankedGroups.fulfilled, (state, action) => {
        const groups = action.payload || [];
        // Hydrate joinedGroupIds from backend isMember flag
        for (const g of groups) {
          if ((g as any)._isMember && !state.joinedGroupIds.includes(g.id)) {
            state.joinedGroupIds.push(g.id);
          }
        }
        // Strip temp flag before storing
        state.topRankedGroups = groups.map(({ _isMember, ...rest }: any) => rest);
      })

      // createStudyGroup
      .addCase(createStudyGroup.fulfilled, (state, action) => {
        state.items = state.items.filter(g => typeof g.id === 'string' || g.id < 1000000000000);
        state.browseItems = state.browseItems.filter(g => typeof g.id === 'string' || (typeof g.id === 'number' && g.id < 1000000000000));
        state.items.unshift(action.payload);
        const browseGroup: Group = {
          id: action.payload.id,
          title: action.payload.title,
          description: action.payload.description,
          category: action.payload.category,
          rank: action.payload.rank ?? 0,
          visibility: action.payload.visibility,
          cameraOn: action.payload.cameraRequired ?? false,
          members: action.payload.members || 1,
          capacity: action.payload.capacity,
          leader: 'You',
          goalHours: action.payload.goalHours,
          attendanceAvg: action.payload.attendance ?? 75,
        };
        state.browseItems.unshift(browseGroup);
      })

      // joinStudyGroup
      .addCase(joinStudyGroup.fulfilled, (state, action) => {
        const { groupId, group } = action.payload;
        if (!state.joinedGroupIds.includes(groupId)) {
          state.joinedGroupIds.push(groupId);
        }
        const exists = state.items.some(item => item.id === groupId);
        if (!exists) {
          state.items.push(group);
        }
        // Sync member counts across all lists
        const browseGroup = state.browseItems.find(x => x.id === groupId);
        if (browseGroup) browseGroup.members = (browseGroup.members || 0) + 1;
        const topGroup = state.topRankedGroups.find(x => x.id === groupId);
        if (topGroup) topGroup.members = (topGroup.members || 0) + 1;
        const pubGroup = state.publicGroups.find(x => x.id === groupId);
        if (pubGroup) pubGroup.members = (pubGroup.members || 0) + 1;
      })

      // leaveStudyGroup
      .addCase(leaveStudyGroup.fulfilled, (state, action) => {
        const groupId = action.payload;
        state.items = state.items.filter(g => g.id !== groupId);
        state.joinedGroupIds = state.joinedGroupIds.filter(id => id !== groupId);
        // Sync member counts across all lists
        const browseGroup = state.browseItems.find(x => x.id === groupId);
        if (browseGroup && browseGroup.members > 1) browseGroup.members -= 1;
        const topGroup = state.topRankedGroups.find(x => x.id === groupId);
        if (topGroup && topGroup.members > 1) topGroup.members -= 1;
        const pubGroup = state.publicGroups.find(x => x.id === groupId);
        if (pubGroup && pubGroup.members > 1) pubGroup.members -= 1;
      })
      // updateStudyGroup
      .addCase(updateStudyGroup.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const idx = state.items.findIndex(g => g.id === id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...data };
        }
      })
      // deleteStudyGroup
      .addCase(deleteStudyGroup.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter(g => g.id !== id);
        state.browseItems = state.browseItems.filter(g => g.id !== id);
      });
  }
});

export const {
  updateGroup, deleteGroup, leaveGroup,
  setBrowseSearchQuery,
  joinGroup, unjoinGroup, addCreatedGroup, toggleSectionExpanded,
} = groupsSlice.actions;

export default groupsSlice.reducer;