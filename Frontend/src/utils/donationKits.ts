type KitItem = {
  id: string;
  name: string;
  unitPrice: number;
  imageQuery: string;
  imageUrl?: string;
  description?: string;
  icons?: string[];
};

type CategoryKit = {
  exploreQuery: string;
  bannerQuery: string;
  description: string;
  items: KitItem[];
};

export const categoryKits: Record<string, CategoryKit> = {
  'Orphanage & Child Care Support': {
    exploreQuery: 'Indian orphanage children with caretaker, emotional charity photo',
    bannerQuery: 'Indian orphanage children classroom with caretaker, banner image',
    description: 'Support orphaned children with food, education, hygiene and toys.',
    items: [
      { id: 'grocery', name: 'Grocery Kit', unitPrice: 799, imageQuery: 'grocery donation kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop&auto=format', description: 'Staples and dry food items to support daily meals.' },
      { id: 'school', name: 'School Kit', unitPrice: 499, imageQuery: 'school kit donation product photo white background', imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop&auto=format', description: 'Notebooks, pencils and school supplies for children.' },
      { id: 'hygiene', name: 'Hygiene Kit', unitPrice: 299, imageQuery: 'hygiene kit donation product photo white background', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=400&fit=crop&auto=format', description: 'Soaps, shampoo and basic hygiene essentials.' },
      { id: 'toy', name: 'Toy Kit', unitPrice: 199, imageQuery: 'toy kit donation product photo white background', imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop&auto=format', description: 'Simple educational toys and games for kids.' },
    ],
  },

  'Old Age Home / Elder Care': {
    exploreQuery: 'Indian elderly people with caregiver in old age home',
    bannerQuery: 'Indian senior citizens old age home banner',
    description: 'Help elders with medicines, groceries, hygiene and warmth.',
    items: [
      { id: 'medicine', name: 'Medicine Kit', unitPrice: 999, imageQuery: 'medicine kit elder care product photo white background', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop&auto=format', description: 'Essential medicines and first-aid for elders.' },
      { id: 'grocery', name: 'Grocery Kit', unitPrice: 899, imageQuery: 'elder grocery kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop&auto=format', description: 'Nutritious staples and ready-to-eat foods.' },
      { id: 'blanket', name: 'Blanket Kit', unitPrice: 599, imageQuery: 'blanket donation product photo white background', imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop&auto=format', description: 'Warm blankets and bedding materials.' },
      { id: 'hygiene', name: 'Hygiene Kit', unitPrice: 399, imageQuery: 'elder hygiene kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=400&fit=crop&auto=format', description: 'Personal care and hygiene items.' },
    ],
  },

  'Emergency Medical Treatment': {
    exploreQuery: 'Indian hospital emergency care doctors treating patient',
    bannerQuery: 'Indian hospital emergency treatment banner',
    description: 'Support urgent medical care, surgeries and ICU treatment.',
    items: [
      { id: 'medicine', name: 'Medicine Kit', unitPrice: 999, imageQuery: 'medicine donation kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop&auto=format', description: 'Basic medicines and prescriptions for urgent care.' },
      { id: 'surgery', name: 'Surgery Support Kit', unitPrice: 5000, imageQuery: 'surgery medical equipment product photo white background', imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop&auto=format', description: 'Support for surgical procedures and supplies.' },
      { id: 'icu', name: 'ICU Support Kit', unitPrice: 10000, imageQuery: 'ICU support medical product style photo', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop&auto=format', description: 'ICU level support to cover critical care costs.' },
    ],
  },

  'Physical Disability Support': {
    exploreQuery: 'Indian disabled person wheelchair caregiver support',
    bannerQuery: 'Indian person with prosthetic limb inspirational banner',
    description: 'Provide mobility, prosthetics and therapy support.',
    items: [
      { id: 'wheelchair', name: 'Wheelchair Kit', unitPrice: 8000, imageQuery: 'wheelchair product photo white background', imageUrl: 'https://images.unsplash.com/photo-1578496781985-452d4a934d50?w=600&h=400&fit=crop&auto=format', description: 'Durable wheelchairs for improved mobility.' },
      { id: 'prosthetic', name: 'Prosthetic Support Kit', unitPrice: 12000, imageQuery: 'prosthetic limb product photo white background', imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600&h=400&fit=crop&auto=format', description: 'Prosthetic limb support and fittings.' },
      { id: 'therapy', name: 'Therapy Support Kit', unitPrice: 1500, imageQuery: 'therapy support product style image', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format', description: 'Physical therapy sessions and equipment.' },
    ],
  },

  'Women Healthcare & Maternity Support': {
    exploreQuery: 'Indian pregnant woman receiving maternity care',
    bannerQuery: 'Indian mother with newborn baby hospital banner',
    description: 'Support maternal nutrition, baby care and health checkups.',
    items: [
      { id: 'nutrition', name: 'Maternity Nutrition Kit', unitPrice: 899, imageQuery: 'maternity nutrition kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=400&fit=crop&auto=format', description: 'Nutritional supplements and healthy food packs.' },
      { id: 'baby', name: 'Baby Care Kit', unitPrice: 699, imageQuery: 'baby care kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop&auto=format', description: 'Baby essentials like diapers, clothes and wipes.' },
      { id: 'checkup', name: 'Medical Checkup Kit', unitPrice: 1200, imageQuery: 'prenatal medical checkup kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop&auto=format', description: 'Prenatal and postnatal medical checkup support.' },
    ],
  },

  'Disaster & Emergency Relief': {
    exploreQuery: 'Indian disaster relief volunteers helping families',
    bannerQuery: 'Indian disaster relief camp banner image',
    description: 'Provide food, shelter and essentials during disasters.',
    items: [
      { id: 'food', name: 'Food Kit', unitPrice: 499, imageQuery: 'disaster food relief kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop&auto=format', description: 'Non-perishable food packages for families.' },
      { id: 'shelter', name: 'Shelter Kit', unitPrice: 2999, imageQuery: 'disaster shelter kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop&auto=format', description: 'Temporary shelter materials and tools.' },
      { id: 'clothing', name: 'Clothing Kit', unitPrice: 699, imageQuery: 'clothing relief kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop&auto=format', description: 'Warm clothing and garments for families.' },
      { id: 'hygiene', name: 'Emergency Hygiene Kit', unitPrice: 399, imageQuery: 'emergency hygiene kit product photo white background', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=400&fit=crop&auto=format', description: 'Soap, sanitizers and hygiene essentials.' },
    ],
  },
};

export const unsplashFor = (query: string, w = 1200, h = 600) =>
  `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(query)}`;

export const fallbackKitImage =
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop&auto=format';

export const kitImageSrc = (item: { imageUrl?: string; imageQuery: string }, w = 600, h = 400) =>
  item.imageUrl || unsplashFor(item.imageQuery, w, h);
