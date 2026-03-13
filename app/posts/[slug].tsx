import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Platform, View, Text, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import fm from 'front-matter';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { View as CustomView, Text as CustomText } from '@/components/Themed';
import { P } from '@/constants/Palette';

// Index all markdown files in the content directory
const postsContext = (require as any).context('../../content', false, /\.md$/);

export default function PostScreen() {
  const { slug } = useLocalSearchParams();
  const [content, setContent] = useState<string | null>(null);
  const [frontMatter, setFrontMatter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        // Find the file that matches the slug
        const fileName = postsContext.keys().find((key: string) => key.replace('./', '').replace('.md', '') === slug);
        
        if (!fileName) {
          setError(`Post "${slug}" not found.`);
          setLoading(false);
          return;
        }

        const asset = Asset.fromModule(postsContext(fileName));
        await asset.downloadAsync();
        
        const response = await fetch(asset.uri);
        const text = await response.text();
        
        const { attributes, body } = fm<any>(text);
        setFrontMatter(attributes);
        setContent(body);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load post.');
        setLoading(false);
      }
    }

    if (slug) {
      loadPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <CustomView style={styles.container}>
        <ActivityIndicator size="large" color={P.lime} />
      </CustomView>
    );
  }

  if (error || !content) {
    return (
      <CustomView style={styles.container}>
        <CustomText style={styles.errorText}>{error || 'Post not found'}</CustomText>
      </CustomView>
    );
  }

  return (
    <CustomView style={styles.container}>
      <Stack.Screen options={{ title: frontMatter?.title || 'Post' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText style={styles.title}>{frontMatter?.title}</CustomText>
        <CustomText style={styles.date}>{frontMatter?.date}</CustomText>
        
        {Platform.OS === 'web' ? (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {content}
            </ReactMarkdown>
            <style dangerouslySetInnerHTML={{ __html: webStyles }} />
          </div>
        ) : (
          <CustomText style={styles.body}>{content}</CustomText>
        )}
      </ScrollView>
    </CustomView>
  );
}

// Mimic Tailwind's prose/typography look for web
const webStyles = `
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: inherit;
}
.markdown-body h1 { font-size: 2.25em; margin-top: 0; margin-bottom: 0.88em; font-weight: 800; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
.markdown-body h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
.markdown-body p { margin-top: 0; margin-bottom: 1.25em; }
.markdown-body blockquote { margin: 0 0 1.25em; padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; }
.markdown-body ul, .markdown-body ol { margin-top: 0; margin-bottom: 1.25em; padding-left: 2em; }
.markdown-body pre { background-color: #f6f8fa; border-radius: 6px; padding: 16px; overflow: auto; margin-bottom: 1.25em; }
.markdown-body code { background-color: rgba(27,31,35,0.05); border-radius: 3px; font-size: 85%; margin: 0; padding: 0.2em 0.4em; }
.markdown-body img { max-width: 100%; box-sizing: content-box; background-color: #fff; }
.markdown-body hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #e1e4e8; border: 0; }
.markdown-body .katex-display { margin: 1em 0; overflow-x: auto; overflow-y: hidden; }
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  }
});
