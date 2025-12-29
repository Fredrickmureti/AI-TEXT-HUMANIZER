-- Create pricing_plans table for admin-controlled pricing
CREATE TABLE public.pricing_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  credits INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_models table for admin-managed AI models with fallback
CREATE TABLE public.ai_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  api_key_encrypted TEXT,
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  rate_limit_per_minute INTEGER DEFAULT 60,
  last_error TEXT,
  last_error_at TIMESTAMP WITH TIME ZONE,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_transactions table for PayPal
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.pricing_plans(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_provider TEXT NOT NULL DEFAULT 'paypal',
  payment_id TEXT,
  payer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_settings table for admin settings
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Pricing plans: Everyone can read active plans, only admins can modify
CREATE POLICY "Anyone can view active pricing plans" 
ON public.pricing_plans 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage pricing plans" 
ON public.pricing_plans 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- AI Models: Only admins can view and manage (contains API keys)
CREATE POLICY "Admins can manage AI models" 
ON public.ai_models 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Payment transactions: Users can view their own, admins can view all
CREATE POLICY "Users can view their own transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.payment_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions" 
ON public.payment_transactions 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- System settings: Only admins can view and manage
CREATE POLICY "Admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_pricing_plans_updated_at
BEFORE UPDATE ON public.pricing_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at
BEFORE UPDATE ON public.ai_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, description, price, credits, features, is_active, is_popular, sort_order)
VALUES 
  ('Free', 'Get started with basic features', 0, 100, '["100 credits", "Basic AI detection", "Standard humanization"]'::jsonb, true, false, 0),
  ('Pro', 'For professionals and content creators', 19.99, 1000, '["1,000 credits", "Advanced AI detection", "Strong humanization", "Priority support", "API access"]'::jsonb, true, true, 1),
  ('Enterprise', 'For teams and businesses', 49.99, 5000, '["5,000 credits", "All Pro features", "Custom integrations", "Dedicated support", "Team management"]'::jsonb, true, false, 2);

-- Insert default AI model (Lovable AI)
INSERT INTO public.ai_models (name, provider, model_id, is_active, priority, is_default, api_endpoint)
VALUES 
  ('Gemini 2.5 Flash', 'lovable', 'google/gemini-2.5-flash', true, 1, true, 'https://ai.gateway.lovable.dev/v1/chat/completions'),
  ('Gemini 2.5 Pro', 'lovable', 'google/gemini-2.5-pro', true, 2, false, 'https://ai.gateway.lovable.dev/v1/chat/completions'),
  ('GPT-5 Mini', 'lovable', 'openai/gpt-5-mini', true, 3, false, 'https://ai.gateway.lovable.dev/v1/chat/completions');

-- Insert default system settings
INSERT INTO public.system_settings (key, value)
VALUES 
  ('paypal_enabled', 'true'::jsonb),
  ('paypal_mode', '"sandbox"'::jsonb);