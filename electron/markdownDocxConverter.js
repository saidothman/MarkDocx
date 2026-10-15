const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ExternalHyperlink,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip
} = require('docx');
const { marked } = require('marked');

// Preset colors
const PALETTES = {
  blue: {
    name: 'Office Blue',
    primary: '0078D4',
    secondary: '2B88D8',
    dark: '106EBE',
    light: 'EFF6FC',
    tableHeader: '0078D4',
    tableHeaderText: 'FFFFFF',
    border: 'D2E3F8'
  },
  emerald: {
    name: 'Emerald Green',
    primary: '059669',
    secondary: '10B981',
    dark: '047857',
    light: 'ECFDF5',
    tableHeader: '059669',
    tableHeaderText: 'FFFFFF',
    border: 'A7F3D0'
  },
  indigo: {
    name: 'Royal Indigo',
    primary: '4F46E5',
    secondary: '6366F1',
    dark: '4338CA',
    light: 'EEF2FF',
    tableHeader: '4F46E5',
    tableHeaderText: 'FFFFFF',
    border: 'C7D2FE'
  },
  crimson: {
    name: 'Crimson Red',
    primary: 'DC2626',
    secondary: 'EF4444',
    dark: 'B91C1C',
    light: 'FEF2F2',
    tableHeader: 'DC2626',
    tableHeaderText: 'FFFFFF',
    border: 'FECACA'
  },
  purple: {
    name: 'Deep Purple',
    primary: '7C3AED',
    secondary: '8B5CF6',
    dark: '6D28D9',
    light: 'F5F3FF',
    tableHeader: '7C3AED',
    tableHeaderText: 'FFFFFF',
    border: 'DDD6FE'
  },
  slate: {
    name: 'Modern Slate',
    primary: '334155',
    secondary: '475569',
    dark: '1E293B',
    light: 'F8FAFC',
    tableHeader: '334155',
    tableHeaderText: 'FFFFFF',
    border: 'E2E8F0'
  }
};

const MARGIN_CONFIG = {
  normal: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch
  narrow: { top: 720, bottom: 720, left: 720, right: 720 },       // 0.5 inch
  moderate: { top: 1440, bottom: 1440, left: 1080, right: 1080 }, // 0.75 inch sides
  wide: { top: 1440, bottom: 1440, left: 2880, right: 2880 }     // 2 inch sides
};

/**
 * Recursively parses marked inline tokens into docx TextRun or ExternalHyperlink
 */
function parseInlineTokens(tokens, options = {}) {
  const runs = [];
  const primaryFont = options.primaryFont || 'Segoe UI';
  const codeFont = options.codeFont || 'Consolas';
  const defaultSize = options.size || 22; // 11pt = 22 half-points
  const defaultColor = options.color || '1F2937';

  if (!tokens || !tokens.length) return runs;

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        if (token.tokens && token.tokens.length > 0) {
          runs.push(...parseInlineTokens(token.tokens, options));
        } else {
          runs.push(
            new TextRun({
              text: token.text,
              font: primaryFont,
              size: defaultSize,
              color: defaultColor,
              bold: options.bold,
              italics: options.italics,
              strike: options.strike
            })
          );
        }
        break;

      case 'strong':
        runs.push(
          ...parseInlineTokens(token.tokens, {
            ...options,
            bold: true
          })
        );
        break;

      case 'em':
        runs.push(
          ...parseInlineTokens(token.tokens, {
            ...options,
            italics: true
          })
        );
        break;

      case 'codespan':
        runs.push(
          new TextRun({
            text: ` ${token.text} `,
            font: codeFont,
            size: Math.max(18, defaultSize - 2),
            color: 'BE185D', // modern crimson code text
            shading: {
              type: ShadingType.CLEAR,
              fill: 'F1F5F9',
              color: 'auto'
            }
          })
        );
        break;

      case 'del':
        runs.push(
          ...parseInlineTokens(token.tokens, {
            ...options,
            strike: true
          })
        );
        break;

      case 'link': {
        const linkRuns = parseInlineTokens(token.tokens, {
          ...options,
          color: options.palette?.primary || '0078D4',
          underline: true
        });
        runs.push(
          new ExternalHyperlink({
            children: linkRuns,
            link: token.href
          })
        );
        break;
      }

      case 'br':
        runs.push(
          new TextRun({
            text: '\n',
            break: 1
          })
        );
        break;

      case 'escape':
        runs.push(
          new TextRun({
            text: token.text,
            font: primaryFont,
            size: defaultSize,
            color: defaultColor,
            bold: options.bold,
            italics: options.italics
          })
        );
        break;

      default:
        if (token.text) {
          runs.push(
            new TextRun({
              text: token.text,
              font: primaryFont,
              size: defaultSize,
              color: defaultColor,
              bold: options.bold,
              italics: options.italics
            })
          );
        }
        break;
    }
  }

  return runs;
}

