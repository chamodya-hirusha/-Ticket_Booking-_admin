import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { Event, EventFormData } from '../../types/admin';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  'Music',
  'Technology',
  'Art',
  'Food',
  'Sports',
  'Education',
  'Business',
  'Entertainment',
];

export function EventForm({ event, onSubmit, onCancel, isLoading = false }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: event?.name || '',
    description: event?.description || '',
    date: event?.date || '',
    time: event?.time || '',
    location: event?.location || '',
    imageUrl: event?.imageUrl || '',
    category: event?.category || '',
    status: event?.status || 'draft',
    // Legacy single-tier fields – kept in sync with general tier
    price: event?.price || 0,
    availableTickets: event?.availableTickets || 0,
    // New tiered ticket fields – hydrate from event if present, otherwise from legacy values
    vipTicketLimit: event?.vipTicketLimit ?? 0,
    premiumTicketLimit: event?.premiumTicketLimit ?? 0,
    generalTicketLimit:
      event?.generalTicketLimit ?? event?.availableTickets ?? 0,
    vipTicketPrice: event?.vipTicketPrice ?? 0,
    premiumTicketPrice: event?.premiumTicketPrice ?? 0,
    generalTicketPrice: event?.generalTicketPrice ?? event?.price ?? 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    // Require at least a valid general tier
    if (formData.generalTicketPrice <= 0) {
      newErrors.generalTicketPrice = 'General ticket price must be greater than 0';
    }
    if (formData.generalTicketLimit <= 0) {
      newErrors.generalTicketLimit = 'General ticket limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      // Keep legacy single-tier fields in sync with the general tier so other
      // parts of the admin UI (e.g. event lists) continue to work as before.
      const payload: EventFormData = {
        ...formData,
        price: formData.generalTicketPrice,
        availableTickets: formData.generalTicketLimit,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Name */}
        <div className="md:col-span-2">
          <Label htmlFor="name">Event Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter event name"
            className="mt-2"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter event description"
            rows={4}
            className="mt-2"
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="mt-2"
            aria-invalid={!!errors.date}
          />
          {errors.date && (
            <p className="text-sm text-destructive mt-1">{errors.date}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <Label htmlFor="time">Time *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => handleChange('time', e.target.value)}
            className="mt-2"
            aria-invalid={!!errors.time}
          />
          {errors.time && (
            <p className="text-sm text-destructive mt-1">{errors.time}</p>
          )}
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Enter event location"
            className="mt-2"
            aria-invalid={!!errors.location}
          />
          {errors.location && (
            <p className="text-sm text-destructive mt-1">{errors.location}</p>
          )}
        </div>

        {/* General Ticket Price */}
        <div>
          <Label htmlFor="generalTicketPrice">General Ticket Price ($) *</Label>
          <Input
            id="generalTicketPrice"
            type="number"
            step="0.01"
            value={formData.generalTicketPrice}
            onChange={(e) =>
              handleChange('generalTicketPrice', parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            className="mt-2"
            aria-invalid={!!errors.generalTicketPrice}
          />
          {errors.generalTicketPrice && (
            <p className="text-sm text-destructive mt-1">
              {errors.generalTicketPrice}
            </p>
          )}
        </div>

        {/* General Ticket Limit */}
        <div>
          <Label htmlFor="generalTicketLimit">General Ticket Limit *</Label>
          <Input
            id="generalTicketLimit"
            type="number"
            value={formData.generalTicketLimit}
            onChange={(e) =>
              handleChange('generalTicketLimit', parseInt(e.target.value) || 0)
            }
            placeholder="0"
            className="mt-2"
            aria-invalid={!!errors.generalTicketLimit}
          />
          {errors.generalTicketLimit && (
            <p className="text-sm text-destructive mt-1">
              {errors.generalTicketLimit}
            </p>
          )}
        </div>

        {/* VIP & Premium Ticket Tiers (optional) */}
        <div>
          <Label htmlFor="vipTicketLimit">VIP Ticket Limit</Label>
          <Input
            id="vipTicketLimit"
            type="number"
            value={formData.vipTicketLimit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('vipTicketLimit', parseInt(e.target.value) || 0)
            }
            placeholder="0"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="vipTicketPrice">VIP Ticket Price ($)</Label>
          <Input
            id="vipTicketPrice"
            type="number"
            step="0.01"
            value={formData.vipTicketPrice}
            onChange={(e) =>
              handleChange('vipTicketPrice', parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="premiumTicketLimit">Premium Ticket Limit</Label>
          <Input
            id="premiumTicketLimit"
            type="number"
            value={formData.premiumTicketLimit}
            onChange={(e) =>
              handleChange('premiumTicketLimit', parseInt(e.target.value) || 0)
            }
            placeholder="0"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="premiumTicketPrice">Premium Ticket Price ($)</Label>
          <Input
            id="premiumTicketPrice"
            type="number"
            step="0.01"
            value={formData.premiumTicketPrice}
            onChange={(e) =>
              handleChange('premiumTicketPrice', parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            className="mt-2"
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: string) => handleChange('category', value)}
          >
            <SelectTrigger className="mt-2" aria-invalid={!!errors.category}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive mt-1">{errors.category}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: EventFormData['status']) => handleChange('status', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Optional: Enter a URL for the event image
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            event ? 'Update Event' : 'Create Event'
          )}
        </Button>
      </div>
    </form>
  );
}
