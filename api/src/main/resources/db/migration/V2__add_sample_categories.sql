
INSERT INTO category (id, name, slug) VALUES 
  (gen_random_uuid(), 'Food Assistance', 'food-assistance'),
  (gen_random_uuid(), 'Healthcare', 'healthcare'),
  (gen_random_uuid(), 'Housing', 'housing'),
  (gen_random_uuid(), 'Legal Aid', 'legal-aid'),
  (gen_random_uuid(), 'Family Services', 'family-services'),
  (gen_random_uuid(), 'Employment', 'employment'),
  (gen_random_uuid(), 'Education', 'education'),
  (gen_random_uuid(), 'Mental Health', 'mental-health'),
  (gen_random_uuid(), 'Emergency Services', 'emergency-services'),
  (gen_random_uuid(), 'Community Centers', 'community-centers')
ON CONFLICT (name) DO NOTHING;
