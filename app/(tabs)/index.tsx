import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { P } from '@/constants/Palette';

type FontKey = 'SpaceMono' | 'NeuePixelGrotesk';

// Each character mapped to its font — preserves the mixed-font effect
const CHARS: { char: string; font: FontKey }[] = [
  { char: 'R', font: 'SpaceMono' },
  { char: 'I', font: 'SpaceMono' },
  { char: 'S', font: 'SpaceMono' },
  { char: 'H', font: 'SpaceMono' },
  { char: 'i', font: 'SpaceMono' },
  { char: '\n', font: 'SpaceMono' },
  { char: 's', font: 'SpaceMono' },
  { char: 'H', font: 'SpaceMono' },
  { char: 'A', font: 'NeuePixelGrotesk' },
  { char: 'R', font: 'NeuePixelGrotesk' },
  { char: 'M', font: 'NeuePixelGrotesk' },
  { char: 'A', font: 'SpaceMono' },
];

const TYPING_MS = 1000;
const CYCLE_MS  = 5000;
const CHAR_INTERVAL = TYPING_MS / CHARS.length;

// Group consecutive same-font chars into spans for efficient rendering
function getSegments(count: number): { text: string; font: FontKey }[] {
  const segs: { text: string; font: FontKey }[] = [];
  for (const { char, font } of CHARS.slice(0, count)) {
    const last = segs[segs.length - 1];
    if (last && last.font === font) last.text += char;
    else segs.push({ text: char, font });
  }
  return segs;
}

export default function HomeScreen() {
  const [charCount, setCharCount] = useState(0);
  const [cursorOn, setCursorOn]   = useState(true);
  const roleOpacity = useRef(new Animated.Value(0)).current;

  // Typing + repeat cycle
  useEffect(() => {
    let typing: ReturnType<typeof setInterval>;
    let restart: ReturnType<typeof setTimeout>;

    function startCycle() {
      setCharCount(0);
      roleOpacity.setValue(0);
      let n = 0;
      typing = setInterval(() => {
        n += 1;
        setCharCount(n);
        if (n >= CHARS.length) {
          clearInterval(typing);
          // Fade in divider + role immediately once name finishes
          Animated.timing(roleOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
          restart = setTimeout(startCycle, CYCLE_MS - TYPING_MS);
        }
      }, CHAR_INTERVAL);
    }

    startCycle();
    return () => { clearInterval(typing); clearTimeout(restart); };
  }, []);

  // Cursor blink — slightly irregular for a natural feel
  useEffect(() => {
    const id = setInterval(() => setCursorOn(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={s.topRule} />

      <View style={s.container}>
        <Text style={s.label}>HEY, I&apos;M</Text>

        <Text style={s.name}>
          {getSegments(charCount).map((seg, i) => (
            <Text key={i} style={{ fontFamily: seg.font }}>{seg.text}</Text>
          ))}
          {/* Cursor — transparent when off so layout never shifts */}
          <Text style={[s.cursor, { color: cursorOn ? P.lime : 'transparent' }]}>|</Text>
        </Text>

        <Animated.View style={{ opacity: roleOpacity }}>
          <View style={s.divider} />
          <Text style={s.role}>SCIENTIST · DEVELOPER · ARTIST</Text>
        </Animated.View>
      </View>

      <View style={s.bottomBar}>
        <Text style={s.bottomText}>PORTFOLIO 2026</Text>
        <View style={s.bottomDot} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.indigo,
  },
  topRule: {
    height: 4,
    backgroundColor: P.lime,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'web' ? 64 : 40,
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: P.lime,
    letterSpacing: 5,
    marginBottom: 16,
  },
  name: {
    fontFamily: 'SpaceMono',
    fontSize: Platform.OS === 'web' ? 72 : 52,
    fontWeight: '900',
    color: P.white,
    lineHeight: Platform.OS === 'web' ? 78 : 56,
    marginBottom: 24,
  },
  cursor: {
    fontFamily: 'SpaceMono',
    fontWeight: '100',
  },
  divider: {
    height: 4,
    width: 64,
    backgroundColor: P.orange,
    marginBottom: 20,
  },
  role: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: P.orange,
    letterSpacing: 3,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  bottomText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: P.dim,
    letterSpacing: 3,
  },
  bottomDot: {
    width: 8,
    height: 8,
    backgroundColor: P.lime,
  },
});
