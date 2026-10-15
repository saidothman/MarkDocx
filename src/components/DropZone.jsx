import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Easing
} from 'react-native';
import {
  FileUp,
  FolderOpen,
  Sparkles,
  FileCode,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function DropZone({ onFileSelected, onLoadSample }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // React Native Animated values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // 1. Continuous breathing pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    // 2. Continuous floating icon animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    // 3. Subtle glow loop
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    pulseLoop.start();
    floatLoop.start();
    glowLoop.start();

    return () => {
      pulseLoop.stop();
      floatLoop.stop();
      glowLoop.stop();
    };
  }, []);

  // Handle Drag Over / Enter / Leave
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    Animated.spring(scaleAnim, {
      toValue: 1.03,
      friction: 6,
      useNativeDriver: false,
    }).start();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: false,
    }).start();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: false,
    }).start();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const filePath = window.electronAPI?.getPathForFile ? window.electronAPI.getPathForFile(file) : (file.path || null);
      if (filePath && window.electronAPI?.readFile) {
        try {
          const fileData = await window.electronAPI.readFile(filePath);
          if (fileData) {
            onFileSelected(fileData);
            return;
          }
        } catch (err) {
          console.error('Failed to read dropped file path:', err);
        }
      }

      // Fallback web FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        onFileSelected({
          filePath: filePath || file.name,
          fileName: file.name,
          content: typeof event.target.result === 'string' ? event.target.result : '',
          size: file.size || 0,
          lastModified: file.lastModified || Date.now(),
        });
      };
      reader.readAsText(file);
    }
  };

  const handleBrowse = async () => {
    if (window.electronAPI?.openFileDialog) {
      try {
        const fileData = await window.electronAPI.openFileDialog();
        if (fileData && fileData.content !== undefined) {
          onFileSelected(fileData);
        }
      } catch (err) {
        console.error('Error opening file dialog:', err);
      }
    } else {
      // Browser fallback input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            onFileSelected({
              filePath: file.name,
              fileName: file.name,
              content: typeof ev.target.result === 'string' ? ev.target.result : '',
              size: file.size || 0,
              lastModified: file.lastModified || Date.now(),
            });
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Dynamic Background Glow */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main Interactive Drop Card */}
      <Animated.View
        style={[
          styles.card,
          isDragOver && styles.cardDragOver,
          isHovered && styles.cardHovered,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
        // HTML5 Drag Events attached to the container
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Floating Animated Icon Cluster */}
        <Animated.View
          style={[
            styles.iconCluster,
            {
              transform: [{ translateY: floatAnim }],
            },
          ]}
        >
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <FileUp size={38} color="#38BDF8" strokeWidth={2.2} />
            </View>
          </View>
        </Animated.View>

        {/* Text and Instructions */}
        <Text style={styles.heading}>
          {isDragOver ? 'Drop Your Markdown File Here' : 'Select or Drop Markdown File'}
        </Text>
        <Text style={styles.subheading}>
          Transform your Markdown notes, docs, and tables into beautifully styled Microsoft Word (.docx) documents.
        </Text>

        {/* Action Button Group */}
        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleBrowse}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            style={({ pressed, hovered }) => [
              styles.primaryButton,
              hovered && styles.primaryButtonHover,
              pressed && styles.buttonPressed,
            ]}
          >
            <FolderOpen size={18} color="#0A0F1D" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Browse Markdown File</Text>
          </Pressable>

          <Pressable
            onPress={onLoadSample}
            style={({ pressed, hovered }) => [
              styles.secondaryButton,
              hovered && styles.secondaryButtonHover,
              pressed && styles.buttonPressed,
            ]}
          >
            <Sparkles size={16} color="#38BDF8" style={{ marginRight: 6 }} />
            <Text style={styles.secondaryButtonText}>Try Sample File</Text>
          </Pressable>
        </View>

        {/* Format Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <FileCode size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>.md</Text>
          </View>
          <View style={styles.badge}>
            <FileText size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>.markdown</Text>
          </View>
          <View style={styles.badge}>
            <Layers size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>Tables & AST</Text>
          </View>
          <View style={styles.badge}>
            <Sparkles size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>Callout Boxes</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 680,
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  ambientGlow: {
    position: 'absolute',
    width: 480,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    filter: 'blur(60px)',
    top: 20,
    zIndex: 0,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderStyle: 'dashed',
    paddingVertical: 38,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    backdropFilter: 'blur(16px)',
    zIndex: 1,
  },
  cardHovered: {
    borderColor: 'rgba(56, 189, 248, 0.55)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  cardDragOver: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderStyle: 'solid',
    transform: [{ scale: 1.02 }],
  },
  iconCluster: {
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  iconCircleInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 440,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  primaryButtonHover: {
    backgroundColor: '#7DD3FC',
    transform: [{ translateY: -1 }],
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondaryButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0F1D',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  badgeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
