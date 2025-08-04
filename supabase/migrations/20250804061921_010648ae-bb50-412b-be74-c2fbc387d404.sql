-- Update the category enum to include new values
ALTER TYPE category_type RENAME TO category_type_old;

CREATE TYPE category_type AS ENUM ('mutui', 'vacanze', 'veicoli', 'prodotti');

-- Update experiences table to use new enum
ALTER TABLE experiences 
ALTER COLUMN category TYPE category_type 
USING CASE 
  WHEN category::text = 'auto' THEN 'veicoli'::category_type
  WHEN category::text = 'amazon' THEN 'prodotti'::category_type
  ELSE category::text::category_type
END;

-- Drop old enum
DROP TYPE category_type_old;