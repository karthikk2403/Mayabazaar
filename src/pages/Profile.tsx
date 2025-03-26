import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BidHistory } from '@/components/BidHistory';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Camera, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  interests: z.string().min(2, 'Please enter your interests').optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: '',
      location: '',
      phone: '',
      interests: '',
    },
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profile) {
          reset({
            name: profile.name || '',
            bio: profile.bio || '',
            location: profile.location || '',
            phone: profile.phone || '',
            interests: profile.interests || '',
          });
          setAvatarUrl(profile.avatar_url);
          updateProfile(profile);
        } else {
          // Create new profile
          const newProfile = {
            id: user.id,
            name: user.name || '',
            created_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile]);

          if (insertError) throw insertError;

          reset({ name: user.name || '' });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user, updateProfile, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      updateProfile(data);
      toast.success('Profile updated successfully!');
      reset(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      updateProfile({ avatar_url: publicUrl });
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF3E3] py-12">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-serif text-3xl font-bold text-gray-900">Please Login</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#FAF3E3] py-12">
        <div className="mx-auto max-w-md text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-800" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E3] py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <div className="mb-8">
              <div className="relative mx-auto h-32 w-32">
                <img
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=amber&color=fff`}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover ring-2 ring-amber-100"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 cursor-pointer rounded-full bg-amber-800 p-2 text-white transition-colors hover:bg-amber-900 ${uploading ? 'opacity-50' : ''}`}
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>
              <h2 className="mt-4 font-serif text-3xl font-bold text-gray-900">
                {user.name || 'Your Profile'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  error={errors.name?.message}
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <Input
                  id="location"
                  {...register('location')}
                  error={errors.location?.message}
                  className="mt-1"
                  placeholder="e.g., New York, USA"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                {...register('bio')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                rows={4}
                placeholder="Tell us about yourself..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  {...register('phone')}
                  error={errors.phone?.message}
                  className="mt-1"
                  placeholder="e.g., +1 234 567 8900"
                />
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Interests
                </label>
                <Input
                  id="interests"
                  {...register('interests')}
                  error={errors.interests?.message}
                  className="mt-1"
                  placeholder="e.g., Antique Furniture, Vintage Jewelry"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={!isDirty || saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty || saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <BidHistory />
          </div>
        </div>
      </div>
    </div>
  );
}