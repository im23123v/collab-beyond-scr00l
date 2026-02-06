-- Create repeat_tasks table for storing the repeating tasks
CREATE TABLE public.repeat_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create repeat_task_completions table for tracking daily completions
CREATE TABLE public.repeat_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.repeat_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, date)
);

-- Enable RLS
ALTER TABLE public.repeat_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repeat_task_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for repeat_tasks
CREATE POLICY "Users can view own repeat tasks" ON public.repeat_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own repeat tasks" ON public.repeat_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all repeat tasks" ON public.repeat_tasks FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can manage all repeat tasks" ON public.repeat_tasks FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for repeat_task_completions
CREATE POLICY "Users can view own completions" ON public.repeat_task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own completions" ON public.repeat_task_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all completions" ON public.repeat_task_completions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can manage all completions" ON public.repeat_task_completions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_repeat_tasks_updated_at
  BEFORE UPDATE ON public.repeat_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();