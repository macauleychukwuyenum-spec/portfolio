ALTER TABLE public.site_settings
  ADD COLUMN show_support boolean NOT NULL DEFAULT true,
  ADD COLUMN support_heading text NOT NULL DEFAULT 'Support the work',
  ADD COLUMN support_text text NOT NULL DEFAULT 'If a class, a file or a guide here helped you, chip in whatever you like.',
  ADD COLUMN support_amounts integer[] NOT NULL DEFAULT '{2000,5000,10000,20000}',
  ADD COLUMN bank_name text,
  ADD COLUMN bank_account_name text,
  ADD COLUMN bank_account_number text;

CREATE TABLE public.support_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount integer NOT NULL CHECK (amount > 0 AND amount <= 100000000),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  name text CHECK (name IS NULL OR char_length(name) <= 120),
  receipt text NOT NULL CHECK (receipt LIKE 'sb:receipts/%'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.support_payments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_payments TO authenticated;
GRANT ALL ON public.support_payments TO service_role;
ALTER TABLE public.support_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submits pending" ON public.support_payments FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Admin read" ON public.support_payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update" ON public.support_payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete" ON public.support_payments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone uploads receipts" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Admin reads receipts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes receipts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));