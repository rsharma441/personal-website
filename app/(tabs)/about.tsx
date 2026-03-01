import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { P } from '@/constants/Palette';
import InterestMap from '@/components/InterestMap';
import { INTERESTS, CATEGORY_COLORS } from '@/constants/interests';

function BioWithCyclingInterest() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * INTERESTS.length));

  useEffect(() => {
    const id = setInterval(() => {
      setIdx(Math.floor(Math.random() * INTERESTS.length));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const interest = INTERESTS[idx];
  const color = CATEGORY_COLORS[interest.category as keyof typeof CATEGORY_COLORS] ?? P.lime;

  return (
    <View style={s.bioBorder}>
      <Text style={s.bioText}>
        {'I try to understand how things work — not just machines or systems, but people, art, and the quiet patterns of nature. When structure and feeling sit at the same table, that is when I feel most at peace. And if the table turns into a dance floor, I will happily test the geometry there too.\n\nBelow is a plot of some of my interests across different axes — find things like '}
        <Text style={[s.bioText, { color, fontWeight: 'bold' }]}>
          {interest.name.toUpperCase()}
        </Text>
        {' and more.'}
      </Text>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Lime header block */}
        <View style={s.header}>
          <Text style={s.headerLabel}>02 / ABOUT</Text>
          <Text style={s.headerTitle}>WHO{'\n'}AM I.</Text>
        </View>

        <View style={s.body}>
          {/* Bio + cycling interest blurb — same block, same border */}
          <BioWithCyclingInterest />

          {/* Interest Map */}
          <InterestMap />

          {/* Manifesto block */}
          <View style={s.manifestoBlock}>
            <Text style={s.manifestoText}>
              &ldquo;Make it rigorous. Make it beautiful.&rdquo;
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.indigo,
  },
  header: {
    backgroundColor: P.lime,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 28,
  },
  headerLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: P.indigo,
    letterSpacing: 4,
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 52,
    fontWeight: '900',
    color: P.indigo,
    lineHeight: 54,
  },
  body: {
    padding: 28,
    gap: 28,
  },
  bioBorder: {
    borderLeftWidth: 4,
    borderLeftColor: P.orange,
    paddingLeft: 20,
  },
  bioText: {
    fontFamily: 'SpaceMono',
    fontSize: 15,
    color: P.white,
    lineHeight: 26,
  },
  manifestoBlock: {
    backgroundColor: P.indigo2,
    borderLeftWidth: 4,
    borderLeftColor: P.lime,
    padding: 24,
  },
  manifestoText: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    color: P.lime,
    lineHeight: 32,
    fontWeight: 'bold',
  },
});
