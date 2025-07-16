import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { trackingAPI } from '@services/apiService';
import { TrackingItem, StatusUpdate } from '@types/index';

const TrackingDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [item, setItem] = useState<TrackingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const itemId = route.params?.itemId as string;

  // Load item details
  const loadItemDetails = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await trackingAPI.getItem(itemId);
      
      if (response.success && response.data) {
        setItem(response.data);
      }
    } catch (error) {
      console.error('Error loading item details:', error);
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      loadItemDetails();
    }
  }, [itemId]);

  // Refresh item status
  const handleRefresh = async () => {
    if (!item) return;
    
    try {
      setIsRefreshing(true);
      await trackingAPI.refreshItem(item.id);
      await loadItemDetails();
      Alert.alert('Success', 'Item status updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh item status');
    }
  };

  // Share item details
  const handleShare = async () => {
    if (!item) return;

    try {
      const shareText = `Track "${item.title}" with number ${item.trackingNumber}. Status: ${item.status}`;
      await Share.share({
        message: shareText,
        title: 'Tracking Information',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render status history item
  const renderStatusItem = (status: StatusUpdate, index: number) => {
    const isLast = index === item!.statusHistory.length - 1;
    
    return (
      <Animatable.View
        key={status.id}
        animation="fadeInLeft"
        delay={index * 100}
        style={styles.statusItem}
      >
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(status.status) },
            ]}
          />
          {!isLast && <View style={styles.statusLine} />}
        </View>
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            {status.status.replace('_', ' ').toUpperCase()}
          </Text>
          {status.description && (
            <Text style={styles.statusDescription}>{status.description}</Text>
          )}
          {status.location && (
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.locationText}>{status.location}</Text>
            </View>
          )}
          <Text style={styles.statusTime}>{formatDate(status.timestamp)}</Text>
        </View>
      </Animatable.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animatable.View animation="pulse" iterationCount="infinite">
            <Icon name="track-changes" size={60} color="#1a237e" />
          </Animatable.View>
          <Text style={styles.loadingText}>Loading Details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={60} color="#f44336" />
          <Text style={styles.errorText}>Item not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking Details</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Icon name="share" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Item Info Card */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.itemCard}>
          <LinearGradient
            colors={[getStatusColor(item.status), getStatusColor(item.status) + '80']}
            style={styles.itemHeader}
          >
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemNumber}>#{item.trackingNumber}</Text>
            <View style={styles.currentStatusContainer}>
              <Text style={styles.currentStatus}>
                {item.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </LinearGradient>
          
          <View style={styles.itemBody}>
            {item.description && (
              <View style={styles.detailRow}>
                <Icon name="description" size={20} color="#666" />
                <Text style={styles.detailText}>{item.description}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Icon name="category" size={20} color="#666" />
              <Text style={styles.detailText}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="flag" size={20} color="#666" />
              <Text style={styles.detailText}>
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
              </Text>
            </View>
            
            {item.estimatedDelivery && (
              <View style={styles.detailRow}>
                <Icon name="event" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Est. Delivery: {formatDate(item.estimatedDelivery)}
                </Text>
              </View>
            )}
            
            {item.location && (
              <View style={styles.detailRow}>
                <Icon name="location-on" size={20} color="#666" />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
            )}
          </View>
        </Animatable.View>

        {/* Action Buttons */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.refreshButton]}
              onPress={handleRefresh}
              disabled={isRefreshing}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('AddItem', { item })}
            >
              <Icon name="edit" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Status History */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Tracking History</Text>
            <View style={styles.historyList}>
              {item.statusHistory
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((status, index) => renderStatusItem(status, index))}
            </View>
          </View>
        </Animatable.View>

        {/* Notes */}
        {item.notes && (
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          </Animatable.View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#1a237e',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  itemHeader: {
    padding: 25,
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  itemNumber: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
  },
  currentStatusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  currentStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  itemBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  refreshButton: {
    backgroundColor: '#2196f3',
  },
  editButton: {
    backgroundColor: '#ff9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  historyList: {
    paddingLeft: 10,
  },
  statusItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statusLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  statusLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
    marginBottom: 8,
  },
  statusContent: {
    flex: 1,
    paddingBottom: 10,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  statusTime: {
    fontSize: 12,
    color: '#999',
  },
  notesContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  notesText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default TrackingDetailScreen;