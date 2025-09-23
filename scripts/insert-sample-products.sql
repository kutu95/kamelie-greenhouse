-- Sample products for Kamelie Greenhouse
-- Based on typical camellia-related products

-- Soil and Substrate Products
INSERT INTO products (name_de, name_en, description_de, description_en, category, sku, price_euros, stock_quantity, weight_kg, is_featured, sort_order) VALUES
('Kamelien-Erde 10L', 'Camellia Soil 10L', 'Speziell für Kamelien zusammengestellte Erde mit optimalem pH-Wert und Nährstoffgehalt. Perfekt für Topfkulturen.', 'Specially formulated soil for camellias with optimal pH and nutrient content. Perfect for pot cultivation.', 'soil', 'SOIL-10L', 8.50, 50, 8.5, true, 1),
('Kamelien-Erde 25L', 'Camellia Soil 25L', 'Größere Packung unserer hochwertigen Kamelien-Erde. Ideal für größere Pflanzen oder mehrere Töpfe.', 'Larger package of our high-quality camellia soil. Ideal for larger plants or multiple pots.', 'soil', 'SOIL-25L', 18.50, 30, 20.0, false, 2),
('Rhododendron-Erde 40L', 'Rhododendron Soil 40L', 'Saurer Spezialdünger für Rhododendren und Kamelien. Optimale Nährstoffzusammensetzung für Moorbeetpflanzen.', 'Acidic special fertilizer for rhododendrons and camellias. Optimal nutrient composition for bog plants.', 'soil', 'SOIL-RHO-40L', 24.90, 20, 35.0, false, 3),
('Rindenmulch 60L', 'Bark Mulch 60L', 'Hochwertiger Rindenmulch zur Bodenabdeckung. Schützt vor Austrocknung und unterdrückt Unkraut.', 'High-quality bark mulch for soil coverage. Protects against drying out and suppresses weeds.', 'soil', 'MULCH-60L', 12.90, 25, 15.0, false, 4);

-- Pots and Planters
INSERT INTO products (name_de, name_en, description_de, description_en, category, sku, price_euros, stock_quantity, dimensions_cm, is_featured, sort_order) VALUES
('Terrakotta-Topf 20cm', 'Terracotta Pot 20cm', 'Klassischer Terrakotta-Topf in verschiedenen Größen. Atmungsaktiv und wasserdurchlässig.', 'Classic terracotta pot in various sizes. Breathable and water-permeable.', 'pots', 'POT-TERRA-20', 15.90, 40, '20x20x18', true, 5),
('Terrakotta-Topf 30cm', 'Terracotta Pot 30cm', 'Größerer Terrakotta-Topf für ausgewachsene Kamelien. Mit Drainagelöchern.', 'Larger terracotta pot for mature camellias. With drainage holes.', 'pots', 'POT-TERRA-30', 28.90, 25, '30x30x25', false, 6),
('Kunststoff-Topf 25L', 'Plastic Pot 25L', 'Robuster Kunststoff-Topf für den Außenbereich. Frostsicher und UV-beständig.', 'Robust plastic pot for outdoor use. Frost-proof and UV-resistant.', 'pots', 'POT-PLAST-25L', 12.50, 60, '35x35x30', false, 7),
('Kunststoff-Topf 50L', 'Plastic Pot 50L', 'Großer Kunststoff-Topf für große Kamelien. Mit integrierten Tragegriffen.', 'Large plastic pot for large camellias. With integrated carrying handles.', 'pots', 'POT-PLAST-50L', 22.90, 30, '45x45x40', false, 8),
('Keramik-Übertopf 24cm', 'Ceramic Cache Pot 24cm', 'Eleganter Keramik-Übertopf für den Innenbereich. In verschiedenen Farben erhältlich.', 'Elegant ceramic cache pot for indoor use. Available in various colors.', 'pots', 'POT-CERAM-24', 35.90, 20, '24x24x20', true, 9);

