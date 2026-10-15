import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Minus, Square, Copy, X, FileText } from 'lucide-react';

export default function TitleBar({ activeTab, onTabChange }) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.isMaximized) {
      window.electronAPI.isMaximized().then(setIsMaximized);
    }
  }, []);

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = async () => {
    if (window.electronAPI?.maximizeWindow) {
      const state = await window.electronAPI.maximizeWindow();
      setIsMaximized(state);
    }
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow?.();
  };

  return (
    <View style={styles.container}>
      {/* Draggable Title Area */}
      <View style={[styles.dragArea, { WebkitAppRegion: 'drag' }]}>
        <View style={styles.branding}>
          <View style={styles.iconBadge}>
            <FileText size={16} color="#38BDF8" />
          </View>
          <Text style={styles.title}>MarkDocx Studio</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Windows Native</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { WebkitAppRegion: 'no-drag' }]}>
          <Pressable
            onPress={() => onTabChange('convert')}
            style={[styles.tabButton, activeTab === 'convert' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'convert' && styles.tabTextActive]}>
              Converter
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onTabChange('preview')}
            style={[styles.tabButton, activeTab === 'preview' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'preview' && styles.tabTextActive]}>
              Live Preview
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onTabChange('styles')}
            style={[styles.tabButton, activeTab === 'styles' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'styles' && styles.tabTextActive]}>
              Document Style
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Window Controls */}
      <View style={[styles.windowControls, { WebkitAppRegion: 'no-drag' }]}>
        <Pressable
          onPress={handleMinimize}
          style={({ hovered }) => [styles.controlButton, hovered && styles.controlButtonHover]}
        >
          <Minus size={14} color="#94A3B8" />
        </Pressable>

        <Pressable
          onPress={handleMaximize}
          style={({ hovered }) => [styles.controlButton, hovered && styles.controlButtonHover]}
        >
          {isMaximized ? (
            <Copy size={12} color="#94A3B8" />
          ) : (
            <Square size={12} color="#94A3B8" />
          )}
        </Pressable>

        <Pressable
          onPress={handleClose}
          style={({ hovered }) => [styles.controlButton, styles.closeButton, hovered && styles.closeButtonHover]}
        >
          {({ hovered }) => (
            <X size={14} color={hovered ? '#FFFFFF' : '#94A3B8'} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: 'rgba(10, 15, 29, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  dragArea: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  versionBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  versionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#38BDF8',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    padding: 3,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  tabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  windowControls: {
    flexDirection: 'row',
    height: '100%',
  },
  controlButton: {
    width: 46,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeButton: {
    width: 48,
  },
  closeButtonHover: {
    backgroundColor: '#E11D48',
  },
});
