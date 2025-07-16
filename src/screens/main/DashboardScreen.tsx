import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { dashboardAPI, trackingAPI } from '@services/apiService';
import { DashboardStats, TrackingItem } from '@types/index';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: notificationState } = useNotification();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<TrackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [statsResponse, recentResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentItems(5),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (recentResponse.success && recentResponse.data) {
        setRecentItems(recentResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  // Pull to refresh handler
  const onRefresh = () => {
    loadDashboardData(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#4caf50';
      case 'in_transit':
        return '#2196f3';
      case 'out_for_delivery':
        return '#ff9800';
      case 'delayed':
        return '#f44336';
      case 'cancelled':
        return '#9e9e9e';
      default:
        return '#607d8b';
    }
  };

  // Format status text
  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  // Get time greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animatable.View animation="pulse" iterationCount="infinite">
            <Icon name="dashboard" size={60} color="#1a237e" />
          </Animatable.View>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <LinearGradient
            colors={['#1a237e', '#3949ab']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>
                  {getTimeGreeting()}, {authState.user?.name?.split(' ')[0]}!
                </Text>
                <Text style={styles.subtitleText}>
                  Here's your tracking overview
                </Text>
              </View>
              {notificationState.unreadCount > 0 && (
                <View style={styles.notificationContainer}>
                  <Icon name="notifications" size={24} color="#fff" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>
                      {notificationState.unreadCount}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Stats Cards */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                <Icon name="inventory" size={30} color="#1976d2" />
                <Text style={styles.statNumber}>{stats?.totalItems || 0}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#e8f5e8' }]}>
                <Icon name="local-shipping" size={30} color="#388e3c" />
                <Text style={styles.statNumber}>{stats?.activeItems || 0}</Text>
                <Text style={styles.statLabel}>In Transit</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                <Icon name="check-circle" size={30} color="#f57c00" />
                <Text style={styles.statNumber}>{stats?.deliveredItems || 0}</Text>
                <Text style={styles.statLabel}>Delivered</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#ffebee' }]}>
                <Icon name="warning" size={30} color="#d32f2f" />
                <Text style={styles.statNumber}>{stats?.delayedItems || 0}</Text>
                <Text style={styles.statLabel}>Delayed</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.quickActionCard}>
                <LinearGradient
                  colors={['#ff6b35', '#f7931e']}
                  style={styles.quickActionGradient}
                >
                  <Icon name="add" size={30} color="#fff" />
                  <Text style={styles.quickActionText}>Add Item</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.quickActionGradient}
                >
                  <Icon name="qr-code-scanner" size={30} color="#fff" />
                  <Text style={styles.quickActionText}>Scan QR</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={styles.quickActionGradient}
                >
                  <Icon name="search" size={30} color="#fff" />
                  <Text style={styles.quickActionText}>Track Item</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>

        {/* Recent Items */}
        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Items</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {recentItems.length > 0 ? (
              <View style={styles.recentItemsContainer}>
                {recentItems.map((item, index) => (
                  <Animatable.View
                    key={item.id}
                    animation="fadeInLeft"
                    delay={index * 100}
                    style={styles.recentItemCard}
                  >
                    <View style={styles.itemLeftSection}>
                      <View
                        style={[
                          styles.statusIndicator,
                          { backgroundColor: getStatusColor(item.status) },
                        ]}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemNumber} numberOfLines={1}>
                          #{item.trackingNumber}
                        </Text>
                        <Text
                          style={[
                            styles.itemStatus,
                            { color: getStatusColor(item.status) },
                          ]}
                        >
                          {getStatusText(item.status)}
                        </Text>
                      </View>
                    </View>
                    <Icon name="chevron-right" size={24} color="#ccc" />
                  </Animatable.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="inventory-2" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No tracking items yet</Text>
                <Text style={styles.emptySubtext}>
                  Start by adding your first tracking item
                </Text>
              </View>
            )}
          </View>
        </Animatable.View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 16,
    color: '#1a237e',
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  recentItemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 4,
    height: 50,
    borderRadius: 2,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default DashboardScreen;