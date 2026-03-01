import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  Animated,
  Modal,
} from 'react-native';
import { P } from '@/constants/Palette';
import { INTERESTS, CATEGORY_COLORS, Interest } from '@/constants/interests';

// ── Axis definitions ──────────────────────────────────────────────────────────
const AXES = [
  { key: 'e_d' as const, low: 'EXPLORE',  high: 'DEPTH',      full: 'EXPLORATION — DEPTH' },
  { key: 'i_c' as const, low: 'SOLO',     high: 'COLLECTIVE', full: 'INDIVIDUAL — COLLECTIVE' },
  { key: 'a_c' as const, low: 'ABSTRACT', high: 'CONCRETE',   full: 'ABSTRACT — CONCRETE' },
];

// ── Constants ─────────────────────────────────────────────────────────────────
const DOT_R  = 4;
const PAD    = 28;
const CENTER = 5;   // score value → plot center (the zero line)
const RANGE  = 5;   // half-range: scores 1–10 → −4 to +5 about center
const ALL_CATS = Object.keys(CATEGORY_COLORS);

// ── Deterministic decimal noise ───────────────────────────────────────────────
function hashNoise(name: string, axis: string): number {
  let h = 0;
  const key = name + axis;
  for (let i = 0; i < key.length; i++) h = ((h * 31 + key.charCodeAt(i)) >>> 0);
  return ((h % 700) - 350) / 1000; // ±0.35
}

const NOISY = INTERESTS.map(pt => ({
  ...pt,
  e_d: pt.e_d + hashNoise(pt.name, 'e_d'),
  i_c: pt.i_c + hashNoise(pt.name, 'i_c'),
  a_c: pt.a_c + hashNoise(pt.name, 'a_c'),
}));

