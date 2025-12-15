import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const UploadLogo = () => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    setSuccess(false);

    try {
      // Fetch the logo from public folder
      const response = await fetch('/athunna-logo.png');
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('community-images')
        .upload('athunna-logo.png', blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) throw error;

      setSuccess(true);
      toast.success("Logo uploaded successfully!");
      console.log("Upload successful:", data);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload da Logo Athunna</CardTitle>
          <CardDescription>
            Clique no botão abaixo para fazer upload da logo para o Supabase Storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/athunna-logo.png" 
              alt="Athunna Logo" 
              className="h-24 object-contain"
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={uploading || success}
            className="w-full"
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : success ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Upload Concluído!
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Fazer Upload da Logo
              </>
            )}
          </Button>

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>A logo foi enviada com sucesso para o bucket community-images!</span>
            </div>
          )}

          {!success && !uploading && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>Esta página faz upload da logo athunna-logo.png para o Storage do Supabase.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadLogo;
