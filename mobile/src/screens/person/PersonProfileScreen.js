import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/client';
import { buildImageUrl } from '../../utils/imageOptimizer';

const { width } = Dimensions.get('window');

/**
 * PersonProfileScreen
 * Displays actor/director profile with biography and filmography
 */
const PersonProfileScreen = ({ route, navigation }) => {
  const { personId } = route.params;

  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all'); // all, acting, directing
  const [bioExpanded, setBioExpanded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPersonData();
  }, [personId]);

  const fetchPersonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [personRes, creditsRes] = await Promise.all([
        api.get(`/media/person/${personId}`),
        api.get(`/media/person/${personId}/credits`),
      ]);

      if (personRes.data.success) {
        setPerson(personRes.data.data);
      }

      if (creditsRes.data.success) {
        setCredits(creditsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching person data:', err);
      setError('Failed to load person details');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCredits = () => {
    if (!credits) return [];

    let filtered = [];

    if (selectedTab === 'all') {
      filtered = [...(credits.cast || []), ...(credits.crew || [])];
    } else if (selectedTab === 'acting') {
      filtered = credits.cast || [];
    } else if (selectedTab === 'directing') {
      filtered = (credits.crew || []).filter((item) => item.job === 'Director');
    }

    // Remove duplicates and sort by date
    const unique = filtered.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
    );

    return unique;
  };

  const renderFilmographyItem = ({ item }) => {
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
    const character = item.character || item.job;
    const mediaType = item.media_type === 'movie' ? 'movie' : 'tv';

    return (
      <TouchableOpacity
        style={styles.filmItem}
        onPress={() => {
          navigation.navigate('MediaDetail', {
            mediaId: item.id,
            mediaType: mediaType,
          });
        }}
      >
        <Image
          source={{
            uri: buildImageUrl(item.poster_path, 'poster'),
          }}
          style={styles.filmPoster}
        />

        <View style={styles.filmInfo}>
          <Text style={styles.filmTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.filmYear}>{year}</Text>
          {character && (
            <Text style={styles.filmCharacter} numberOfLines={1}>
              as {character}
            </Text>
          )}
          <View style={styles.filmRating}>
            <Ionicons name="star" size={12} color="#ffd700" />
            <Text style={styles.ratingText}>
              {item.vote_average?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    );
  }

  if (error || !person) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e50914" />
        <Text style={styles.errorText}>{error || 'Person not found'}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const biography = person.biography || 'No biography available.';
  const shouldTruncateBio = biography.length > 300;
  const displayBio =
    bioExpanded || !shouldTruncateBio
      ? biography
      : biography.substring(0, 300) + '...';

  const filmography = getFilteredCredits();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)', 'transparent']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: buildImageUrl(person.profile_path, 'profile'),
            }}
            style={styles.profileImage}
          />

          <Text style={styles.name}>{person.name}</Text>

          {person.known_for_department && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{person.known_for_department}</Text>
            </View>
          )}
        </View>

        {/* Personal Info */}
        <View style={styles.infoSection}>
          {person.birthday && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={18} color="#e50914" />
              <Text style={styles.infoLabel}>Born:</Text>
              <Text style={styles.infoValue}>
                {new Date(person.birthday).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}

          {person.place_of_birth && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={18} color="#e50914" />
              <Text style={styles.infoLabel}>From:</Text>
              <Text style={styles.infoValue}>{person.place_of_birth}</Text>
            </View>
          )}
        </View>

        {/* Biography */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biography</Text>
          <Text style={styles.bioText}>{displayBio}</Text>
          {shouldTruncateBio && (
            <TouchableOpacity
              onPress={() => setBioExpanded(!bioExpanded)}
              style={styles.readMoreButton}
            >
              <Text style={styles.readMoreText}>
                {bioExpanded ? 'Show Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filmography */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filmography</Text>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
              onPress={() => setSelectedTab('all')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'all' && styles.activeTabText,
                ]}
              >
                All ({(credits?.cast?.length || 0) + (credits?.crew?.length || 0)})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'acting' && styles.activeTab]}
              onPress={() => setSelectedTab('acting')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'acting' && styles.activeTabText,
                ]}
              >
                Acting ({credits?.cast?.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'directing' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('directing')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'directing' && styles.activeTabText,
                ]}
              >
                Directing (
                {(credits?.crew || []).filter((item) => item.job === 'Director')
                  .length || 0}
                )
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filmography List */}
          <FlatList
            data={filmography}
            renderItem={renderFilmographyItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No credits found</Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#e50914',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 24,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(229,9,20,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e50914',
  },
  badgeText: {
    color: '#e50914',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#ccc',
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e50914',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#e50914',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: '#e50914',
    fontWeight: '600',
  },
  filmItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  filmPoster: {
    width: 80,
    height: 120,
    backgroundColor: '#1a1a1a',
  },
  filmInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  filmTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  filmYear: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  filmCharacter: {
    fontSize: 12,
    color: '#ccc',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  filmRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#ffd700',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PersonProfileScreen;
