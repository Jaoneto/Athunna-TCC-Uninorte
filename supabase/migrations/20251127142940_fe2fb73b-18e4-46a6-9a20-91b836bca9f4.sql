-- Add public read policy for certificate validation
CREATE POLICY "Public can validate certificates by code"
ON public.certificados
FOR SELECT
TO anon, authenticated
USING (codigo_verificacao IS NOT NULL);