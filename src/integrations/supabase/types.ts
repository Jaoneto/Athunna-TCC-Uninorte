export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          capacidade_maxima: number | null
          carga_horaria: number | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          evento_id: string | null
          id: string
          local: string | null
          palestrante: string | null
          palestrante_bio: string | null
          tipo: string | null
          titulo: string
          updated_at: string | null
          vagas_disponiveis: number | null
        }
        Insert: {
          capacidade_maxima?: number | null
          carga_horaria?: number | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          evento_id?: string | null
          id?: string
          local?: string | null
          palestrante?: string | null
          palestrante_bio?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          vagas_disponiveis?: number | null
        }
        Update: {
          capacidade_maxima?: number | null
          carga_horaria?: number | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          evento_id?: string | null
          id?: string
          local?: string | null
          palestrante?: string | null
          palestrante_bio?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          vagas_disponiveis?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "atividades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      certificados: {
        Row: {
          atividade_id: string | null
          carga_horaria: number | null
          codigo_verificacao: string
          created_at: string | null
          data_emissao: string | null
          evento_id: string | null
          id: string
          tipo: string | null
          url_pdf: string | null
          usuario_id: string
        }
        Insert: {
          atividade_id?: string | null
          carga_horaria?: number | null
          codigo_verificacao: string
          created_at?: string | null
          data_emissao?: string | null
          evento_id?: string | null
          id?: string
          tipo?: string | null
          url_pdf?: string | null
          usuario_id: string
        }
        Update: {
          atividade_id?: string | null
          carga_horaria?: number | null
          codigo_verificacao?: string
          created_at?: string | null
          data_emissao?: string | null
          evento_id?: string | null
          id?: string
          tipo?: string | null
          url_pdf?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          tags: string[] | null
          tipo: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          tags?: string[] | null
          tipo?: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          tags?: string[] | null
          tipo?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          capacidade_maxima: number | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          id: string
          imagem_url: string | null
          instituicao_id: string | null
          link_online: string | null
          local: string | null
          modalidade: string | null
          publico_alvo: string | null
          requisitos: string | null
          responsavel_id: string | null
          status: string | null
          tipo: string
          titulo: string
          updated_at: string | null
          vagas_disponiveis: number | null
        }
        Insert: {
          capacidade_maxima?: number | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          instituicao_id?: string | null
          link_online?: string | null
          local?: string | null
          modalidade?: string | null
          publico_alvo?: string | null
          requisitos?: string | null
          responsavel_id?: string | null
          status?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
          vagas_disponiveis?: number | null
        }
        Update: {
          capacidade_maxima?: number | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          instituicao_id?: string | null
          link_online?: string | null
          local?: string | null
          modalidade?: string | null
          publico_alvo?: string | null
          requisitos?: string | null
          responsavel_id?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          vagas_disponiveis?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes_eventos: {
        Row: {
          certificado_emitido: boolean | null
          created_at: string | null
          data_cancelamento: string | null
          data_inscricao: string | null
          evento_id: string
          id: string
          notas: string | null
          presenca_confirmada: boolean | null
          status: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          certificado_emitido?: boolean | null
          created_at?: string | null
          data_cancelamento?: string | null
          data_inscricao?: string | null
          evento_id: string
          id?: string
          notas?: string | null
          presenca_confirmada?: boolean | null
          status?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          certificado_emitido?: boolean | null
          created_at?: string | null
          data_cancelamento?: string | null
          data_inscricao?: string | null
          evento_id?: string
          id?: string
          notas?: string | null
          presenca_confirmada?: boolean | null
          status?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_eventos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes_publicas: {
        Row: {
          cpf: string | null
          created_at: string
          data_inscricao: string
          email: string
          evento_id: string
          id: string
          matricula: string | null
          nome_completo: string
          observacoes: string | null
          status: string
          telefone: string
          tipo_vinculo: string
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_inscricao?: string
          email: string
          evento_id: string
          id?: string
          matricula?: string | null
          nome_completo: string
          observacoes?: string | null
          status?: string
          telefone: string
          tipo_vinculo: string
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_inscricao?: string
          email?: string
          evento_id?: string
          id?: string
          matricula?: string | null
          nome_completo?: string
          observacoes?: string | null
          status?: string
          telefone?: string
          tipo_vinculo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_publicas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      instituicoes: {
        Row: {
          cidade: string | null
          contato_email: string | null
          contato_telefone: string | null
          created_at: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          pais: string | null
          sigla: string | null
          tipo: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          cidade?: string | null
          contato_email?: string | null
          contato_telefone?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          pais?: string | null
          sigla?: string | null
          tipo?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          cidade?: string | null
          contato_email?: string | null
          contato_telefone?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          pais?: string | null
          sigla?: string | null
          tipo?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      login_audit_log: {
        Row: {
          attempt_count: number | null
          created_at: string
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          locked_until: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          locked_until?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          locked_until?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string
          tipo: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem: string
          tipo?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string
          tipo?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      participacoes_atividades: {
        Row: {
          atividade_id: string
          avaliacao: number | null
          certificado_url: string | null
          created_at: string | null
          feedback: string | null
          id: string
          presenca: boolean | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          atividade_id: string
          avaliacao?: number | null
          certificado_url?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          presenca?: boolean | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          atividade_id?: string
          avaliacao?: number | null
          certificado_url?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          presenca?: boolean | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participacoes_atividades_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participacoes_atividades_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_audit_log: {
        Row: {
          action_type: string
          changed_by: string
          created_at: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"]
          notes: string | null
          previous_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          action_type: string
          changed_by: string
          created_at?: string
          id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          notes?: string | null
          previous_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          action_type?: string
          changed_by?: string
          created_at?: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"]
          notes?: string | null
          previous_role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      sensitive_data_audit: {
        Row: {
          accessed_by: string
          action_type: string
          created_at: string
          fields_accessed: string[] | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          accessed_by: string
          action_type?: string
          created_at?: string
          fields_accessed?: string[] | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          accessed_by?: string
          action_type?: string
          created_at?: string
          fields_accessed?: string[] | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      two_factor_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          curso: string | null
          data_nascimento: string | null
          email: string
          id: string
          nome_completo: string
          semestre: string | null
          telefone: string | null
          tipo_perfil: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          curso?: string | null
          data_nascimento?: string | null
          email: string
          id: string
          nome_completo: string
          semestre?: string | null
          telefone?: string | null
          tipo_perfil: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          curso?: string | null
          data_nascimento?: string | null
          email?: string
          id?: string
          nome_completo?: string
          semestre?: string | null
          telefone?: string | null
          tipo_perfil?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_2fa_codes: { Args: never; Returns: undefined }
      get_cpf_full_audited: { Args: { _inscricao_id: string }; Returns: string }
      get_inscricoes_publicas_audited: {
        Args: { _evento_id?: string }
        Returns: {
          cpf_masked: string
          created_at: string
          data_inscricao: string
          email: string
          evento_id: string
          id: string
          matricula: string
          nome_completo: string
          status: string
          telefone: string
          tipo_vinculo: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_admin_safe: { Args: { _user_id: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "professor" | "estudante"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "professor", "estudante"],
    },
  },
} as const
