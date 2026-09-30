import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import { GroupHeader } from '../components/GroupHeader';
import { GroupGrid } from '../components/GroupGrid';
import { TopRankedGroups } from '../components/TopRankedGroups';
import { PublicGroups } from '../components/PublicGroups';
import { CTABanner } from '../components/CTABanner';
import { StudyToolsBar } from '../components/StudyToolsBar';
import BottomBar, { emitBottomBarScroll, emitBottomBarScrollEnd } from '../../../../../shared/components/BottomBar';

import { CreateGroupModal } from '../components/CreateGroupModal';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchBrowseGroups, fetchMyGroups, fetchTopRankedGroups } from '../../../store/groupsSlice';
import { colors } from '../../../theme/colors';
import { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const browseItems = useAppSelector(s => s.groups.browseItems);
  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchBrowseGroups()).unwrap(),
        dispatch(fetchMyGroups()).unwrap(),
        dispatch(fetchTopRankedGroups()).unwrap()
      ]);
    } catch (err) {
      console.log('Error refreshing study groups:', err);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    // Hydrate with live data from the backend
    dispatch(fetchBrowseGroups());
    dispatch(fetchMyGroups());
    dispatch(fetchTopRankedGroups());
  }, [dispatch]);


  return (
    <BottomBar activeTabOverride="Study">
      <SafeScreen>
        <View style={styles.flex}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={emitBottomBarScroll}
          onScrollEndDrag={emitBottomBarScrollEnd}
          onMomentumScrollEnd={emitBottomBarScrollEnd}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primaryLight]}
              tintColor={colors.primaryLight}
            />
          }
        >
          <GroupHeader onCreatePress={() => setCreateModalVisible(true)} />

          <View style={styles.sections}>
            <StudyToolsBar
             onDashboardPress={() => navigation.navigate('Dashboard')}
              onTimerPress={() => navigation.navigate('Timer')}
              onTodoPress={() => navigation.navigate('Todo')}
              onGoalsPress={() => navigation.navigate('Goals')}
              onMyGroupsPress={() => navigation.navigate('MyGroups')}
              onLeaderboardPress={() => navigation.navigate('Leaderboard')}
            />

            <View style={styles.divider} />
            <GroupGrid
              title="University Groups"
              subtitle="Find friends from your college"
              sectionKey="university"
              allGroups={browseItems}
            />
            <View style={styles.divider} />
            <TopRankedGroups />
            <View style={styles.divider} />
            <PublicGroups />
            <View style={styles.divider} />
            <GroupGrid
              title="Placement Groups"
              subtitle="Gear your placement prep with like-minded people"
              sectionKey="dsa"
              allGroups={browseItems}
            />
            <View style={styles.divider} />
            <CTABanner onCreatePress={() => setCreateModalVisible(true)} />
            <View style={styles.divider} />
            <GroupGrid
              title="JEE Study Groups"
              subtitle="Join forces with peers to conquer JEE together"
              sectionKey="jee"
              allGroups={browseItems}
            />
          </View>
        </ScrollView>
        <CreateGroupModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} />
      </View>
    </SafeScreen>
    </BottomBar>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 100 },
  sections: { paddingHorizontal: 16, paddingTop: 20, gap: 24 },
  divider: { height: 1, backgroundColor: colors.borderBrown, marginVertical: 4 },
}); 