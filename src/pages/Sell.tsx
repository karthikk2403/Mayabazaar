import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Upload, Loader2 } from 'lucide-react';

const sellSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  starting_bid: z.number().min(1, 'Starting bid must be at least 1'),
  category: z.enum(['Jewelry', 'Furniture', 'Art', 'Books', 'Coins', 'Collectibles']),
  duration: z.number().min(1, 'Duration must be at least 1 day').max(30, 'Duration cannot exceed 30 days'),
});

type SellForm = z.infer<typeof sellSchema>;

export default function Sell() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SellForm>({
    resolver: zodResolver(sellSchema),
  });

  useEffect(() => {
    async function ensureProfileExists() {
      if (!user?.id) return;

      try {
        setCreatingProfile(true);
        // Check if profile exists
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        // If profile doesn't exist, create it
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              name: user.name || 'Anonymous User',
              created_at: new Date().toISOString(),
            }]);

          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Error ensuring profile exists:', error);
        toast.error('Failed to set up user profile');
        navigate('/');
      } finally {
        setCreatingProfile(false);
      }
    }

    ensureProfileExists();
  }, [user, navigate]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SellForm) => {
    if (!selectedImage) {
      toast.error('Please upload an image');
      return;
    }

    setUploading(true);
    try {
      // Upload image
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const end_time = new Date();
      end_time.setDate(end_time.getDate() + data.duration);

      const { error } = await supabase.from('products').insert({
        title: data.title,
        description: data.description,
        image_url: publicUrl,
        current_bid: data.starting_bid,
        starting_bid: data.starting_bid,
        category: data.category,
        end_time: end_time.toISOString(),
        seller_id: user?.id,
      });

      if (error) throw error;

      toast.success('Product listed successfully!');
      navigate(`/auctions?category=${data.category}`);
    } catch (error) {
      console.error('Error listing product:', error);
      toast.error('Failed to list product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF3E3] py-12">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-serif text-3xl font-bold text-gray-900">Please Login</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to sell items.</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (creatingProfile) {
    return (
      <div className="min-h-screen bg-[#FAF3E3] py-12">
        <div className="mx-auto max-w-md text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-800" />
          <p className="mt-2 text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E3] py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="font-serif text-3xl font-bold text-gray-900">List Your Item</h2>
          <p className="mt-2 text-gray-600">
            Fill in the details below to list your item for auction.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Item Image
              </label>
              <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10">
                <div className="text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-64 w-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-amber-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 hover:text-amber-700"
                        >
                          <span>Upload an image</span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Item Title
              </label>
              <Input
                id="title"
                {...register('title')}
                error={errors.title?.message}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                rows={4}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="starting_bid" className="block text-sm font-medium text-gray-700">
                Starting Bid ($)
              </label>
              <Input
                id="starting_bid"
                type="number"
                {...register('starting_bid', { valueAsNumber: true })}
                error={errors.starting_bid?.message}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                {...register('category')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Select a category</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Furniture">Furniture</option>
                <option value="Art">Art</option>
                <option value="Books">Books</option>
                <option value="Coins">Coins</option>
                <option value="Collectibles">Collectibles</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Auction Duration (days)
              </label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                error={errors.duration?.message}
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || uploading || !selectedImage}
            >
              {isSubmitting || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? 'Uploading...' : 'Listing...'}
                </>
              ) : (
                'List Item'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export { Sell }