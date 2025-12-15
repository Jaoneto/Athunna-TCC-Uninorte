-- Remover o default temporariamente
ALTER TABLE public.usuarios ALTER COLUMN tipo_perfil DROP DEFAULT;

-- Alterar o enum tipo_perfil para substituir 'consulta' por 'professor'
ALTER TYPE public.tipo_perfil RENAME TO tipo_perfil_old;

CREATE TYPE public.tipo_perfil AS ENUM ('admin', 'professor', 'estudante');

-- Atualizar a tabela usuarios para usar o novo enum
ALTER TABLE public.usuarios 
ALTER COLUMN tipo_perfil TYPE public.tipo_perfil 
USING CASE 
  WHEN tipo_perfil::text = 'consulta' THEN 'professor'::public.tipo_perfil
  ELSE tipo_perfil::text::public.tipo_perfil
END;

-- Restaurar o default com o novo valor
ALTER TABLE public.usuarios ALTER COLUMN tipo_perfil SET DEFAULT 'estudante'::public.tipo_perfil;

-- Remover o enum antigo
DROP TYPE public.tipo_perfil_old;

-- Atualizar as funções que referenciam 'consulta'
CREATE OR REPLACE FUNCTION public.can_read_all()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND tipo_perfil IN ('admin', 'professor')
  );
$function$;