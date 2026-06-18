-- Expand business types for common Sri Lankan micro businesses (customer gaps, not gov taxonomy)
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'construction_contractor';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'salon_beauty';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'tuition_education';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'transport_hire';
ALTER TYPE business_type ADD VALUE IF NOT EXISTS 'workshop_repair';
