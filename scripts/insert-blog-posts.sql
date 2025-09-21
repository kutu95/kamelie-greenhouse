-- Insert blog posts into the database
-- First, get the admin user ID (replace with actual admin user ID)
-- You can find this by running: SELECT id FROM user_profiles WHERE email = 'admin@example.com';

-- For now, we'll use a placeholder UUID - replace with actual admin user ID
-- You can get the admin user ID by running this query first:
-- SELECT id FROM user_profiles WHERE email = 'john@streamtime.com.au';

-- Insert the blog posts
INSERT INTO blog_posts (
  title_de,
  title_en,
  slug,
  content_de,
  content_en,
  excerpt_de,
  excerpt_en,
  featured_image_url,
  status,
  published_at,
  meta_title_de,
  meta_title_en,
  meta_description_de,
  meta_description_en,
  tags,
  author_id
) VALUES 
(
  'Die beste Zeit für Kamelien-Pflege',
  'The Best Time for Camellia Care',
  'beste-zeit-kamelien-pflege',
  'Die Kamelien-Pflege ist eine Kunst, die Geduld und Wissen erfordert. Der richtige Zeitpunkt für die verschiedenen Pflegemaßnahmen ist entscheidend für eine üppige Blüte und gesunde Pflanzen. In diesem Artikel erfahren Sie, wann Sie Ihre Kamelien am besten düngen, schneiden und umtopfen sollten. Die Hauptwachstumsphase der Kamelien liegt zwischen März und September. In dieser Zeit sollten Sie regelmäßig düngen und bei Bedarf schneiden. Der Herbst ist ideal für das Umtopfen, da die Pflanzen dann in die Ruhephase gehen. Im Winter benötigen Kamelien nur wenig Wasser und sollten kühl, aber frostfrei stehen. Besonders wichtig ist die richtige Bewässerung: Gießen Sie nur, wenn die oberste Erdschicht trocken ist, und vermeiden Sie Staunässe. Mit diesen Tipps werden Ihre Kamelien prächtig gedeihen und Sie mit wunderschönen Blüten belohnen.',
  'Camellia care is an art that requires patience and knowledge. The right timing for various care measures is crucial for lush blooms and healthy plants. In this article, you''ll learn when to best fertilize, prune, and repot your camellias. The main growth phase of camellias is between March and September. During this time, you should fertilize regularly and prune as needed. Autumn is ideal for repotting, as the plants then enter their dormant phase. In winter, camellias need little water and should be kept cool but frost-free. Proper watering is especially important: only water when the top layer of soil is dry, and avoid waterlogging. With these tips, your camellias will thrive and reward you with beautiful blooms.',
  'Erfahren Sie, wann und wie Sie Ihre Kamelien am besten pflegen sollten, um eine üppige Blüte zu erzielen.',
  'Learn when and how to best care for your camellias to achieve lush blooms.',
  '/images/hero/quartier-grosspflanzen.jpg',
  'published',
  '2024-01-15T00:00:00Z',
  'Kamelien-Pflege: Die beste Zeit für optimale Blüte',
  'Camellia Care: The Best Time for Optimal Blooming',
  'Entdecken Sie die besten Zeiten für Kamelien-Pflege. Tipps für Düngung, Schnitt und Umtopfen für üppige Blüten.',
  'Discover the best times for camellia care. Tips for fertilizing, pruning and repotting for lush blooms.',
  ARRAY['Pflege', 'Timing', 'Blüte', 'Garten'],
  (SELECT id FROM user_profiles WHERE email = 'john@streamtime.com.au' LIMIT 1)
),
(
  'Kamelien-Sorten für den Garten',
  'Camellia Varieties for the Garden',
  'kamelien-sorten-garten',
  'Mit über 3.000 verschiedenen Sorten in unserer Sammlung bieten wir eine beeindruckende Vielfalt an Kamelien für jeden Garten. Von klassischen Sorten wie ''April Rose'' bis hin zu seltenen Raritäten - jede Sorte hat ihre eigenen Besonderheiten und Anforderungen. Für Einsteiger empfehlen wir robuste Sorten wie ''Nuccio''s Pearl'' oder ''Kramer''s Supreme'', die auch in weniger optimalen Bedingungen gut gedeihen. Fortgeschrittene Gärtner können sich an anspruchsvollere Sorten wie ''Lady Campbell'' oder ''Debutante'' wagen. Wichtig ist die richtige Sortenauswahl je nach Standort: Schattige Bereiche eignen sich für Sorten mit dunkleren Blättern, während sonnige Plätze helle, bunte Sorten zur Geltung bringen. Wir beraten Sie gerne bei der Auswahl der passenden Kamelien-Sorten für Ihren Garten und Ihre Wünsche.',
  'With over 3,000 different varieties in our collection, we offer an impressive diversity of camellias for every garden. From classic varieties like ''April Rose'' to rare rarities - each variety has its own special characteristics and requirements. For beginners, we recommend robust varieties like ''Nuccio''s Pearl'' or ''Kramer''s Supreme'', which thrive even in less than optimal conditions. Advanced gardeners can try more demanding varieties like ''Lady Campbell'' or ''Debutante''. The right variety selection is important depending on the location: shady areas are suitable for varieties with darker leaves, while sunny spots bring out bright, colorful varieties. We are happy to advise you on selecting the right camellia varieties for your garden and your wishes.',
  'Entdecken Sie die vielfältigen Kamelien-Sorten, die sich perfekt für Ihren Garten eignen.',
  'Discover the diverse camellia varieties that are perfect for your garden.',
  '/images/hero/quartier-grosspflanzen.jpg',
  'published',
  '2024-01-10T00:00:00Z',
  'Kamelien-Sorten: Die schönsten Sorten für Ihren Garten',
  'Camellia Varieties: The Most Beautiful Varieties for Your Garden',
  'Entdecken Sie die schönsten Kamelien-Sorten für Ihren Garten. Von klassisch bis exotisch - für jeden Geschmack das Richtige.',
  'Discover the most beautiful camellia varieties for your garden. From classic to exotic - something for every taste.',
  ARRAY['Sorten', 'Garten', 'Auswahl', 'Vielfalt'],
  (SELECT id FROM user_profiles WHERE email = 'john@streamtime.com.au' LIMIT 1)
),
(
  'Überwinterung von Kamelien',
  'Wintering Camellias',
  'ueberwinterung-kamelien',
  'Die Überwinterung ist ein entscheidender Faktor für gesunde Kamelien. In Deutschland müssen die meisten Kamelien-Sorten frostfrei überwintert werden, da sie nicht winterhart sind. Unser Gewächshaus bietet ideale Bedingungen mit Temperaturen zwischen 2-8°C und hoher Luftfeuchtigkeit. Wichtig ist eine schrittweise Anpassung: Reduzieren Sie ab September die Wassergaben und stellen Sie die Düngung ein. Die Pflanzen sollten hell, aber nicht in direkter Sonne stehen. Regelmäßiges Lüften verhindert Pilzbefall. Im Frühjahr gewöhnen Sie die Kamelien langsam an wärmere Temperaturen und steigern die Wassergaben. Wir bieten auch Überwinterungsservice für Ihre Kamelien an - so können Sie sicher sein, dass Ihre Pflanzen optimal versorgt werden.',
  'Overwintering is a crucial factor for healthy camellias. In Germany, most camellia varieties must be overwintered frost-free as they are not winter-hardy. Our greenhouse offers ideal conditions with temperatures between 2-8°C and high humidity. A gradual adjustment is important: reduce watering from September and stop fertilizing. The plants should be in bright light but not in direct sun. Regular ventilation prevents fungal infestation. In spring, gradually acclimate the camellias to warmer temperatures and increase watering. We also offer overwintering service for your camellias - so you can be sure your plants are optimally cared for.',
  'Tipps und Tricks für die erfolgreiche Überwinterung Ihrer Kamelien im Gewächshaus.',
  'Tips and tricks for successfully wintering your camellias in the greenhouse.',
  '/images/hero/quartier-grosspflanzen.jpg',
  'published',
  '2024-01-05T00:00:00Z',
  'Kamelien überwintern: Tipps für gesunde Pflanzen im Winter',
  'Overwintering Camellias: Tips for Healthy Plants in Winter',
  'Erfahren Sie, wie Sie Ihre Kamelien erfolgreich überwintern. Professionelle Tipps für gesunde Pflanzen.',
  'Learn how to successfully overwinter your camellias. Professional tips for healthy plants.',
  ARRAY['Überwinterung', 'Winter', 'Gewächshaus', 'Pflege'],
  (SELECT id FROM user_profiles WHERE email = 'john@streamtime.com.au' LIMIT 1)
),
(
  'Geschichte der Kamelien in Deutschland',
  'History of Camellias in Germany',
  'geschichte-kamelien-deutschland',
  'Die Geschichte der Kamelien in Deutschland ist eine faszinierende Erzählung botanischer Entdeckungen und kulturellen Austauschs. Camellia japonica, die berühmteste Art, gelangte im frühen 18. Jahrhundert erstmals nach Europa, gebracht von portugiesischen und niederländischen Händlern aus Japan und China. Deutsche botanische Gärten, insbesondere die in Dresden und Hamburg, spielten eine entscheidende Rolle bei der Einführung dieser exotischen Pflanzen in Mitteleuropa. Das Schloss Pillnitz bei Dresden wurde in den 1730er Jahren zu einem der ersten Orte in Deutschland, der erfolgreich Kamelien kultivierte und damit die Tradition der Kamelienzucht begründete, die bis heute fortbesteht. Im 19. Jahrhundert wurden Kamelien zu Symbolen von Reichtum und Raffinesse in der deutschen Gesellschaft, wobei aufwendige Gewächshaussammlungen zu Statussymbolen unter der Aristokratie wurden. Die Fähigkeit der Pflanze, in den Wintermonaten zu blühen, machte sie besonders wertvoll in Deutschlands rauem Klima. Heute ist Deutschland eines der führenden Zentren für Kamelienzucht in Europa, mit zahlreichen botanischen Gärten und privaten Sammlungen, die sowohl historische als auch moderne Sorten bewahren. Unsere eigene Sammlung im Kamelie Greenhouse setzt diese reiche Tradition fort und bewahrt über 3.000 Pflanzen, die sowohl das historische Erbe als auch das zukünftige Potenzial der Kamelienzucht in Deutschland repräsentieren.',
  'The history of camellias in Germany is a fascinating tale of botanical discovery and cultural exchange. Camellia japonica, the most famous species, first arrived in Europe in the early 18th century, brought by Portuguese and Dutch traders from Japan and China. German botanical gardens, particularly those in Dresden and Hamburg, played crucial roles in introducing these exotic plants to Central Europe. The Pillnitz Palace near Dresden became one of the first locations in Germany to successfully cultivate camellias in the 1730s, establishing the tradition of camellia cultivation that continues today. By the 19th century, camellias had become symbols of wealth and sophistication in German society, with elaborate greenhouse collections becoming status symbols among the aristocracy. The plant''s ability to bloom during winter months made it especially prized in Germany''s harsh climate. Today, Germany remains one of Europe''s leading centers for camellia cultivation, with numerous botanical gardens and private collections preserving both historic and modern varieties. Our own collection at Kamelie Greenhouse continues this rich tradition, maintaining over 3,000 plants that represent both the historical legacy and future potential of camellia cultivation in Germany.',
  'Eine Reise durch die Geschichte der Kamelienzucht in Deutschland und unsere Rolle dabei.',
  'A journey through the history of camellia cultivation in Germany and our role in it.',
  '/images/hero/quartier-grosspflanzen.jpg',
  'published',
  '2024-01-01T00:00:00Z',
  'Geschichte der Kamelien in Deutschland: Von Pillnitz bis heute',
  'History of Camellias in Germany: From Pillnitz to Today',
  'Entdecken Sie die faszinierende Geschichte der Kamelienzucht in Deutschland. Von den ersten Pflanzen bis zur modernen Zucht.',
  'Discover the fascinating history of camellia cultivation in Germany. From the first plants to modern breeding.',
  ARRAY['Geschichte', 'Deutschland', 'Tradition', 'Kultur'],
  (SELECT id FROM user_profiles WHERE email = 'john@streamtime.com.au' LIMIT 1)
);
