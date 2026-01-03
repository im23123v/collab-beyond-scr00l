import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSharedImages } from '@/hooks/useSharedImages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { useRef } from 'react';
import { ImageLightbox } from '@/components/shared/ImageLightbox';

export default function Timetables() {
  const { images, isLoading, uploadImage, deleteImage, isAdmin } = useSharedImages();
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !title.trim()) return;
    
    await uploadImage.mutateAsync({
      file,
      title,
      visibleTo: ['all'],
    });
    setTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  };

  const selectedImage = images[selectedImageIndex];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Timetables & Images</h1>
          <p className="text-muted-foreground">Shared schedules and resources</p>
        </div>

        {isAdmin && (
          <Card className="glass">
            <CardContent className="p-4 space-y-4">
              <Label>Upload New Image (Admin Only)</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Image title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="gradient-primary"
                  disabled={!title.trim() || uploadImage.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadImage.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card 
              key={image.id} 
              className="glass overflow-hidden animate-scale-in group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className="aspect-video bg-muted relative">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{image.title}</h3>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage.mutate(image.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No images uploaded yet</p>
          </div>
        )}

        {selectedImage && (
          <ImageLightbox
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            imageUrl={selectedImage.image_url}
            title={selectedImage.title}
            onPrevious={goToPrevious}
            onNext={goToNext}
            hasPrevious={selectedImageIndex > 0}
            hasNext={selectedImageIndex < images.length - 1}
          />
        )}
      </div>
    </AppLayout>
  );
}
