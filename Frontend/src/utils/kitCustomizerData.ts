export interface CustomItem {
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
}

export const kitCustomizableItems: Record<string, CustomItem[]> = {
  'Medicine Kit': [
    { name: 'Paracetamol (10 tabs)', price: 40, description: 'Fever and pain relief medicine.', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop&auto=format' },
    { name: 'Antibiotics (10 capsules)', price: 120, description: 'Broad-spectrum antibiotic course.', imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d304a3b6f?w=150&h=150&fit=crop&auto=format' },
    { name: 'Multivitamins (30 tablets)', price: 180, description: 'Daily essential immunity boost vitamins.', imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=150&h=150&fit=crop&auto=format' },
    { name: 'First Aid Bandages (20 pcs)', price: 50, description: 'Sterile skin bandages for small cuts.', imageUrl: 'https://images.unsplash.com/photo-1590611380053-1bf5d8bf6357?w=150&h=150&fit=crop&auto=format' },
    { name: 'Cough Syrup (100ml)', price: 90, description: 'Soothing relief for dry/wet cough.', imageUrl: 'https://images.unsplash.com/photo-1550572017-48d88e04b4c7?w=150&h=150&fit=crop&auto=format' },
    { name: 'BP Monitor (Digital)', price: 850, description: 'Automatic digital blood pressure monitor.', imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&h=150&fit=crop&auto=format' },
    { name: 'ORS Hydration Packets (5 pcs)', price: 60, description: 'Oral rehydration salts for dehydration.', imageUrl: 'https://images.unsplash.com/photo-1626202378216-957fc88a101f?w=150&h=150&fit=crop&auto=format' },
    { name: 'Inhaler (Asthma Relief)', price: 320, description: 'Emergency bronchodilator inhaler.', imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=150&h=150&fit=crop&auto=format' },
    { name: 'Painkiller Gel (50g)', price: 75, description: 'Fast relief gel for joint/muscle pains.', imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=150&h=150&fit=crop&auto=format' },
    { name: 'Antacid Tablets (20 tabs)', price: 45, description: 'Chewable tablets for acidity & gas.', imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=150&h=150&fit=crop&auto=format' },
    { name: 'Antiseptic Disinfectant (100ml)', price: 65, description: 'Skin disinfectant liquid for wound cleaning.', imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&h=150&fit=crop&auto=format' },
    { name: 'Throat Lozenges (16 pack)', price: 55, description: 'Soothes throat irritation & dry cough.', imageUrl: 'https://images.unsplash.com/photo-1563486855-75825227749a?w=150&h=150&fit=crop&auto=format' },
    { name: 'Surgical Masks (50 pcs)', price: 120, description: '3-ply protective medical grade face masks.', imageUrl: 'https://images.unsplash.com/photo-1586942593568-293a1a72e9a5?w=150&h=150&fit=crop&auto=format' },
    { name: 'Hand Sanitizer (500ml)', price: 150, description: '70% alcohol instant hand rub bottle.', imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=150&h=150&fit=crop&auto=format' },
    { name: 'Eye Drops (Lubricating)', price: 80, description: 'Soothing drops for dry, tired eyes.', imageUrl: 'https://images.unsplash.com/photo-1628744448839-a9a3b6a908a8?w=150&h=150&fit=crop&auto=format' },
    { name: 'Diabetes Testing Strips (50)', price: 650, description: 'Accurate blood glucose measurement strips.', imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=150&h=150&fit=crop&auto=format' },
    { name: 'Glucometer Device', price: 950, description: 'Digital testing kit with lancing device.', imageUrl: 'https://images.unsplash.com/photo-1589279003513-467d320f47eb?w=150&h=150&fit=crop&auto=format' },
    { name: 'Digital Thermometer', price: 130, description: 'Fast reading clinical body thermometer.', imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf241f2c44e?w=150&h=150&fit=crop&auto=format' },
    { name: 'Vitamin C Chewable (30)', price: 90, description: 'Daily ascorbic acid immunity tablets.', imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=150&h=150&fit=crop&auto=format' },
    { name: 'Calcium & Vitamin D3 (30)', price: 140, description: 'Daily tablets for bone and joint health.', imageUrl: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf4?w=150&h=150&fit=crop&auto=format' }
  ],
  'Grocery Kit': [
    { name: 'Basmati Rice (5kg)', price: 250, description: 'Premium long-grain Basmati rice.', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&h=150&fit=crop&auto=format' },
    { name: 'Wheat Flour / Atta (5kg)', price: 220, description: 'Finely ground whole wheat flour.', imageUrl: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=150&h=150&fit=crop&auto=format' },
    { name: 'Refined Cooking Oil (1L)', price: 160, description: 'Fortified sunflower oil for cooking.', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&h=150&fit=crop&auto=format' },
    { name: 'Red Lentils / Dal (2kg)', price: 180, description: 'High protein split red lentils.', imageUrl: 'https://images.unsplash.com/photo-1585996706175-100859874288?w=150&h=150&fit=crop&auto=format' },
    { name: 'Refined Sugar (1kg)', price: 50, description: 'Pure white refined sugar.', imageUrl: 'https://images.unsplash.com/photo-1581781890520-22c608f61fe3?w=150&h=150&fit=crop&auto=format' },
    { name: 'Tea Leaves Pack (500g)', price: 140, description: 'High-quality Indian black tea.', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&h=150&fit=crop&auto=format' },
    { name: 'Milk Powder Pack (500g)', price: 190, description: 'Instant dairy milk powder.', imageUrl: 'https://images.unsplash.com/photo-1600454021990-ab482127a147?w=150&h=150&fit=crop&auto=format' },
    { name: 'Spices Combo Pack (3 pcs)', price: 90, description: 'Turmeric, Chilli, and Coriander powders.', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=150&h=150&fit=crop&auto=format' }
  ],
  'Blanket Kit': [
    { name: 'Woolen Cap (Beanie)', price: 80, description: 'Warm knitted cap for ears protection.', imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=150&h=150&fit=crop&auto=format' },
    { name: 'Thermal Socks Pair', price: 60, description: 'Extra thick thermal winter socks.', imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=150&h=150&fit=crop&auto=format' },
    { name: 'Fleece Bed Sheet', price: 240, description: 'Soft fleece bedsheet for cold nights.', imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=150&h=150&fit=crop&auto=format' },
    { name: 'Cotton Pillow', price: 150, description: 'Soft stuffed head support pillow.', imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=150&h=150&fit=crop&auto=format' },
    { name: 'Sleeping Mat (Foam)', price: 220, description: 'Insulating ground foam mattress.', imageUrl: 'https://images.unsplash.com/photo-1601944529625-f15a5198ecfc?w=150&h=150&fit=crop&auto=format' }
  ],
  'Hygiene Kit': [
    { name: 'Antiseptic Soap (4 bars)', price: 100, description: 'Germ protection bathing bars.', imageUrl: 'https://images.unsplash.com/photo-1607006342411-1a90308561a3?w=150&h=150&fit=crop&auto=format' },
    { name: 'Fluoride Toothpaste (150g)', price: 90, description: 'Essential cavity protection toothpaste.', imageUrl: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=150&h=150&fit=crop&auto=format' },
    { name: 'Bamboo Toothbrushes (4 pcs)', price: 80, description: 'Eco-friendly soft bristle toothbrushes.', imageUrl: 'https://images.unsplash.com/photo-1593005510329-8a4035a7238f?w=150&h=150&fit=crop&auto=format' },
    { name: 'Alcohol Sanitizer (250ml)', price: 110, description: 'Instant hand rub sanitizer gel.', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&h=150&fit=crop&auto=format' },
    { name: 'Sanitary Pads Combo (16 pcs)', price: 150, description: 'Eco-friendly ultra-thin pads.', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=150&h=150&fit=crop&auto=format' },
    { name: 'Washing Detergent (1kg)', price: 120, description: 'High-foaming clothes washing powder.', imageUrl: 'https://images.unsplash.com/photo-1610557892470-76d7882209e0?w=150&h=150&fit=crop&auto=format' }
  ],
  'Emergency Hygiene Kit': [
    { name: 'Chlorine Tablets (50 pcs)', price: 150, description: 'Instant water purification tablets.', imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=150&h=150&fit=crop&auto=format' },
    { name: 'Antiseptic Liquid (250ml)', price: 130, description: 'First-aid skin sanitizer liquid.', imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&h=150&fit=crop&auto=format' },
    { name: 'Sanitary Pads Pack (8 pcs)', price: 80, description: 'Emergency hygiene sanitary pads.', imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=150&h=150&fit=crop&auto=format' }
  ],
  'School Kit': [
    { name: 'Notebooks Set (5 pcs)', price: 150, description: 'Single-line ruled writing notebooks.', imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=150&h=150&fit=crop&auto=format' },
    { name: 'Geometry Math Box', price: 120, description: 'Compass, divider, ruler, and pencils.', imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=150&h=150&fit=crop&auto=format' },
    { name: 'Drawing Book & Crayons', price: 80, description: 'A4 coloring book with oil pastels.', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=150&h=150&fit=crop&auto=format' },
    { name: 'Steel Water Bottle (750ml)', price: 240, description: 'Durable leak-proof steel bottle.', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&h=150&fit=crop&auto=format' },
    { name: 'School Bag (Waterproof)', price: 450, description: 'Padded shoulder straps daily school bag.', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&auto=format' }
  ],
  'Toy Kit': [
    { name: 'Plastic Building Blocks', price: 220, description: 'Interlocking building blocks pack.', imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=150&h=150&fit=crop&auto=format' },
    { name: 'Football (Size 5)', price: 350, description: 'Standard size synthetic leather ball.', imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&h=150&fit=crop&auto=format' },
    { name: 'Ludo & Chess Board Combo', price: 120, description: 'Folding magnetic board games.', imageUrl: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=150&h=150&fit=crop&auto=format' },
    { name: 'Plush Teddy Bear (Soft)', price: 180, description: 'Washable soft stuffed teddy toy.', imageUrl: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=150&h=150&fit=crop&auto=format' }
  ],
  'Surgery Support Kit': [
    { name: 'Sterile Surgical Gloves (5 pairs)', price: 150, description: 'Medical grade disposable latex gloves.', imageUrl: 'https://images.unsplash.com/photo-1584515901407-d7ff536c0477?w=150&h=150&fit=crop&auto=format' },
    { name: 'Anesthetic Solution (100ml)', price: 650, description: 'Critical local/general anesthesia fluid.', imageUrl: 'https://images.unsplash.com/photo-1607619225032-23f4b4f62907?w=150&h=150&fit=crop&auto=format' },
    { name: 'Sterile Gauze Rolls (10 pcs)', price: 120, description: 'Absorbent dressing gauze rolls.', imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=150&h=150&fit=crop&auto=format' }
  ],
  'ICU Support Kit': [
    { name: 'Oxygen Mask & Tube', price: 250, description: 'Disposable oxygen delivery set.', imageUrl: 'https://images.unsplash.com/photo-1584515925235-9cd7469a4d8c?w=150&h=150&fit=crop&auto=format' },
    { name: 'IV Fluid Drip Sets (5 pcs)', price: 180, description: 'Normal saline intravenous drips.', imageUrl: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=150&h=150&fit=crop&auto=format' },
    { name: 'ECG Electrodes (50 pcs)', price: 350, description: 'Disposable monitoring electrodes.', imageUrl: 'https://images.unsplash.com/photo-1516062423079-7ca13cca7c5b?w=150&h=150&fit=crop&auto=format' }
  ],
  'Wheelchair Kit': [
    { name: 'Memory Foam Cushion', price: 450, description: 'Ergonomic pressure relief seat pad.', imageUrl: 'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=150&h=150&fit=crop&auto=format' },
    { name: 'Wheelchair Utility Tray', price: 280, description: 'Clip-on food and reading desk.', imageUrl: 'https://images.unsplash.com/photo-1578496781985-452d4a934d50?w=150&h=150&fit=crop&auto=format' }
  ],
  'Prosthetic Support Kit': [
    { name: 'Silicon Prosthetic Liner', price: 1200, description: 'Gel sleeve for comfortable stump interface.', imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=150&h=150&fit=crop&auto=format' },
    { name: 'Prosthetic Care Spray', price: 350, description: 'Cleansing and joint protection spray.', imageUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=150&h=150&fit=crop&auto=format' }
  ],
  'Therapy Support Kit': [
    { name: 'Resistance Bands Set (3 pcs)', price: 280, description: 'Different tension bands for rehabilitation.', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&auto=format' },
    { name: 'Gym Ball (Orthopedic)', price: 420, description: 'Physio exercise ball for balance.', imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=150&h=150&fit=crop&auto=format' }
  ],
  'Maternity Nutrition Kit': [
    { name: 'Iron & Calcium Tablets (30 tabs)', price: 160, description: 'Crucial prenatal mineral supplements.', imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=150&h=150&fit=crop&auto=format' },
    { name: 'Mother Milk Powder (400g)', price: 320, description: 'Fortified nutritional drink mix.', imageUrl: 'https://images.unsplash.com/photo-1600454021990-ab482127a147?w=150&h=150&fit=crop&auto=format' },
    { name: 'Dates & Dry Fruits Box (500g)', price: 280, description: 'Natural energy boosting snacks.', imageUrl: 'https://images.unsplash.com/photo-1595624871930-6e8537998592?w=150&h=150&fit=crop&auto=format' }
  ],
  'Baby Care Kit': [
    { name: 'Baby Lotion & Soap Set', price: 180, description: 'Gentle, skin-friendly daily baby care.', imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=150&h=150&fit=crop&auto=format' },
    { name: 'Baby Wipes Pack (80 pcs)', price: 90, description: 'Alcohol-free organic baby wipes.', imageUrl: 'https://images.unsplash.com/photo-1522850959076-b4840a950853?w=150&h=150&fit=crop&auto=format' },
    { name: 'Baby Rattle & Teether Toy', price: 120, description: 'BPA-free soothing chewing toy.', imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=150&h=150&fit=crop&auto=format' }
  ],
  'Medical Checkup Kit': [
    { name: 'Digital Body Thermometer', price: 120, description: 'Accurate oral/underarm digital reading.', imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf241f2c44e?w=150&h=150&fit=crop&auto=format' },
    { name: 'Fingertip Pulse Oximeter', price: 490, description: 'Instant blood oxygen level reader.', imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=150&h=150&fit=crop&auto=format' }
  ],
  'Food Kit': [
    { name: 'Instant Noodles Pack (10 pcs)', price: 140, description: 'Quick cooking emergency hot food.', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=150&h=150&fit=crop&auto=format' },
    { name: 'Energy Biscuits Pack (5 pcs)', price: 50, description: 'High-calorie energy snacks.', imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=150&h=150&fit=crop&auto=format' }
  ],
  'Shelter Kit': [
    { name: 'Nylon Tying Ropes (20m)', price: 90, description: 'High-strength load binding ropes.', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&h=150&fit=crop&auto=format' },
    { name: 'Emergency Rechargeable Torch', price: 250, description: 'Bright LED torch with solar recharge.', imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=150&h=150&fit=crop&auto=format' }
  ],
  'Clothing Kit': [
    { name: 'Womens Thermal Shawl', price: 350, description: 'Warm body covering woolen shawl.', imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=150&h=150&fit=crop&auto=format' },
    { name: 'Kids T-Shirt & Shorts', price: 200, description: 'Comfortable cotton casual set.', imageUrl: 'https://images.unsplash.com/photo-1622290291468-a28f7317ce08?w=150&h=150&fit=crop&auto=format' }
  ]
};
