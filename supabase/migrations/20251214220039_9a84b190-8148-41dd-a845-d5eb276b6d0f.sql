-- Add DELETE policy for certificados table
CREATE POLICY "Professors can delete own event certificates" 
ON public.certificados 
FOR DELETE 
USING (
  is_admin(auth.uid()) OR 
  (evento_id IN (
    SELECT eventos.id FROM eventos WHERE eventos.responsavel_id = auth.uid()
  )) OR
  (atividade_id IN (
    SELECT a.id FROM atividades a 
    JOIN eventos e ON a.evento_id = e.id 
    WHERE e.responsavel_id = auth.uid()
  ))
);