/**
 * Convert Markdown AST tokens to docx Paragraphs and Tables
 */
function convertTokensToDocx(tokens, options) {
  const elements = [];
  const palette = options.palette || PALETTES.blue;
  const primaryFont = options.primaryFont || 'Segoe UI';
  const codeFont = options.codeFont || 'Consolas';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'heading': {
        const headingLevels = {
          1: HeadingLevel.HEADING_1,
          2: HeadingLevel.HEADING_2,
          3: HeadingLevel.HEADING_3,
          4: HeadingLevel.HEADING_4,
          5: HeadingLevel.HEADING_5,
          6: HeadingLevel.HEADING_6
        };

        const headingSizes = {
          1: 36, // 18pt
          2: 28, // 14pt
          3: 24, // 12pt
          4: 22, // 11pt
          5: 20, // 10pt
          6: 18  // 9pt
        };

        const headingColors = {
          1: palette.dark,
          2: palette.primary,
          3: palette.secondary,
          4: '334155',
          5: '475569',
          6: '64748B'
        };

        const level = token.depth;
        const runs = parseInlineTokens(token.tokens, {
          primaryFont,
          size: headingSizes[level],
          color: headingColors[level],
          bold: true,
          palette
        });

        elements.push(
          new Paragraph({
            heading: headingLevels[level],
            children: runs,
            spacing: {
              before: level === 1 ? 360 : 240,
              after: 120,
              line: 276
            },
            keepWithNext: true
          })
        );
        break;
      }

      case 'paragraph': {
        // Detect GitHub-style Callouts / Alerts: > [!NOTE], etc.
        const firstText = token.text || '';
        const calloutMatch = firstText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

        if (calloutMatch) {
          const type = calloutMatch[1].toUpperCase();
          const restText = firstText.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, '').trim();

          const calloutThemes = {
            NOTE: { label: 'NOTE', icon: 'ℹ️', color: '1D4ED8', bg: 'EFF6FF', border: '3B82F6' },
            TIP: { label: 'TIP', icon: '💡', color: '047857', bg: 'ECFDF5', border: '10B981' },
            IMPORTANT: { label: 'IMPORTANT', icon: '⚡', color: '6D28D9', bg: 'F5F3FF', border: '8B5CF6' },
            WARNING: { label: 'WARNING', icon: '⚠️', color: 'B45309', bg: 'FFFBEB', border: 'F59E0B' },
            CAUTION: { label: 'CAUTION', icon: '🛑', color: 'B91C1C', bg: 'FEF2F2', border: 'EF4444' }
          };

          const theme = calloutThemes[type] || calloutThemes.NOTE;
          const inlineTokens = marked.Lexer.lexInline(restText);
          const bodyRuns = parseInlineTokens(inlineTokens, { primaryFont, size: 20, color: '1F2937', palette });

          const calloutTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: theme.border }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: theme.bg, color: 'auto' },
                    margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${theme.icon} ${theme.label}: `,
                            bold: true,
                            font: primaryFont,
                            size: 20,
                            color: theme.color
                          }),
                          ...bodyRuns
                        ],
                        spacing: { before: 60, after: 60, line: 260 }
                      })
                    ]
                  })
                ]
              })
            ]
          });

          elements.push(calloutTable);
          elements.push(new Paragraph({ spacing: { after: 120 } }));
          break;
        }

        const runs = parseInlineTokens(token.tokens, {
          primaryFont,
          codeFont,
          size: 22,
          color: '1E293B',
          palette
        });

        elements.push(
          new Paragraph({
            children: runs,
            spacing: {
              after: 140,
              line: 276
            }
          })
        );
        break;
      }

      case 'blockquote': {
        // Blockquote with accent border and subtle background
        const bqTokens = token.tokens || [];
        const bqChildren = [];

        for (const subToken of bqTokens) {
          if (subToken.type === 'paragraph') {
            const subRuns = parseInlineTokens(subToken.tokens, {
              primaryFont,
              size: 21,
              italics: true,
              color: '334155',
              palette
            });
            bqChildren.push(
              new Paragraph({
                children: subRuns,
                spacing: { before: 60, after: 60, line: 260 }
              })
            );
          }
        }

        const bqTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.SINGLE, size: 24, color: palette.primary }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: 'F8FAFC', color: 'auto' },
                  margins: { top: 120, bottom: 120, left: 180, right: 180 },
                  children: bqChildren.length > 0 ? bqChildren : [new Paragraph({ text: '' })]
                })
              ]
            })
          ]
        });

        elements.push(bqTable);
        elements.push(new Paragraph({ spacing: { after: 120 } }));
        break;
      }

      case 'list': {
        const ordered = token.ordered;
        const start = token.start || 1;

        token.items.forEach((item, itemIdx) => {
          const itemTokens = item.tokens || [];
          const prefix = item.checked !== undefined
            ? (item.checked ? '☑ ' : '☐ ')
            : (ordered ? `${start + itemIdx}. ` : '• ');

          const itemRuns = [];
          itemRuns.push(
            new TextRun({
              text: prefix,
              bold: true,
              font: primaryFont,
              size: 22,
              color: item.checked ? '059669' : palette.primary
            })
          );

          for (const sub of itemTokens) {
            if (sub.type === 'text') {
              if (sub.tokens && sub.tokens.length) {
                itemRuns.push(
                  ...parseInlineTokens(sub.tokens, {
                    primaryFont,
                    size: 22,
                    color: '1E293B',
                    palette,
                    strike: item.checked
                  })
                );
              } else {
                itemRuns.push(
                  new TextRun({
                    text: sub.text,
                    font: primaryFont,
                    size: 22,
                    color: '1E293B',
                    strike: item.checked
                  })
                );
              }
            } else if (sub.type === 'paragraph') {
              itemRuns.push(
                ...parseInlineTokens(sub.tokens, {
                  primaryFont,
                  size: 22,
                  color: '1E293B',
                  palette,
                  strike: item.checked
                })
              );
            }
          }

          elements.push(
            new Paragraph({
              children: itemRuns,
              indent: { left: 400 },
              spacing: { after: 80, line: 260 }
            })
          );
        });

        elements.push(new Paragraph({ spacing: { after: 80 } }));
        break;
      }

      case 'code': {
        // Fenced code block with modern dark/light styling
        const isDark = options.codeTheme !== 'light';
        const bgFill = isDark ? '0F172A' : 'F8FAFC';
        const textColor = isDark ? 'F1F5F9' : '0F172A';
        const borderColor = isDark ? '334155' : 'CBD5E1';

        const lines = (token.text || '').split('\n');
        const codeParagraphs = [];

        // Header showing language tag if available
        if (token.lang) {
          codeParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `// [${token.lang.toUpperCase()}]`,
                  font: codeFont,
                  size: 16,
                  color: isDark ? '94A3B8' : '64748B',
                  bold: true
                })
              ],
              spacing: { before: 40, after: 60 }
            })
          );
        }

        for (const line of lines) {
          codeParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || ' ',
                  font: codeFont,
                  size: 18, // 9pt monospaced
                  color: textColor
                })
              ],
              spacing: { before: 20, after: 20, line: 240 }
            })
          );
        }

        const codeTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
            left: { style: BorderStyle.SINGLE, size: 16, color: palette.primary },
            right: { style: BorderStyle.SINGLE, size: 8, color: borderColor }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: bgFill, color: 'auto' },
                  margins: { top: 100, bottom: 100, left: 160, right: 160 },
                  children: codeParagraphs
                })
              ]
            })
          ]
        });

        elements.push(codeTable);
        elements.push(new Paragraph({ spacing: { after: 120 } }));
        break;
      }

      case 'table': {
        // High quality Word Table
        const rows = [];

        // Header Row
        const headerCells = token.header.map((col, cIdx) => {
          const colAlign = token.align && token.align[cIdx] ? token.align[cIdx] : 'left';
          const alignType = colAlign === 'center'
            ? AlignmentType.CENTER
            : colAlign === 'right'
              ? AlignmentType.RIGHT
              : AlignmentType.LEFT;

          const cellRuns = parseInlineTokens(col.tokens, {
            primaryFont,
            size: 20,
            bold: true,
            color: palette.tableHeaderText,
            palette
          });

          return new TableCell({
            shading: { type: ShadingType.CLEAR, fill: palette.tableHeader, color: 'auto' },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: cellRuns,
                alignment: alignType,
                spacing: { before: 40, after: 40 }
              })
            ]
          });
        });

        rows.push(new TableRow({ children: headerCells, tableHeader: true }));

        // Data Rows
        token.rows.forEach((row, rIdx) => {
          const isEven = rIdx % 2 === 0;
          const rowBg = isEven ? 'FFFFFF' : palette.light;

          const cells = row.map((cell, cIdx) => {
            const colAlign = token.align && token.align[cIdx] ? token.align[cIdx] : 'left';
            const alignType = colAlign === 'center'
              ? AlignmentType.CENTER
              : colAlign === 'right'
                ? AlignmentType.RIGHT
                : AlignmentType.LEFT;

            const cellRuns = parseInlineTokens(cell.tokens, {
              primaryFont,
              size: 20,
              color: '1E293B',
              palette
            });

            return new TableCell({
              shading: { type: ShadingType.CLEAR, fill: rowBg, color: 'auto' },
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: cellRuns,
                  alignment: alignType,
                  spacing: { before: 30, after: 30 }
                })
              ]
            });
          });

          rows.push(new TableRow({ children: cells }));
        });

        const docxTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: palette.border },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: palette.border },
            left: { style: BorderStyle.SINGLE, size: 8, color: palette.border },
            right: { style: BorderStyle.SINGLE, size: 8, color: palette.border },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: palette.border },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: palette.border }
          },
          rows
        });

        elements.push(docxTable);
        elements.push(new Paragraph({ spacing: { after: 140 } }));
        break;
      }

      case 'hr': {
        // Divider
        elements.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 8, color: palette.border, space: 1 }
            },
            spacing: { before: 180, after: 180 }
          })
        );
        break;
      }

      default:
        break;
    }
  }

  return elements;
}

