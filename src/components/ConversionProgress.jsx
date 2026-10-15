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
  Loader2,
  CheckCircle2,
  FileCheck,
  Folder,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STEPS = [
  { id: 1, label: 'Parsing Markdown AST & Syntax Tokens', weight: 25 },
  { id: 2, label: 'Styling Typography, Callouts & Layouts', weight: 55 },
  { id: 3, label: 'Generating Tables, Lists & Code Blocks', weight: 80 },
  { id: 4, label: 'Packaging OpenXML & Writing .docx File', weight: 100 },
];

export default function ConversionProgress({
  status, // 'converting' | 'completed' | 'error'
  result,
  error,
  onReset,
  currentStep
}) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Spin loop for loader
  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    if (status === 'converting') {
      spinLoop.start();
    } else {
      spinLoop.stop();
    }

    return () => spinLoop.stop();
  }, [status]);

  // Animate progress percentage
  useEffect(() => {
    let target = 0;
    if (status === 'converting') {
      const step = STEPS[currentStep] || STEPS[0];
      target = step.weight;
    } else if (status === 'completed') {
      target = 100;
    }

    Animated.timing(progressAnim, {
      toValue: target,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [status, currentStep]);

  // Confetti celebration on completion
  useEffect(() => {
    if (status === 'completed') {
      Animated.spring(successScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: false,
      }).start();

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#818CF8', '#34D399', '#F472B6', '#FBBF24']
        });
      } catch (e) {
        console.log('Confetti effect:', e);
      }
    }
  }, [status]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressPercent = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const handleOpenDocx = () => {
    if (result?.outputPath && window.electronAPI?.openInDefaultApp) {
      window.electronAPI.openInDefaultApp(result.outputPath);
    }
  };

  const handleShowInExplorer = () => {
    if (result?.outputPath && window.electronAPI?.showInExplorer) {
      window.electronAPI.showInExplorer(result.outputPath);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {status === 'converting' && (
          <View style={styles.convertingContainer}>
            {/* Animated Spinning Icon */}
            <View style={styles.spinnerWrapper}>
              <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                <Loader2 size={44} color="#38BDF8" strokeWidth={2.5} />
              </Animated.View>
            </View>

            <Text style={styles.title}>Converting Markdown to Word</Text>
            <Text style={styles.subtitle}>
              Processing document structure and compiling OpenXML formatting...
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <Animated.View style={[styles.progressBarFill, { width: progressPercent }]} />
            </View>

            {/* Step Indicators */}
            <View style={styles.stepList}>
              {STEPS.map((step, index) => {
                const isDone = index < currentStep;
                const isCurrent = index === currentStep;
                return (
                  <View key={step.id} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isDone && styles.stepDotDone,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {isDone ? (
                        <CheckCircle2 size={12} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.stepDotNum, isCurrent && styles.stepDotNumCurrent]}>
                          {step.id}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepText,
                        isDone && styles.stepTextDone,
                        isCurrent && styles.stepTextCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {status === 'completed' && (
          <Animated.View style={[styles.completedContainer, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successIconBox}>
              <CheckCircle2 size={46} color="#34D399" strokeWidth={2.2} />
            </View>

            <Text style={styles.successTitle}>Conversion Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your Word document (.docx) has been created with native styles and tables.
            </Text>

            {/* Result Info Card */}
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <FileCheck size={22} color="#38BDF8" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultFileName} numberOfLines={1}>
                    {result?.fileName || 'Document.docx'}
                  </Text>
                  <Text style={styles.resultPath} numberOfLines={1}>
                    {result?.outputPath}
                  </Text>
                </View>
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeBadgeText}>
                    {result?.fileSize ? (result.fileSize / 1024).toFixed(1) + ' KB' : 'DOCX'}
                  </Text>
                </View>
              </View>

              {result?.stats && (
                <View style={styles.resultStatsRow}>
                  <Text style={styles.resultStat}>
                    Tokens: <Text style={styles.resultStatBold}>{result.stats.tokensCount}</Text>
                  </Text>
                  <Text style={styles.resultStat}>•</Text>
                  <Text style={styles.resultStat}>
                    Paragraphs & Blocks: <Text style={styles.resultStatBold}>{result.stats.paragraphsCount}</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonGroup}>
              <Pressable
                onPress={handleOpenDocx}
                style={({ pressed, hovered }) => [
                  styles.openDocxButton,
                  hovered && styles.openDocxButtonHover,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ExternalLink size={18} color="#0A0F1D" style={{ marginRight: 8 }} />
                <Text style={styles.openDocxButtonText}>Open in Microsoft Word</Text>
              </Pressable>

              <Pressable
                onPress={handleShowInExplorer}
                style={({ pressed, hovered }) => [
                  styles.explorerButton,
                  hovered && styles.explorerButtonHover,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Folder size={16} color="#E2E8F0" style={{ marginRight: 8 }} />
                <Text style={styles.explorerButtonText}>Show in File Explorer</Text>
              </Pressable>

              <Pressable
                onPress={onReset}
                style={({ pressed, hovered }) => [
                  styles.resetButton,
                  hovered && styles.resetButtonHover,
                  pressed && styles.buttonPressed,
                ]}
              >
                <RotateCcw size={16} color="#94A3B8" style={{ marginRight: 6 }} />
                <Text style={styles.resetButtonText}>Convert Another File</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {status === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Conversion Failed</Text>
            <Text style={styles.errorMsg}>{error || 'An unexpected error occurred.'}</Text>
            <Pressable onPress={onReset} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Try Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 680,
    marginVertical: 10,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    backdropFilter: 'blur(20px)',
  },
  convertingContainer: {
    alignItems: 'center',
  },
  spinnerWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4,
  },
  stepList: {
    width: '100%',
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  stepDotDone: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  stepDotCurrent: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38BDF8',
  },
  stepDotNum: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  stepDotNumCurrent: {
    color: '#38BDF8',
  },
  stepText: {
    fontSize: 13,
    color: '#64748B',
  },
  stepTextDone: {
    color: '#94A3B8',
    textDecorationLine: 'none',
  },
  stepTextCurrent: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  completedContainer: {
    alignItems: 'center',
  },
  successIconBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultFileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  resultPath: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sizeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sizeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38BDF8',
  },
  resultStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  resultStat: {
    fontSize: 12,
    color: '#94A3B8',
  },
  resultStatBold: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  actionButtonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  openDocxButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  openDocxButtonHover: {
    backgroundColor: '#7DD3FC',
  },
  openDocxButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0F1D',
  },
  explorerButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  explorerButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  explorerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  resetButtonHover: {
    opacity: 0.8,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorMsg: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center',
  },
});
