-- Create notes table
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  color text DEFAULT '#3b82f6',
  is_pinned boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'active',
  color text DEFAULT '#8b5cf6',
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create weekly_tasks table (kanban style)
CREATE TABLE public.weekly_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo',
  week_number integer NOT NULL,
  year integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create day_ratings table
CREATE TABLE public.day_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  rated_by uuid NOT NULL,
  date date NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, rated_by, date)
);

-- Enable RLS on all tables
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_ratings ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all notes" ON public.notes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can view all notes" ON public.notes FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Projects policies
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all projects" ON public.projects FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can view all projects" ON public.projects FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Weekly tasks policies
CREATE POLICY "Users can manage own weekly tasks" ON public.weekly_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own weekly tasks" ON public.weekly_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all weekly tasks" ON public.weekly_tasks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can view all weekly tasks" ON public.weekly_tasks FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Day ratings policies (users can rate each other)
CREATE POLICY "Users can rate their own day" ON public.day_ratings FOR INSERT WITH CHECK (auth.uid() = rated_by);
CREATE POLICY "Users can view ratings for themselves" ON public.day_ratings FOR SELECT USING (auth.uid() = user_id OR auth.uid() = rated_by);
CREATE POLICY "Admin can manage all ratings" ON public.day_ratings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can view all ratings" ON public.day_ratings FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_weekly_tasks_updated_at BEFORE UPDATE ON public.weekly_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();