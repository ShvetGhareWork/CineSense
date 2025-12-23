import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { buildImageUrl } from '../utils/imageOptimizer';

/**
 * WatchProvidersList Component - Enhanced
 * Displays streaming platforms where content is available
 * Separated by: Stream, Rent, Buy with premium design
 */
const WatchProvidersList = ({ providers, region = 'IN' }) => {
  if (!providers) {
    return null;
  }

  const { flatrate, rent, buy, link } = providers;

  // Check if any providers exist
  const hasProviders = flatrate || rent || buy;

  if (!hasProviders) {
    return null;
  }

  const getGradientColors = (type) => {
    switch (type) {
      case 'stream':
        return ['#6C63FF', '#3ABEFF'];
      case 'rent':
        return ['#F39C12', '#E67E22'];
      case 'buy':
        return ['#27AE60', '#229954'];
      default:
        return ['#6C63FF', '#3ABEFF'];
    }
  };

  const renderProviderSection = (title, providerList, icon, type) => {
    if (!providerList || providerList.length === 0) return null;

    const gradientColors = getGradientColors(type);

    return (
      <View style={styles.section}>
        {/* Section Header with Gradient */}
        <LinearGradient
          colors={[...gradientColors.map(c => c + '20'), 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionHeaderGradient}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: gradientColors[0] + '30' }]}>
              <Ionicons name={icon} size={18} color={gradientColors[0]} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{providerList.length}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Provider List */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.providerList}
        >
          {providerList.map((provider, index) => (
            <TouchableOpacity
              key={provider.provider_id}
              style={[styles.providerItem, index === 0 && styles.firstProvider]}
              activeOpacity={0.7}
            >
              <View style={styles.providerLogoContainer}>
                <Image
                  source={{
                    uri: buildImageUrl(provider.logo_path, 'logo'),
                  }}
                  style={styles.providerLogo}
                  resizeMode="cover"
                />
                {/* Subtle gradient overlay */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.1)']}
                  style={styles.logoOverlay}
                />
              </View>
              <Text style={styles.providerName} numberOfLines={2}>
                {provider.provider_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(108,99,255,0.08)', 'rgba(58,190,255,0.05)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Main Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['#6C63FF', '#3ABEFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerIconCircle}
            >
              <Ionicons name="tv" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>Where to Watch</Text>
              <Text style={styles.subtitle}>Available in {region}</Text>
            </View>
          </View>
          {link && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                // Open JustWatch link
                // Linking.openURL(link);
              }}
            >
              <Ionicons name="open-outline" size={18} color="#6C63FF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Provider Sections */}
        {renderProviderSection('Stream Now', flatrate, 'play-circle', 'stream')}
        {renderProviderSection('Rent', rent, 'card-outline', 'rent')}
        {renderProviderSection('Buy', buy, 'cart-outline', 'buy')}

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={12} color="#666" />
          <Text style={styles.disclaimer}>
            Powered by JustWatch • Prices and availability may vary
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.15)',
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
  },
  linkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108,99,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderGradient: {
    borderRadius: 10,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  providerList: {
    paddingLeft: 12,
    paddingRight: 16,
  },
  providerItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 85,
  },
  firstProvider: {
    marginLeft: 0,
  },
  providerLogoContainer: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  providerLogo: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  providerName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#ddd',
    textAlign: 'center',
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  disclaimer: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default WatchProvidersList;
