-- Create table for 21 tasks (habit-forming tasks)
CREATE TABLE public.twenty_one_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for monthly completions of 21 tasks
CREATE TABLE public.twenty_one_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.twenty_one_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  year INTEGER NOT NULL DEFAULT 2026,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, month_number, year)
);

-- Create table for daily heat intensity tracking
CREATE TABLE public.daily_heat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 1 CHECK (intensity >= 1 AND intensity <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.twenty_one_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twenty_one_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_heat ENABLE ROW LEVEL SECURITY;

-- RLS policies for twenty_one_tasks
CREATE POLICY "Users can view own 21 tasks" ON public.twenty_one_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own 21 tasks" ON public.twenty_one_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all 21 tasks" ON public.twenty_one_tasks FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can manage all 21 tasks" ON public.twenty_one_tasks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for twenty_one_task_completions
CREATE POLICY "Users can view own completions" ON public.twenty_one_task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own completions" ON public.twenty_one_task_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all completions" ON public.twenty_one_task_completions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can manage all completions" ON public.twenty_one_task_completions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for daily_heat
CREATE POLICY "Users can view own heat" ON public.daily_heat FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own heat" ON public.daily_heat FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all heat" ON public.daily_heat FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can manage all heat" ON public.daily_heat FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Update triggers
CREATE TRIGGER update_twenty_one_tasks_updated_at
  BEFORE UPDATE ON public.twenty_one_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();