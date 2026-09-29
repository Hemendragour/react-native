import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { SubjectShare } from '../types';
import { colors } from '../../../theme/colors';

interface Props {
  data: SubjectShare[];
}

const SIZE = 90;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 32;
const INNER_R = 18;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeSlice(cx: number, cy: number, r: number, innerR: number, startDeg: number, endDeg: number) {
  const start = polarToXY(cx, cy, r, startDeg);
  const end = polarToXY(cx, cy, r, endDeg);
  const iStart = polarToXY(cx, cy, innerR, endDeg);
  const iEnd = polarToXY(cx, cy, innerR, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    `L ${iStart.x} ${iStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${iEnd.x} ${iEnd.y}`,
    'Z',
  ].join(' ');
}

export function SubjectPieChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let currentAngle = 0;

  const slices = data.map((d) => {
    const sliceDeg = (d.value / total) * 360;
    const path = describeSlice(CX, CY, R, INNER_R, currentAngle, currentAngle + sliceDeg);
    currentAngle += sliceDeg;
    return { ...d, path };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject Split</Text>
      <View style={styles.inner}>
        <Svg width={SIZE} height={SIZE}>
          {slices.map((s, i) => (
            <Path key={i} d={s.path} fill={s.color} />
          ))}
          <Circle cx={CX} cy={CY} r={INNER_R - 1} fill={colors.surface} />
        </Svg>
        <View style={styles.legend}>
          {data.map((d, i) => (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: d.color }]} />
              <Text style={styles.legendLabel}>{d.name}</Text>
              <Text style={styles.legendVal}>{d.value}%</Text>
            </View>
          ))}
        </View>
      </View>
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
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  legendVal: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
});