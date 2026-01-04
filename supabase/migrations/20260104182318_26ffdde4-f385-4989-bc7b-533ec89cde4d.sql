-- Create habits table for heatmap tracking
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#22c55e',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create habit_entries table for daily tracking
CREATE TABLE public.habit_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits
CREATE POLICY "Admin can manage all habits" 
ON public.habits 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can view all habits" 
ON public.habits 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage own habits" 
ON public.habits 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habits" 
ON public.habits 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for habit_entries
CREATE POLICY "Admin can manage all habit entries" 
ON public.habit_entries 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can view all habit entries" 
ON public.habit_entries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage own habit entries" 
ON public.habit_entries 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit entries" 
ON public.habit_entries 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON public.habits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();