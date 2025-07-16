import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { trackingAPI } from '@services/apiService';
import { TrackingItemForm, TrackingItem } from '@types/index';
import FormInput from '@components/FormInput';
import CategoryPicker from '@components/CategoryPicker';
import PriorityPicker from '@components/PriorityPicker';

const AddItemScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if we're editing an existing item
  const editingItem = route.params?.item as TrackingItem | undefined;
  const isEditing = !!editingItem;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TrackingItemForm>({
    defaultValues: {
      title: editingItem?.title || '',
      description: editingItem?.description || '',
      trackingNumber: editingItem?.trackingNumber || '',
      category: editingItem?.category || 'package',
      priority: editingItem?.priority || 'medium',
      estimatedDelivery: editingItem?.estimatedDelivery || '',
      notes: editingItem?.notes || '',
    },
  });

  const onSubmit = async (data: TrackingItemForm) => {
    try {
      setIsLoading(true);
      
      let response;
      if (isEditing && editingItem) {
        response = await trackingAPI.updateItem(editingItem.id, data);
      } else {
        response = await trackingAPI.createItem(data);
      }

      if (response.success) {
        Alert.alert(
          'Success',
          `Tracking item ${isEditing ? 'updated' : 'created'} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Failed to save item');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || `Failed to ${isEditing ? 'update' : 'create'} item`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackByNumber = async () => {
    const trackingNumber = watch('trackingNumber');
    
    if (!trackingNumber.trim()) {
      Alert.alert('Error', 'Please enter a tracking number first');
      return;
    }

    try {
      setIsLoading(true);
      const response = await trackingAPI.trackItem(trackingNumber);
      
      if (response.success && response.data) {
        Alert.alert(
          'Item Found',
          'Would you like to use the automatically detected information?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              onPress: () => {
                // Auto-fill form with tracked data
                // This would require updating form values
                console.log('Auto-fill with:', response.data);
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Could not track this number automatically');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View animation="fadeInUp" duration={800} style={styles.formContainer}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Title *</Text>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    placeholder="Enter item title"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.title?.message}
                    icon="title"
                  />
                )}
              />
            </View>

            {/* Tracking Number Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Tracking Number *</Text>
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={handleTrackByNumber}
                  disabled={isLoading}
                >
                  <Icon name="search" size={16} color="#1a237e" />
                  <Text style={styles.trackButtonText}>Track</Text>
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name="trackingNumber"
                rules={{
                  required: 'Tracking number is required',
                  minLength: {
                    value: 5,
                    message: 'Tracking number must be at least 5 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    placeholder="Enter tracking number"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.trackingNumber?.message}
                    icon="confirmation-number"
                    autoCapitalize="characters"
                  />
                )}
              />
            </View>

            {/* Category Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <CategoryPicker
                    selectedCategory={value}
                    onCategoryChange={onChange}
                  />
                )}
              />
            </View>

            {/* Priority Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, value } }) => (
                  <PriorityPicker
                    selectedPriority={value}
                    onPriorityChange={onChange}
                  />
                )}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    placeholder="Enter item description (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    icon="description"
                  />
                )}
              />
            </View>

            {/* Estimated Delivery Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estimated Delivery</Text>
              <Controller
                control={control}
                name="estimatedDelivery"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    placeholder="YYYY-MM-DD (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    icon="event"
                  />
                )}
              />
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    placeholder="Additional notes (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    icon="note"
                  />
                )}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#ff6b35', '#f7931e']}
                style={styles.buttonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading 
                    ? (isEditing ? 'Updating...' : 'Creating...') 
                    : (isEditing ? 'Update Item' : 'Create Item')
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Placeholder components (these would be in separate files)
const FormInput: React.FC<any> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  onBlur, 
  error, 
  icon, 
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'sentences'
}) => (
  <View style={inputStyles.container}>
    <View style={inputStyles.inputContainer}>
      <Icon name={icon} size={20} color="#666" style={inputStyles.icon} />
      <TextInput
        style={[
          inputStyles.input,
          multiline && inputStyles.multilineInput,
          error && inputStyles.inputError,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#999"
      />
    </View>
    {error && <Text style={inputStyles.errorText}>{error}</Text>}
  </View>
);

const CategoryPicker: React.FC<any> = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { key: 'package', label: 'Package', icon: 'inventory' },
    { key: 'document', label: 'Document', icon: 'description' },
    { key: 'shipment', label: 'Shipment', icon: 'local-shipping' },
    { key: 'order', label: 'Order', icon: 'shopping-cart' },
    { key: 'other', label: 'Other', icon: 'category' },
  ];

  return (
    <View style={pickerStyles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            pickerStyles.option,
            selectedCategory === category.key && pickerStyles.selectedOption,
          ]}
          onPress={() => onCategoryChange(category.key)}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.key ? '#fff' : '#666'} 
          />
          <Text
            style={[
              pickerStyles.optionText,
              selectedCategory === category.key && pickerStyles.selectedOptionText,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const PriorityPicker: React.FC<any> = ({ selectedPriority, onPriorityChange }) => {
  const priorities = [
    { key: 'low', label: 'Low', color: '#4caf50' },
    { key: 'medium', label: 'Medium', color: '#2196f3' },
    { key: 'high', label: 'High', color: '#ff9800' },
    { key: 'urgent', label: 'Urgent', color: '#f44336' },
  ];

  return (
    <View style={pickerStyles.container}>
      {priorities.map((priority) => (
        <TouchableOpacity
          key={priority.key}
          style={[
            pickerStyles.priorityOption,
            selectedPriority === priority.key && {
              backgroundColor: priority.color,
            },
          ]}
          onPress={() => onPriorityChange(priority.key)}
        >
          <View
            style={[
              pickerStyles.priorityDot,
              { backgroundColor: priority.color },
            ]}
          />
          <Text
            style={[
              pickerStyles.optionText,
              selectedPriority === priority.key && pickerStyles.selectedOptionText,
            ]}
          >
            {priority.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  trackButtonText: {
    fontSize: 14,
    color: '#1a237e',
    fontWeight: '500',
    marginLeft: 4,
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  inputError: {
    borderColor: '#ff4757',
  },
  errorText: {
    color: '#ff4757',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 4,
  },
});

const pickerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#1a237e',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  selectedOptionText: {
    color: '#fff',
  },
});

export default AddItemScreen;