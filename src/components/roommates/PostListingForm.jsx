import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { RoommatePost } from '@/entities/RoommatePost';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function PostListingForm({ onSuccess, initialData = null }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      post_type: 'seeking_roommate',
      location: '',
      rent_amount: 0,
      move_in_date: '',
      lease_duration: '',
      pet_friendly: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        post_type: initialData.post_type || 'seeking_roommate',
        location: initialData.location || '',
        rent_amount: initialData.rent_amount || 0,
        move_in_date: initialData.move_in_date ? new Date(initialData.move_in_date).toISOString().split('T')[0] : '',
        lease_duration: initialData.lease_duration || '',
        pet_friendly: initialData.pet_friendly || false,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await RoommatePost.update(initialData.id, data);
        toast({ title: 'Post Updated!', description: 'Your listing has been updated.' });
      } else {
        await RoommatePost.create(data);
        toast({ title: 'Post Created!', description: 'Your listing is now live.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to submit post:', error);
      toast({ title: 'Submission Failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormItem = ({ label, error, children }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.message}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormItem label="Title *" error={errors.title}>
        <Input
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 5, message: 'Title must be at least 5 characters' }
          })}
          placeholder="e.g., Looking for roommate in Gainesville"
        />
      </FormItem>

      <FormItem label="Description *" error={errors.description}>
        <Textarea
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 20, message: 'Description must be at least 20 characters' }
          })}
          placeholder="Describe the living situation, preferences, etc."
          className="h-24"
        />
      </FormItem>

      <FormItem label="Post Type *" error={errors.post_type}>
        <Controller
          name="post_type"
          control={control}
          rules={{ required: 'Post type is required' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seeking_roommate">I have a place, seeking roommate</SelectItem>
                <SelectItem value="seeking_room">I need a room</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem label="Location *" error={errors.location}>
          <Input
            {...register('location', {
              required: 'Location is required',
              minLength: { value: 3, message: 'Location must be at least 3 characters' }
            })}
            placeholder="e.g., Gainesville, FL"
          />
        </FormItem>

        <FormItem label="Rent Amount *" error={errors.rent_amount}>
          <Input
            type="number"
            {...register('rent_amount', {
              required: 'Rent amount is required',
              min: { value: 0, message: 'Rent must be a positive number' },
              valueAsNumber: true
            })}
            placeholder="Monthly rent in dollars"
          />
        </FormItem>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem label="Move-in Date *" error={errors.move_in_date}>
          <Input
            type="date"
            {...register('move_in_date', {
              required: 'Move-in date is required'
            })}
          />
        </FormItem>

        <FormItem label="Lease Duration" error={errors.lease_duration}>
          <Input
            {...register('lease_duration')}
            placeholder="e.g., 12 months, 6 months"
          />
        </FormItem>
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="pet_friendly"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="pet_friendly"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="pet_friendly">Pet-friendly</Label>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Post' : 'Create Post')}
        </Button>
      </div>
    </form>
  );
}