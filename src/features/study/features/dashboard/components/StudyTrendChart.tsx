import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { StudyTrendPoint } from '../types';
import { colors } from '../../../theme/colors';

interface Props {
  data: StudyTrendPoint[];
}

const CHART_WIDTH = 280;
const CHART_HEIGHT = 100;
const PAD_LEFT = 28;
const PAD_RIGHT = 8;
const PAD_TOP = 8;
const PAD_BOTTOM = 24;

export function StudyTrendChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  const validData = data.map(d => ({
    day: d.day || 'Day',
    hours: isNaN(Number(d.hours)) ? 0 : Number(d.hours)
  }));

  const maxHours = Math.max(0, ...validData.map(d => d.hours));
  const minHours = Math.min(0, ...validData.map(d => d.hours));

  const innerW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const xStep = innerW / (validData.length - 1 || 1);

  const toX = (i: number) => PAD_LEFT + i * xStep;
  const toY = (val: number) => {
    const range = maxHours - minHours || 1;
    return PAD_TOP + innerH - ((val - minHours) / range) * innerH;
  };

  const linePoints = validData.map((d, i) => `${toX(i)},${toY(d.hours)}`).join(' ');

  // Fill area under line
  const areaPoints = [
    `${toX(0)},${PAD_TOP + innerH}`,
    ...validData.map((d, i) => `${toX(i)},${toY(d.hours)}`),
    `${toX(validData.length - 1)},${PAD_TOP + innerH}`,
  ].join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Trend (hrs/day)</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.svg}>
        <Defs>
          <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((t, i) => {
          const y = PAD_TOP + innerH * (1 - t);
          const val = (minHours + t * (maxHours - minHours)).toFixed(1);
          return (
            <React.Fragment key={i}>
              <Line
                x1={PAD_LEFT} y1={y}
                x2={CHART_WIDTH - PAD_RIGHT} y2={y}
                stroke={colors.border} strokeWidth="1" strokeDasharray="3,3"
              />
              <SvgText
                x={PAD_LEFT - 4} y={y + 3}
                fontSize="7" fill={colors.textMuted} textAnchor="end"
              >
                {val}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Fill area */}
        <Polygon points={areaPoints} fill="url(#trendFill)" />

        {/* Line */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots + x-labels */}
        {validData.map((d, i) => (
          <React.Fragment key={i}>
            <Circle
              cx={toX(i)} cy={toY(d.hours)}
              r="3.5"
              fill={colors.cardBg}
              stroke={colors.primary}
              strokeWidth="2"
            />
            <SvgText
              x={toX(i)} y={CHART_HEIGHT - 6}
              fontSize="8" fill={colors.textMuted}
              textAnchor="middle"
            >
              {d.day}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  svg: { alignSelf: 'center' },
});