-- Fertilizers and Plant Care
INSERT INTO products (name_de, name_en, description_de, description_en, category, sku, price_euros, stock_quantity, weight_kg, is_featured, sort_order) VALUES
('Kamelien-Dünger 1kg', 'Camellia Fertilizer 1kg', 'Spezieller Langzeitdünger für Kamelien. Für gesundes Wachstum und reiche Blüte.', 'Special slow-release fertilizer for camellias. For healthy growth and rich flowering.', 'fertilizer', 'FERT-KAM-1KG', 18.90, 40, 1.0, true, 10),
('Rhododendron-Dünger 2kg', 'Rhododendron Fertilizer 2kg', 'Organischer Dünger für Rhododendren und Kamelien. Schont den Boden und fördert das Wurzelwachstum.', 'Organic fertilizer for rhododendrons and camellias. Gentle on soil and promotes root growth.', 'fertilizer', 'FERT-RHO-2KG', 24.90, 25, 2.0, false, 11),
('Eisen-Dünger 500ml', 'Iron Fertilizer 500ml', 'Flüssiger Eisendünger gegen Chlorose. Für gesunde, grüne Blätter.', 'Liquid iron fertilizer against chlorosis. For healthy, green leaves.', 'fertilizer', 'FERT-IRON-500ML', 12.90, 30, 0.6, false, 12),
('pH-Senker 1kg', 'pH Lowerer 1kg', 'Granulat zum Senken des pH-Werts. Für saure Böden wie sie Kamelien bevorzugen.', 'Granulate to lower pH value. For acidic soils as preferred by camellias.', 'fertilizer', 'FERT-PH-1KG', 15.90, 35, 1.0, false, 13);

-- Seeds
INSERT INTO products (name_de, name_en, description_de, description_en, category, sku, price_euros, stock_quantity, is_featured, sort_order) VALUES
('Kamelien-Samen Mix', 'Camellia Seed Mix', 'Samenmischung verschiedener Kamelien-Sorten. Für erfahrene Gärtner zur eigenen Zucht.', 'Seed mix of various camellia varieties. For experienced gardeners for own breeding.', 'seeds', 'SEED-KAM-MIX', 8.90, 100, false, 14),
('Camellia japonica Samen', 'Camellia japonica Seeds', 'Samen der klassischen Japanischen Kamelie. Keimzeit 4-8 Wochen bei 20-25°C.', 'Seeds of the classic Japanese camellia. Germination time 4-8 weeks at 20-25°C.', 'seeds', 'SEED-JAPONICA', 6.90, 80, false, 15),
('Camellia sasanqua Samen', 'Camellia sasanqua Seeds', 'Samen der Herbst-Kamelie. Frühe Blüte und duftende Blüten.', 'Seeds of the autumn camellia. Early flowering and fragrant flowers.', 'seeds', 'SEED-SASANQUA', 7.90, 60, false, 16);

-- Tools and Accessories
INSERT INTO products (name_de, name_en, description_de, description_en, category, sku, price_euros, stock_quantity, is_featured, sort_order) VALUES
('Kamelien-Gießkanne 5L', 'Camellia Watering Can 5L', 'Spezielle Gießkanne mit feiner Brause. Ideal für die schonende Bewässerung von Kamelien.', 'Special watering can with fine spray. Ideal for gentle watering of camellias.', 'tools', 'TOOL-CAN-5L', 24.90, 15, true, 17),
('pH-Messgerät', 'pH Meter', 'Digitales pH-Messgerät für Boden und Wasser. Wichtig für die richtige Kamelienpflege.', 'Digital pH meter for soil and water. Important for proper camellia care.', 'tools', 'TOOL-PH-METER', 45.90, 10, false, 18),
('Bonsai-Schere', 'Bonsai Scissors', 'Hochwertige Schere für den Formschnitt. Ideal für Kamelien in kleineren Töpfen.', 'High-quality scissors for topiary. Ideal for camellias in smaller pots.', 'tools', 'TOOL-SCISSORS', 28.90, 20, false, 19),
('Pflanzenetiketten Set', 'Plant Labels Set', 'Wetterfeste Pflanzenetiketten aus Kunststoff. Für die Beschriftung Ihrer Kamelien.', 'Weatherproof plant labels made of plastic. For labeling your camellias.', 'accessories', 'ACC-LABELS-50', 8.90, 50, false, 20),
('Kamelien-Buch', 'Camellia Book', 'Umfassendes Buch über Kamelienpflege und -sorten. Von unserem Experten geschrieben.', 'Comprehensive book about camellia care and varieties. Written by our expert.', 'accessories', 'BOOK-CAMELLIA', 19.90, 25, true, 21);

-- Gift Sets
INSERT INTO products (name_de, name_en, description_de, description_en, category, sku, price_euros, stock_quantity, is_featured, sort_order) VALUES
('Kamelien-Starter-Set', 'Camellia Starter Set', 'Alles was Sie für den Einstieg in die Kamelienzucht brauchen: Erde, Dünger, Topf und Gießkanne.', 'Everything you need to get started with camellia cultivation: soil, fertilizer, pot and watering can.', 'accessories', 'SET-STARTER', 69.90, 15, true, 22),
('Premium-Kamelien-Set', 'Premium Camellia Set', 'Hochwertiges Set für erfahrene Kamelienliebhaber. Mit speziellen Werkzeugen und Pflegeprodukten.', 'High-quality set for experienced camellia lovers. With special tools and care products.', 'accessories', 'SET-PREMIUM', 129.90, 8, false, 23);
