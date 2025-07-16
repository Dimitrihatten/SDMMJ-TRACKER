import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { trackingAPI } from '@services/apiService';
import { TrackingItem, TrackingFilters, TrackingStatus } from '@types/index';

const TrackingScreen: React.FC = () => {
  const [items, setItems] = useState<TrackingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TrackingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TrackingStatus | 'all'>('all');

  // Load tracking items
  const loadTrackingItems = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await trackingAPI.getItems();
      
      if (response.success && response.data) {
        setItems(response.data.items);
        setFilteredItems(response.data.items);
      }
    } catch (error) {
      console.error('Error loading tracking items:', error);
      Alert.alert(
        'Error',
        'Failed to load tracking items. Please try again.',
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
      loadTrackingItems();
    }, [])
  );

  // Filter items based on search and status
  useEffect(() => {
    let filtered = items;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedStatus]);

  // Pull to refresh handler
  const onRefresh = () => {
    loadTrackingItems(true);
  };

  // Get status color
  const getStatusColor = (status: TrackingStatus) => {
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
  const getStatusText = (status: TrackingStatus) => {
    return status.replace('_', ' ').toUpperCase();
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#f44336';
      case 'high':
        return '#ff9800';
      case 'medium':
        return '#2196f3';
      case 'low':
        return '#4caf50';
      default:
        return '#607d8b';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render tracking item
  const renderTrackingItem = ({ item, index }: { item: TrackingItem; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.itemCard}
    >
      <TouchableOpacity style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleSection}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.priorityBadge}>
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              />
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.trackingNumber}>#{item.trackingNumber}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.dateText}>
              {formatDate(item.updatedAt)}
            </Text>
          </View>
        </View>

        {item.location && (
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );

  // Status filter options
  const statusFilters = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'pending', label: 'Pending', count: items.filter(i => i.status === 'pending').length },
    { key: 'in_transit', label: 'In Transit', count: items.filter(i => i.status === 'in_transit').length },
    { key: 'out_for_delivery', label: 'Out for Delivery', count: items.filter(i => i.status === 'out_for_delivery').length },
    { key: 'delivered', label: 'Delivered', count: items.filter(i => i.status === 'delivered').length },
    { key: 'delayed', label: 'Delayed', count: items.filter(i => i.status === 'delayed').length },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animatable.View animation="pulse" iterationCount="infinite">
            <Icon name="local-shipping" size={60} color="#1a237e" />
          </Animatable.View>
          <Text style={styles.loadingText}>Loading Tracking Items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tracking items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === item.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(item.key as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Items List */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderTrackingItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="bounceIn" style={styles.emptyContent}>
            <Icon
              name={searchQuery || selectedStatus !== 'all' ? 'search-off' : 'inventory-2'}
              size={80}
              color="#ccc"
            />
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedStatus !== 'all'
                ? 'No items found'
                : 'No tracking items yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first tracking item'}
            </Text>
            {!searchQuery && selectedStatus === 'all' && (
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>Add First Item</Text>
              </TouchableOpacity>
            )}
          </Animatable.View>
        </View>
      )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#1a237e',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    padding: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitleSection: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  itemDetails: {
    marginBottom: 15,
  },
  trackingNumber: {
    fontSize: 16,
    color: '#1a237e',
    fontWeight: '600',
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#1a237e',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TrackingScreen;