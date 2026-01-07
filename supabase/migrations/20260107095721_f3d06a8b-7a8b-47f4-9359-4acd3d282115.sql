-- Drop the old unique constraint that doesn't include day_number
ALTER TABLE public.twenty_one_task_completions 
DROP CONSTRAINT IF EXISTS twenty_one_task_completions_task_id_month_number_year_key;

-- Add correct unique constraint that includes day_number
ALTER TABLE public.twenty_one_task_completions 
ADD CONSTRAINT twenty_one_task_completions_unique_daily 
UNIQUE (task_id, user_id, month_number, day_number, year);