/**
 * Generate full DOCX Document buffer from Markdown string
 */
async function generateDocxFromMarkdown(markdownText, userOptions = {}) {
  const chosenPalette = PALETTES[userOptions.palette] || PALETTES.blue;
  const margins = MARGIN_CONFIG[userOptions.margins] || MARGIN_CONFIG.normal;
  const primaryFont = userOptions.primaryFont || 'Segoe UI';
  const docTitle = userOptions.title || 'Markdown Document';

  const options = {
    palette: chosenPalette,
    margins,
    primaryFont,
    codeFont: userOptions.codeFont || 'Consolas',
    codeTheme: userOptions.codeTheme || 'dark',
    includeHeaderFooter: userOptions.includeHeaderFooter !== false
  };

  const tokens = marked.lexer(markdownText, { gfm: true, breaks: true });
  const children = convertTokensToDocx(tokens, options);

  const doc = new Document({
    creator: 'Markdown to DOCX Converter',
    title: docTitle,
    description: 'Converted from Markdown using React Native Windows Converter',
    sections: [
      {
        properties: {
          page: {
            margin: margins
          }
        },
        headers: options.includeHeaderFooter ? {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: docTitle,
                    font: primaryFont,
                    size: 16,
                    color: '94A3B8',
                    italics: true
                  })
                ]
              })
            ]
          })
        } : undefined,
        footers: options.includeHeaderFooter ? {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Page ',
                    font: primaryFont,
                    size: 16,
                    color: '94A3B8'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: primaryFont,
                    size: 16,
                    color: '94A3B8'
                  }),
                  new TextRun({
                    text: ' of ',
                    font: primaryFont,
                    size: 16,
                    color: '94A3B8'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: primaryFont,
                    size: 16,
                    color: '94A3B8'
                  })
                ]
              })
            ]
          })
        } : undefined,
        children: children.length > 0 ? children : [
          new Paragraph({
            text: 'Empty Document',
            font: primaryFont
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return {
    buffer,
    stats: {
      tokensCount: tokens.length,
      paragraphsCount: children.length,
      bytes: buffer.length
    }
  };
}

module.exports = {
  generateDocxFromMarkdown,
  PALETTES,
  MARGIN_CONFIG
};
