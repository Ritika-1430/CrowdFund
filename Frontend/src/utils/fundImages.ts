const categoryFallbackImages: Record<string, string> = {
  'Orphanage & Child Care Support':
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&h=600&fit=crop&auto=format',
  'Old Age Home / Elder Care':
    'https://images.unsplash.com/photo-1773227060446-93239a553f1f?w=900&h=600&fit=crop&auto=format',
  'Emergency Medical Treatment':
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&h=600&fit=crop&auto=format',
  'Physical Disability Support':
    'https://images.unsplash.com/photo-1578496781985-452d4a934d50?w=900&h=600&fit=crop&auto=format',
  'Women Healthcare & Maternity Support':
    'https://images.unsplash.com/photo-1615766553246-9147b6d50e90?w=900&h=600&fit=crop&auto=format',
  'Disaster & Emergency Relief':
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&h=600&fit=crop&auto=format',
};

export const defaultFundImage =
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&h=600&fit=crop&auto=format';

export const fallbackFundImage = (category?: string) =>
  (category && categoryFallbackImages[category]) || defaultFundImage;

export const fundPhotoUrls = (fund: { category?: string; photos?: { url?: string }[] }) => {
  const photos = fund.photos?.map((photo) => photo.url).filter(Boolean) as string[] | undefined;
  return photos && photos.length > 0 ? photos : [fallbackFundImage(fund.category)];
};
