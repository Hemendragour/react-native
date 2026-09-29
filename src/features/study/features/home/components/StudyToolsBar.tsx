import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  onTimerPress: () => void;
  onTodoPress: () => void;
  onGoalsPress: () => void;
  onMyGroupsPress: () => void;
  onDashboardPress: () => void;
  onLeaderboardPress: () => void;
}

const ROW_ONE = [
  { label: 'Timer' },
  { label: 'Todo' },
  { label: 'Goals' },
];

const ROW_TWO = [
  { label: 'My Groups' },
  { label: 'Dashboard' },
  { label: 'Leaderboard' },
];

export function StudyToolsBar({
  onTimerPress,
  onTodoPress,
  onGoalsPress,
  onMyGroupsPress,
  onDashboardPress,
  onLeaderboardPress,
}: Props) {
  const handlePress = (label: string) => {
    if (label === 'Timer') onTimerPress();
    if (label === 'Todo') onTodoPress();
    if (label === 'Goals') onGoalsPress();
    if (label === 'My Groups') onMyGroupsPress();
    if (label === 'Dashboard') onDashboardPress();
    if (label === 'Leaderboard') onLeaderboardPress();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Study Tools</Text>

      {/* Row 1: Timer | Todo | Goals */}
      <View style={styles.row}>
        {ROW_ONE.map((tool) => (
          <TouchableOpacity
            key={tool.label}
            style={styles.toolBtn}
            activeOpacity={0.8}
            onPress={() => handlePress(tool.label)}
          >
            <Text
              style={styles.toolText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Row 2: My Groups | Dashboard | Leaderboard */}
      <View style={[styles.row, styles.rowTwo]}>
        {ROW_TWO.map((tool) => (
          <TouchableOpacity
            key={tool.label}
            style={[
              styles.toolBtn,
              tool.label === 'My Groups' && styles.myGroupsBtn,
              tool.label === 'Dashboard' && styles.dashboardBtn,
            ]}
            activeOpacity={0.8}
            onPress={() => handlePress(tool.label)}
          >
            <Text
              style={styles.toolText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  heading: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowTwo: {
    marginTop: 10,
  },
  toolBtn: {
    flex: 1,
    minHeight: 48,
    backgroundColor: colors.primary,
    borderColor: '#3b2b1e',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  myGroupsBtn: {
    backgroundColor: '#5a4332',
    borderColor: '#433123',
  },
  dashboardBtn: {
    backgroundColor: '#6b5847',
    borderColor: '#544334',
  },
  toolText: {
    fontSize: Math.min(13.5, SCREEN_WIDTH * 0.036),
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});