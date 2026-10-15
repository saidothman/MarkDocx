import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable
} from 'react-native';
import {
  FileText,
  Hash,
  Code2,
  Table as TableIcon,
  CheckSquare,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  FileCheck2
} from 'lucide-react';

export default function FileDetailsCard({
  file,
  options,
  onConvert,
  onReset,
  onPreview
}) {
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Safe properties extraction
  const fileName = file?.fileName || 'Document.md';
  const filePath = file?.filePath || fileName;
  const content = typeof file?.content === 'string' ? file.content : (file?.content ? String(file.content) : '');
  const size = typeof file?.size === 'number' ? file.size : 0;
  const fileSizeKb = (size / 1024).toFixed(1);
  const targetDocxName = fileName.replace(/\.(md|markdown|mdown|mkd|txt)$/i, '') + '.docx';

  // Markdown structural analysis
  const lines = content ? content.split('\n').length : 0;
  const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const headings = content ? (content.match(/^#{1,6}\s+.+$/gm) || []).length : 0;
  const codeBlocks = content ? (content.match(/```[\s\S]*?```/g) || []).length : 0;
  const tables = content && (content.match(/\|.+\|/g) || []).length > 1 ? 1 : 0;
  const tasks = content ? (content.match(/^(\s*)-\s+\[[ xX]\]/gm) || []).length : 0;

  useEffect(() => {
    // Spring entrance animation
    Animated.parallel([
      Animated.timing(entranceAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: false,
      }),
    ]).start();

    // Pulse animation for action button
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [file]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: entranceAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        {/* Header Ribbon */}
        <View style={styles.header}>
          <View style={styles.fileIconBox}>
            <FileText size={28} color="#38BDF8" strokeWidth={2} />
          </View>
          <View style={styles.fileInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.fileName} numberOfLines={1}>
                {fileName}
              </Text>
              <View style={styles.badgeReady}>
                <Text style={styles.badgeReadyText}>Ready to Convert</Text>
              </View>
            </View>
            <Text style={styles.filePath} numberOfLines={1}>
              {filePath}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>Size: {fileSizeKb} KB</Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaItem}>{lines} lines</Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaItem}>{words} words</Text>
            </View>
          </View>
        </View>

        {/* Content Analysis Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Hash size={16} color="#38BDF8" />
            <Text style={styles.statValue}>{headings}</Text>
            <Text style={styles.statLabel}>Headings</Text>
          </View>

          <View style={styles.statBox}>
            <Code2 size={16} color="#A78BFA" />
            <Text style={styles.statValue}>{codeBlocks}</Text>
            <Text style={styles.statLabel}>Code Blocks</Text>
          </View>

          <View style={styles.statBox}>
            <TableIcon size={16} color="#34D399" />
            <Text style={styles.statValue}>{tables ? 'Present' : 'None'}</Text>
            <Text style={styles.statLabel}>Tables</Text>
          </View>

          <View style={styles.statBox}>
            <CheckSquare size={16} color="#FBBF24" />
            <Text style={styles.statValue}>{tasks}</Text>
            <Text style={styles.statLabel}>Task Items</Text>
          </View>
        </View>

        {/* Target Output Preview */}
        <View style={styles.outputTargetBox}>
          <View style={styles.targetIcon}>
            <FileCheck2 size={18} color="#60A5FA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.targetLabel}>Target Word Document:</Text>
            <Text style={styles.targetName} numberOfLines={1}>
              {targetDocxName}
            </Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={onConvert}
              style={({ pressed, hovered }) => [
                styles.convertButton,
                hovered && styles.convertButtonHover,
                pressed && styles.buttonPressed,
              ]}
            >
              <Sparkles size={18} color="#0A0F1D" style={{ marginRight: 8 }} />
              <Text style={styles.convertButtonText}>Convert to Word (.docx)</Text>
              <ArrowRight size={18} color="#0A0F1D" style={{ marginLeft: 8 }} />
            </Pressable>
          </Animated.View>

          <View style={styles.secondaryActions}>
            <Pressable
              onPress={onPreview}
              style={({ pressed, hovered }) => [
                styles.iconButton,
                hovered && styles.iconButtonHover,
                pressed && styles.buttonPressed,
              ]}
            >
              <Eye size={16} color="#94A3B8" style={{ marginRight: 6 }} />
              <Text style={styles.iconButtonText}>Preview</Text>
            </Pressable>

            <Pressable
              onPress={onReset}
              style={({ pressed, hovered }) => [
                styles.iconButton,
                hovered && styles.iconButtonHover,
                pressed && styles.buttonPressed,
              ]}
            >
              <RefreshCw size={16} color="#94A3B8" style={{ marginRight: 6 }} />
              <Text style={styles.iconButtonText}>Choose Another</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 680,
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fileIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  fileInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 12,
  },
  badgeReady: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  badgeReadyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34D399',
  },
  filePath: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metaDivider: {
    fontSize: 12,
    color: '#475569',
    marginHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  outputTargetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  targetIcon: {
    marginRight: 12,
  },
  targetLabel: {
    fontSize: 11,
    color: '#93C5FD',
    fontWeight: '600',
    marginBottom: 2,
  },
  targetName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  convertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  convertButtonHover: {
    backgroundColor: '#7DD3FC',
  },
  convertButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0F1D',
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
