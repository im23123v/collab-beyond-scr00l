-- Add signal_priority to tasks for traffic light indicator
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS signal_priority text DEFAULT 'green' CHECK (signal_priority IN ('red', 'orange', 'green'));

-- Add quadrant column for Eisenhower matrix
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS quadrant text DEFAULT 'q4' CHECK (quadrant IN ('q1', 'q2', 'q3', 'q4'));

-- Allow all authenticated users to view admin (vishwa) profile for chat
CREATE POLICY "Users can view admin profile for chat"
ON public.profiles
FOR SELECT
TO authenticated
USING (username = 'vishwa');