-- Add day_number column to track daily completions instead of just monthly
ALTER TABLE public.twenty_one_task_completions 
ADD COLUMN day_number integer;

-- Update existing records to have day 1 as default
UPDATE public.twenty_one_task_completions SET day_number = 1 WHERE day_number IS NULL;

-- Make day_number NOT NULL after setting defaults
ALTER TABLE public.twenty_one_task_completions 
ALTER COLUMN day_number SET NOT NULL;

-- Add constraint to ensure day_number is valid (1-31)
ALTER TABLE public.twenty_one_task_completions
ADD CONSTRAINT valid_day_number CHECK (day_number >= 1 AND day_number <= 31);