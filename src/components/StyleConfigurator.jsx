import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView
} from 'react-native';
import {
  Palette,
  Type,
  Maximize2,
  Code2,
  Check,
  FileCheck,
  SlidersHorizontal
} from 'lucide-react';

const PALETTES = [
  { id: 'blue', name: 'Office Blue', color: '#0078D4', desc: 'Classic Microsoft corporate blue' },
  { id: 'emerald', name: 'Emerald', color: '#059669', desc: 'Fresh modern green accent' },
  { id: 'indigo', name: 'Royal Indigo', color: '#4F46E5', desc: 'Vibrant tech-inspired indigo' },
  { id: 'crimson', name: 'Crimson', color: '#DC2626', desc: 'Bold executive red styling' },
  { id: 'purple', name: 'Deep Purple', color: '#7C3AED', desc: 'Creative modern violet' },
  { id: 'slate', name: 'Modern Slate', color: '#334155', desc: 'Minimalist neutral monochrome' },
];

const FONTS = [
  { id: 'Segoe UI', name: 'Segoe UI', sample: 'Windows 11 Fluent Default' },
  { id: 'Aptos', name: 'Aptos', sample: 'Office 365 Modern Default' },
  { id: 'Calibri', name: 'Calibri', sample: 'Classic Standard Word Font' },
  { id: 'Arial', name: 'Arial', sample: 'Universal Clean Sans-Serif' },
  { id: 'Georgia', name: 'Georgia', sample: 'Elegant Literary Serif' },
];

const MARGIN_OPTIONS = [
  { id: 'normal', name: 'Normal', desc: '1.0 inch all around (Default)' },
  { id: 'narrow', name: 'Narrow', desc: '0.5 inch (Compact layout)' },
  { id: 'moderate', name: 'Moderate', desc: '1.0" top/bottom, 0.75" sides' },
  { id: 'wide', name: 'Wide', desc: '2.0 inch sides (Editorial)' },
];

export default function StyleConfigurator({ options, onOptionsChange }) {
  const updateOption = (key, value) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <SlidersHorizontal size={22} color="#38BDF8" style={{ marginRight: 10 }} />
        <View>
          <Text style={styles.title}>Document Styling & Formatting</Text>
          <Text style={styles.subtitle}>
            Customize heading accent colors, typography, page margins, and code block appearance for Microsoft Word.
          </Text>
        </View>
      </View>

      {/* 1. Accent Palette Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Palette size={16} color="#38BDF8" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Accent Color Palette</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Applies to Heading 1, 2, 3, Table headers, hyperlinks, callout borders, and decorative lines.
        </Text>

        <View style={styles.paletteGrid}>
          {PALETTES.map((pal) => {
            const isSelected = options.palette === pal.id;
            return (
              <Pressable
                key={pal.id}
                onPress={() => updateOption('palette', pal.id)}
                style={({ hovered }) => [
                  styles.paletteCard,
                  isSelected && styles.paletteCardSelected,
                  hovered && styles.cardHovered,
                ]}
              >
                <View style={[styles.colorCircle, { backgroundColor: pal.color }]}>
                  {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.paletteName}>{pal.name}</Text>
                <Text style={styles.paletteDesc}>{pal.desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. Primary Font Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Type size={16} color="#A78BFA" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Typography & Font Family</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Sets the primary document font for paragraphs, headings, and tables in Word.
        </Text>

        <View style={styles.fontGrid}>
          {FONTS.map((f) => {
            const isSelected = options.primaryFont === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => updateOption('primaryFont', f.id)}
                style={({ hovered }) => [
                  styles.fontCard,
                  isSelected && styles.fontCardSelected,
                  hovered && styles.cardHovered,
                ]}
              >
                <View style={styles.fontHeader}>
                  <Text style={[styles.fontName, { fontFamily: f.id }]}>{f.name}</Text>
                  {isSelected && (
                    <View style={styles.activeCheck}>
                      <Check size={12} color="#38BDF8" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text style={styles.fontSample}>{f.sample}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 3. Margins & Spacing */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Maximize2 size={16} color="#34D399" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Page Margins</Text>
        </View>

        <View style={styles.marginRow}>
          {MARGIN_OPTIONS.map((m) => {
            const isSelected = options.margins === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => updateOption('margins', m.id)}
                style={({ hovered }) => [
                  styles.marginCard,
                  isSelected && styles.marginCardSelected,
                  hovered && styles.cardHovered,
                ]}
              >
                <Text style={[styles.marginName, isSelected && styles.marginNameSelected]}>
                  {m.name}
                </Text>
                <Text style={styles.marginDesc}>{m.desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 4. Code Blocks & Headers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Code2 size={16} color="#FBBF24" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Code Blocks & Page Headers</Text>
        </View>

        <View style={styles.toggleRow}>
          <Pressable
            onPress={() =>
              updateOption('codeTheme', options.codeTheme === 'dark' ? 'light' : 'dark')
            }
            style={styles.toggleCard}
          >
            <View>
              <Text style={styles.toggleTitle}>Code Blocks Theme</Text>
              <Text style={styles.toggleDesc}>
                {options.codeTheme === 'dark'
                  ? 'Dark Mode: Onyx background (#0F172A)'
                  : 'Light Mode: Soft gray background (#F8FAFC)'}
              </Text>
            </View>
            <View style={styles.badgeToggle}>
              <Text style={styles.badgeToggleText}>
                {options.codeTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() =>
              updateOption('includeHeaderFooter', !options.includeHeaderFooter)
            }
            style={styles.toggleCard}
          >
            <View>
              <Text style={styles.toggleTitle}>Headers & Footers</Text>
              <Text style={styles.toggleDesc}>
                {options.includeHeaderFooter
                  ? 'Active: Document title in header and "Page X of Y" in footer'
                  : 'Disabled: Clean unnumbered pages'}
              </Text>
            </View>
            <View
              style={[
                styles.badgeToggle,
                options.includeHeaderFooter && styles.badgeToggleActive,
              ]}
            >
              <Text style={styles.badgeToggleText}>
                {options.includeHeaderFooter ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    maxWidth: 820,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paletteCard: {
    width: '31%',
    minWidth: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  paletteCardSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: '#38BDF8',
  },
  cardHovered: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  paletteName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  paletteDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 14,
  },
  fontGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fontCard: {
    width: '48%',
    minWidth: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fontCardSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: '#38BDF8',
  },
  fontHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fontName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  activeCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSample: {
    fontSize: 11,
    color: '#94A3B8',
  },
  marginRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  marginCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  marginCardSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: '#38BDF8',
  },
  marginName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  marginNameSelected: {
    color: '#38BDF8',
  },
  marginDesc: {
    fontSize: 11,
    color: '#94A3B8',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  toggleCard: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 11,
    color: '#94A3B8',
    maxWidth: 240,
  },
  badgeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeToggleActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  badgeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
});
