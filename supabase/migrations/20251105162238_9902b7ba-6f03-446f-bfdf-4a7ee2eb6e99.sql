-- Criar trigger para sincronizar inscrições de eventos com participações em atividades
-- Quando alguém se inscreve em um evento, cria automaticamente participação nas atividades desse evento

CREATE OR REPLACE FUNCTION sync_event_registration_to_activities()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quando uma inscrição em evento é criada (INSERT)
  IF (TG_OP = 'INSERT') THEN
    -- Buscar todas as atividades desse evento
    INSERT INTO participacoes_atividades (usuario_id, atividade_id, presenca, created_at, updated_at)
    SELECT 
      NEW.usuario_id,
      a.id,
      false,
      now(),
      now()
    FROM atividades a
    WHERE a.evento_id = NEW.evento_id
    ON CONFLICT (usuario_id, atividade_id) DO NOTHING;
    
    RETURN NEW;
  END IF;
  
  -- Quando uma inscrição em evento é deletada (DELETE)
  IF (TG_OP = 'DELETE') THEN
    -- Deletar participações nas atividades desse evento
    DELETE FROM participacoes_atividades
    WHERE usuario_id = OLD.usuario_id
    AND atividade_id IN (
      SELECT id FROM atividades WHERE evento_id = OLD.evento_id
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS sync_event_to_activities ON inscricoes_eventos;

CREATE TRIGGER sync_event_to_activities
AFTER INSERT OR DELETE ON inscricoes_eventos
FOR EACH ROW
EXECUTE FUNCTION sync_event_registration_to_activities();

-- Sincronizar dados existentes
INSERT INTO participacoes_atividades (usuario_id, atividade_id, presenca, created_at, updated_at)
SELECT DISTINCT
  ie.usuario_id,
  a.id,
  false,
  ie.created_at,
  now()
FROM inscricoes_eventos ie
JOIN atividades a ON a.evento_id = ie.evento_id
WHERE ie.status = 'confirmada'
ON CONFLICT (usuario_id, atividade_id) DO NOTHING;

-- Adicionar constraint único se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'participacoes_atividades_usuario_atividade_key'
  ) THEN
    ALTER TABLE participacoes_atividades
    ADD CONSTRAINT participacoes_atividades_usuario_atividade_key 
    UNIQUE (usuario_id, atividade_id);
  END IF;
END $$;