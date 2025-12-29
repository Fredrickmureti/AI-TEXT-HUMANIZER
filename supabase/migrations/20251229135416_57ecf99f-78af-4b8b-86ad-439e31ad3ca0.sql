-- Add default_user_credits setting to system_settings
INSERT INTO public.system_settings (key, value)
VALUES ('default_user_credits', '100'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create cover_letters table
CREATE TABLE public.cover_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'profile',
  resume_data JSONB,
  job_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- RLS policies for cover_letters
CREATE POLICY "Users can view their own cover letters" 
ON public.cover_letters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cover letters" 
ON public.cover_letters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters" 
ON public.cover_letters 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters" 
ON public.cover_letters 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_cover_letters_updated_at
BEFORE UPDATE ON public.cover_letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user function to read from system_settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_credits INTEGER := 100;
  credits_setting JSONB;
BEGIN
  -- Try to get default credits from system_settings
  SELECT value INTO credits_setting
  FROM public.system_settings
  WHERE key = 'default_user_credits';
  
  IF credits_setting IS NOT NULL THEN
    default_credits := (credits_setting::TEXT)::INTEGER;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    default_credits
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, default_credits, 'bonus', 'Welcome bonus credits');
  
  RETURN NEW;
END;
$function$;