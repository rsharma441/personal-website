import { StyleSheet, View, Text, Linking, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { P } from '@/constants/Palette';

type LinkItem = {
  index: string;
  label: string;
  sublabel: string;
  url: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

// ── Link data ──────────────────────────────────────────────────────────────────
const L: Record<string, LinkItem> = {
  github:   { index: '01', label: 'GITHUB',        sublabel: 'CODE & PROJECTS',        url: 'https://github.com/rsharma441',                                                        color: P.orange, icon: 'logo-github'          },
  linkedin: { index: '02', label: 'LINKEDIN',      sublabel: 'PROFESSIONAL STUFF',      url: 'https://www.linkedin.com/in/rsharma441/',                                             color: P.lime,   icon: 'logo-linkedin'        },
  email:    { index: '03', label: 'EMAIL',          sublabel: 'SAY HELLO',               url: 'mailto:rsharma441@gmail.com',                                                         color: P.white,  icon: 'mail-outline'         },
  research: { index: '04', label: 'RESEARCH',       sublabel: 'PUBLICATIONS & WRITING',  url: 'https://aclanthology.org/P18-2119.pdf',                                               color: P.lime,   icon: 'library-outline'      },
  blog:     { index: '05', label: 'BLOG',           sublabel: 'THOUGHTS & RANDOMNESS',   url: 'https://substack.com/@rsharma441',                                                    color: P.pink,   icon: 'newspaper-outline'    },
  resume:   { index: '06', label: 'RESUME',         sublabel: 'CV & EXPERIENCE',         url: 'https://drive.google.com/file/d/1VdF8xls2-GP77NrnDk3TpNE6dND8i9hI/view?usp=sharing', color: P.pink,   icon: 'document-text-outline'}, 
  music:    { index: '07', label: 'MUSIC REVIEWS',  sublabel: 'MUSICAL THOUGHTS',        url: 'https://rsharma441.github.io/',                                                   color: P.white,  icon: 'musical-notes-outline'},
};

// ── Hero card (full-width) ─────────────────────────────────────────────────────
function HeroCard({ link }: { link: LinkItem }) {
  return (
    <Pressable onPress={() => Linking.openURL(link.url)}>
      {({ pressed }) => (
        <View style={[s.hero, { borderColor: link.color }, pressed && { backgroundColor: link.color }]}>
          {/* Giant watermark index */}
          <Text style={[s.watermark, { color: pressed ? P.indigo : link.color }]}>
            {link.index}
          </Text>
          <View style={s.heroBody}>
            {/* Icon + label row */}
            <View style={s.labelRow}>
              <Ionicons
                name={link.icon}
                size={20}
                color={pressed ? P.indigo : P.white}
              />
              <Text style={[s.cardLabel, { color: pressed ? P.indigo : P.white }]}>
                {link.label}
              </Text>
            </View>
            <Text style={[s.cardSub, { color: pressed ? P.indigo : link.color }]}>
              {link.sublabel}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

// ── Compact card (half-width in a pair) ───────────────────────────────────────
function CompactCard({ link }: { link: LinkItem }) {
  return (
    <Pressable style={s.compactOuter} onPress={() => Linking.openURL(link.url)}>
      {({ pressed }) => (
        <View style={[s.compact, { borderColor: link.color }, pressed && { backgroundColor: link.color }]}>
          <Text style={[s.watermark, { color: pressed ? P.indigo : link.color }]}>
            {link.index}
          </Text>
          <View style={s.compactBody}>
            <Ionicons
              name={link.icon}
              size={20}
              color={pressed ? P.indigo : P.white}
            />
            <Text style={[s.cardLabel, { color: pressed ? P.indigo : P.white }]}>
              {link.label}
            </Text>
          </View>
          <Text style={[s.cardSub, { color: pressed ? P.indigo : link.color }]}>
            {link.sublabel}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function LinksScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={s.header}>
        <Text style={s.headerLabel}>03 / LINKS</Text>
        <Text style={s.headerTitle}>FIND{'\n'}ME.</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>

          {/* 01 GitHub — hero */}
          <HeroCard link={L.github} />

          {/* 02 LinkedIn + 03 Email — pair */}
          <View style={s.pair}>
            <CompactCard link={L.linkedin} />
            <CompactCard link={L.email} />
          </View>

          {/* 05 Blog — hero */}
          <HeroCard link={L.blog} />

          {/* 04 Research + 06 Resume — pair */}
          <View style={s.pair}>
            <CompactCard link={L.research} />
            <CompactCard link={L.resume} />
          </View>

          {/* 07 Music Reviews — hero */}
          <HeroCard link={L.music} />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.indigo,
  },

  header: {
    backgroundColor: P.orange,
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

  scroll: { flex: 1 },
  grid: {
    padding: 12,
    gap: 8,
  },

  // ── Shared watermark (big faded index number) ──────────────────────────────
  watermark: {
    position: 'absolute',
    top: -10,
    right: 10,
    fontFamily: 'SpaceMono',
    fontSize: 72,
    fontWeight: '900',
    opacity: 0.11,
    transform: [{ rotate: '-6deg' }],
  },

  // ── Shared label / sub / arrow ─────────────────────────────────────────────
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardSub: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    letterSpacing: 2,
  },
  // ── Hero card ──────────────────────────────────────────────────────────────
  hero: {
    borderWidth: 2,
    paddingHorizontal: 18,
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  heroBody: {
    flex: 1,
  },

  // ── Compact card ───────────────────────────────────────────────────────────
  pair: {
    flexDirection: 'row',
    gap: 8,
  },
  compactOuter: {
    flex: 1,
  },
  compact: {
    borderWidth: 2,
    padding: 14,
    overflow: 'hidden',
    height: 88,
    justifyContent: 'flex-end',
    gap: 4,
  },
  compactBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 2,
  },
});