// ── Component ─────────────────────────────────────────────────────────────────
export default function InterestMap() {
  const [selAxes,    setSelAxes]    = useState([0, 1]);
  const [plotW,      setPlotW]      = useState(0);
  const [selected,   setSelected]   = useState<Interest | null>(null);
  const [activeCats, setActiveCats] = useState<Set<string>>(() => new Set(['Music', 'Professional']));

  const is2D  = selAxes.length === 2;
  const axisX = AXES[selAxes[0]];
  const axisY = is2D ? AXES[selAxes[1]] : null;
  const plotH = plotW;
  const showLbls = activeCats.size <= 3;

  // One Animated.ValueXY per dot — stable refs, never recreated
  const dotPos = useRef(NOISY.map(() => new Animated.ValueXY())).current;
  const hasInit = useRef(false);

  // ── 4-quadrant coordinate helpers ──────────────────────────────────────────
  function cx(score: number): number {
    const half = (plotW - PAD * 2) / 2;
    return plotW / 2 + ((score - CENTER) / RANGE) * half;
  }
  function cy(score: number): number {
    const half = (plotH - PAD * 2) / 2;
    return plotH / 2 - ((score - CENTER) / RANGE) * half;
  }
  // In 1D mode dots spread vertically around the horizontal center line
  function cy1D(idx: number): number {
    const lane = idx % 9;
    const half = (plotH - PAD * 2) / 2;
    return plotH / 2 + (lane / 8 - 0.5) * half * 0.65;
  }

  function computeTargets() {
    return NOISY.map((pt, idx) => ({
      x: cx(pt[axisX.key]),
      y: is2D && axisY ? cy(pt[axisY.key]) : cy1D(idx),
    }));
  }

  // ── Animate dots to new positions (or snap on first layout) ────────────────
  useEffect(() => {
    if (plotW === 0) return;
    const T = computeTargets();
    if (!hasInit.current) {
      T.forEach((t, i) => dotPos[i].setValue(t));
      hasInit.current = true;
      return;
    }
    Animated.parallel(
      NOISY.map((_, i) =>
        Animated.parallel([
          Animated.timing(dotPos[i].x, { toValue: T[i].x, duration: 380, useNativeDriver: false }),
          Animated.timing(dotPos[i].y, { toValue: T[i].y, duration: 380, useNativeDriver: false }),
        ])
      )
    ).start();
  }, [plotW, selAxes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Axis toggle ─────────────────────────────────────────────────────────────
  function toggleAxis(i: number) {
    let next: number[];
    if (selAxes.includes(i)) {
      if (selAxes.length <= 1) return;
      next = selAxes.filter(a => a !== i);
    } else {
      next = selAxes.length < 2 ? [...selAxes, i] : [selAxes[1], i];
    }
    setSelAxes(next);
  }

  // ── Category filter ─────────────────────────────────────────────────────────
  function toggleCat(cat: string) {
    setActiveCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <Text style={s.sectionLabel}>// INTEREST MAP</Text>

      {/* Axis selector */}
      <View style={s.axisRow}>
        {AXES.map((ax, i) => {
          const active = selAxes.includes(i);
          const role   = is2D && active ? (selAxes[0] === i ? ' [X]' : ' [Y]') : '';
          return (
            <Pressable key={i} onPress={() => toggleAxis(i)} style={[s.axisBtn, active && s.axisBtnActive]}>
              <Text style={[s.axisBtnTxt, active && s.axisBtnTxtActive]} numberOfLines={2}>
                {ax.full}{role}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Category filter — above the plot */}
      <View style={s.filterHeader}>
        <Text style={s.sectionLabel}>// CATEGORIES</Text>
        <View style={s.filterActions}>
          <Pressable onPress={() => setActiveCats(new Set(ALL_CATS))} style={s.filterBtn}>
            <Text style={s.filterBtnTxt}>ALL</Text>
          </Pressable>
          <Pressable onPress={() => setActiveCats(new Set())} style={s.filterBtn}>
            <Text style={s.filterBtnTxt}>NONE</Text>
          </Pressable>
        </View>
      </View>

      <View style={s.legend}>
        {ALL_CATS.map(cat => {
          const color  = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
          const active = activeCats.has(cat);
          return (
            <Pressable key={cat} onPress={() => toggleCat(cat)} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: active ? color : 'transparent', borderColor: active ? color : P.dim }]} />
              <Text style={[s.legendLabel, { color: active ? P.white : P.dim }]}>{cat}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Square plot — fixed size */}
      <View
        style={s.plotOuter}
        onLayout={(e: LayoutChangeEvent) => setPlotW(e.nativeEvent.layout.width)}
      >
        {plotW > 0 && (
          <Animated.View style={StyleSheet.absoluteFillObject}>
            {/* 4-quadrant crosshair */}
            <View style={[s.crossLine, { top: plotH / 2, left: PAD, right: PAD, height: 1 }]} />
            <View style={[s.crossLine, { left: plotW / 2, top: PAD, bottom: PAD, width: 1 }]} />

            {/* Axis endpoint labels */}
            <Text style={[s.endLabel, { top: plotH / 2 + 5, left: PAD }]}>{axisX.low}</Text>
            <Text style={[s.endLabel, { top: plotH / 2 + 5, right: PAD }]}>{axisX.high}</Text>
            {is2D && axisY && (
              <>
                <Text style={[s.endLabel, { top: PAD,      left: plotW / 2 + 5 }]}>{axisY.high}</Text>
                <Text style={[s.endLabel, { bottom: PAD,   left: plotW / 2 + 5 }]}>{axisY.low}</Text>
              </>
            )}

            {/* Dots */}
            {NOISY.map((pt, idx) => {
              const color   = CATEGORY_COLORS[pt.category] ?? P.dim;
              const isSel   = selected?.name === pt.name;
              const visible = activeCats.has(pt.category);
              return (
                <Animated.View
                  key={pt.name}
                  pointerEvents={visible ? 'auto' : 'none'}
                  style={{
                    position:        'absolute',
                    left:            Animated.subtract(dotPos[idx].x, DOT_R),
                    top:             Animated.subtract(dotPos[idx].y, DOT_R),
                    width:           DOT_R * 2,
                    height:          DOT_R * 2,
                    borderRadius:    DOT_R,
                    backgroundColor: color,
                    opacity:         visible ? (isSel ? 1 : 0.78) : 0,
                    zIndex:          isSel ? 10 : 1,
                    borderWidth:     isSel ? 2 : 0,
                    borderColor:     P.white,
                  }}
                >
                  <Pressable
                    hitSlop={8}
                    onPress={() => setSelected(isSel ? null : pt)}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {showLbls && (
                    <Text style={[s.dotLabel, { color }]} numberOfLines={1}>
                      {pt.name}
                    </Text>
                  )}
                </Animated.View>
              );
            })}
          </Animated.View>
        )}
      </View>

      {/* Dot detail modal */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            {selected && (
              <>
                <Text style={[s.modalCat, { color: CATEGORY_COLORS[selected.category] ?? P.lime }]}>
                  {selected.category.toUpperCase()}
                </Text>
                <Text style={s.modalName}>{selected.name}</Text>
                {selected.examples && (
                  <Text style={s.modalExamples}>{selected.examples}</Text>
                )}
                <Pressable onPress={() => setSelected(null)} style={s.modalClose}>
                  <Text style={s.modalCloseTxt}>CLOSE ×</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { gap: 12 },

  sectionLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: P.pink,
    letterSpacing: 2,
  },

  // Axis selector
  axisRow: { flexDirection: 'row', gap: 8 },
  axisBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: P.indigo2,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  axisBtnActive:    { borderColor: P.pink, backgroundColor: P.pink },
  axisBtnTxt:       { fontFamily: 'SpaceMono', fontSize: 8, color: P.dim, textAlign: 'center', letterSpacing: 1 },
  axisBtnTxtActive: { color: P.indigo },

  // Plot — square (aspectRatio: 1)
  plotOuter: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: P.indigo2,
    overflow: 'hidden',
  },
  crossLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  endLabel: {
    position: 'absolute',
    fontFamily: 'SpaceMono',
    fontSize: 7,
    color: P.dim,
    letterSpacing: 1,
  },
  dotLabel: {
    position: 'absolute',
    left: DOT_R * 2 + 3,
    top: -4,
    fontFamily: 'SpaceMono',
    fontSize: 7,
    maxWidth: 120,
    letterSpacing: 0.3,
  },

  // Category filter
  filterHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterActions: { flexDirection: 'row', gap: 8 },
  filterBtn:     { borderWidth: 1, borderColor: P.indigo2, paddingHorizontal: 10, paddingVertical: 4 },
  filterBtnTxt:  { fontFamily: 'SpaceMono', fontSize: 9, color: P.dim },

  // Legend / category chips
  legend:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:   { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  legendLabel: { fontFamily: 'SpaceMono', fontSize: 8 },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    backgroundColor: P.indigo2,
    borderWidth: 2,
    borderColor: P.pink,
    padding: 24,
    gap: 10,
  },
  modalCat: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 3,
  },
  modalName: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '900',
    color: P.white,
    letterSpacing: 0.5,
  },
  modalExamples: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  modalClose: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  modalCloseTxt: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: P.dim,
    letterSpacing: 2,
  },
});
