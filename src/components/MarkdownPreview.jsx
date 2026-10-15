import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native';
import { marked } from 'marked';
import { FileCode, FileText, Sparkles, ArrowRight } from 'lucide-react';

const PALETTE_COLORS = {
  blue: { primary: '#0078D4', bg: '#EFF6FC', border: '#D2E3F8' },
  emerald: { primary: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  indigo: { primary: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
  crimson: { primary: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  purple: { primary: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  slate: { primary: '#334155', bg: '#F8FAFC', border: '#E2E8F0' },
};

export default function MarkdownPreview({
  file,
  options,
  onConvert
}) {
  const markdownText = file?.content || '# No file loaded\n\nSelect a Markdown file to view its live preview.';

  // Parse Markdown into HTML for document simulator
  const htmlContent = useMemo(() => {
    try {
      return marked.parse(markdownText, { gfm: true, breaks: true });
    } catch (e) {
      return '<p>Error rendering preview</p>';
    }
  }, [markdownText]);

  const activeColor = PALETTE_COLORS[options.palette] || PALETTE_COLORS.blue;

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle}>
            Live Document Simulation: {file?.fileName || 'Preview'}
          </Text>
          <Text style={styles.bannerSub}>
            Font: {options.primaryFont} • Theme: {options.palette} • Margins: {options.margins}
          </Text>
        </View>

        {file && (
          <Pressable
            onPress={onConvert}
            style={({ pressed, hovered }) => [
              styles.convertBtn,
              hovered && styles.convertBtnHover,
              pressed && styles.btnPressed,
            ]}
          >
            <Sparkles size={15} color="#0A0F1D" style={{ marginRight: 6 }} />
            <Text style={styles.convertBtnText}>Convert to Word</Text>
            <ArrowRight size={15} color="#0A0F1D" style={{ marginLeft: 6 }} />
          </Pressable>
        )}
      </View>

      {/* Split Views */}
      <View style={styles.splitPane}>
        {/* Left: Raw Markdown View */}
        <View style={styles.leftPane}>
          <View style={styles.paneHeader}>
            <FileCode size={14} color="#38BDF8" style={{ marginRight: 6 }} />
            <Text style={styles.paneHeaderText}>Markdown Source Code</Text>
          </View>
          <ScrollView style={styles.codeScroll} contentContainerStyle={styles.codeContent}>
            <Text style={styles.rawText}>{markdownText}</Text>
          </ScrollView>
        </View>

        {/* Right: Word Document Page Simulator */}
        <View style={styles.rightPane}>
          <View style={styles.paneHeader}>
            <FileText size={14} color="#34D399" style={{ marginRight: 6 }} />
            <Text style={styles.paneHeaderText}>Word (.docx) Layout Simulation</Text>
          </View>

          <ScrollView style={styles.pageScroll} contentContainerStyle={styles.pageScrollContent}>
            {/* Simulated Word Sheet */}
            <View
              style={[
                styles.wordSheet,
                {
                  fontFamily: options.primaryFont,
                },
              ]}
            >
              {options.includeHeaderFooter && (
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetHeaderText}>
                    {options.title || file?.fileName || 'Markdown Document'}
                  </Text>
                </View>
              )}

              {/* Injected HTML Preview */}
              <div
                className="word-doc-preview"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{
                  '--theme-primary': activeColor.primary,
                  '--theme-bg': activeColor.bg,
                  '--theme-border': activeColor.border,
                  fontFamily: options.primaryFont,
                  color: '#1E293B',
                  lineHeight: 1.6,
                }}
              />

              {options.includeHeaderFooter && (
                <View style={styles.sheetFooter}>
                  <Text style={styles.sheetFooterText}>Page 1 of 1</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Embedded CSS for realistic Word document simulation */}
      <style>{`
        .word-doc-preview h1 {
          color: var(--theme-primary);
          font-size: 26px;
          margin-top: 16px;
          margin-bottom: 8px;
          border-bottom: 2px solid var(--theme-border);
          padding-bottom: 6px;
          font-weight: 700;
        }
        .word-doc-preview h2 {
          color: var(--theme-primary);
          font-size: 20px;
          margin-top: 18px;
          margin-bottom: 6px;
          font-weight: 700;
        }
        .word-doc-preview h3 {
          color: #334155;
          font-size: 16px;
          margin-top: 14px;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .word-doc-preview p {
          margin-bottom: 10px;
          font-size: 13px;
          color: #1E293B;
        }
        .word-doc-preview ul, .word-doc-preview ol {
          margin-left: 20px;
          margin-bottom: 12px;
          font-size: 13px;
        }
        .word-doc-preview li {
          margin-bottom: 4px;
        }
        .word-doc-preview code {
          background-color: #F1F5F9;
          color: #BE185D;
          padding: 2px 5px;
          border-radius: 4px;
          font-family: Consolas, monospace;
          font-size: 12px;
        }
        .word-doc-preview pre {
          background-color: #0F172A;
          color: #F1F5F9;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 12px;
          border-left: 4px solid var(--theme-primary);
        }
        .word-doc-preview pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
        .word-doc-preview blockquote {
          border-left: 4px solid var(--theme-primary);
          background-color: #F8FAFC;
          padding: 10px 14px;
          margin: 12px 0;
          border-radius: 0 6px 6px 0;
          color: #475569;
          font-style: italic;
        }
        .word-doc-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          font-size: 12px;
        }
        .word-doc-preview th {
          background-color: var(--theme-primary);
          color: #FFFFFF;
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
        }
        .word-doc-preview td {
          border: 1px solid var(--theme-border);
          padding: 7px 10px;
        }
        .word-doc-preview tr:nth-child(even) td {
          background-color: #F8FAFC;
        }
      `}</style>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  bannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  convertBtnHover: {
    backgroundColor: '#7DD3FC',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  convertBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0F1D',
  },
  splitPane: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPane: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(10, 15, 29, 0.6)',
  },
  rightPane: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
  },
  paneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  paneHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  codeScroll: {
    flex: 1,
  },
  codeContent: {
    padding: 16,
  },
  rawText: {
    fontFamily: 'Consolas, monospace',
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  wordSheet: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 28,
    minHeight: 650,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  sheetHeader: {
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
    marginBottom: 16,
  },
  sheetHeaderText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  sheetFooter: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 24,
  },
  sheetFooterText: {
    fontSize: 10,
    color: '#94A3B8',
  },
});
