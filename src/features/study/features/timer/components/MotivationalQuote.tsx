import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

const QUOTES = [
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
];

// Pick a quote based on the day so it changes daily but stays stable
const todayQuote = QUOTES[new Date().getDay() % QUOTES.length];

export function MotivationalQuote() {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>💡</Text>
      <Text style={styles.quote}>"{todayQuote.text}"</Text>
      <Text style={styles.author}>— {todayQuote.author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderBrown,
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 22,
    marginBottom: 8,
  },
  quote: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 6,
  },
  author: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
});