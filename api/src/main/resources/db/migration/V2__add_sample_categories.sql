
-- H2-compatible category insertion
INSERT INTO category (id, name, slug) VALUES 
  (random_uuid(), 'Food Assistance', 'food-assistance'),
  (random_uuid(), 'Healthcare', 'healthcare'),
  (random_uuid(), 'Housing', 'housing'),
  (random_uuid(), 'Legal Aid', 'legal-aid'),
  (random_uuid(), 'Family Services', 'family-services'),
  (random_uuid(), 'Employment', 'employment'),
  (random_uuid(), 'Education', 'education'),
  (random_uuid(), 'Mental Health', 'mental-health'),
  (random_uuid(), 'Emergency Services', 'emergency-services'),
  (random_uuid(), 'Community Centers', 'community-centers');
