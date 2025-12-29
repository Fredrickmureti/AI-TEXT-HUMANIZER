import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDocuments, Document } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { Target, Wand2, TrendingUp, Trash2, FileText, Copy, Eye } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function History() {
  const { documents, loading, deleteDocument } = useDocuments();
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const handleDelete = async (id: string) => {
    const success = await deleteDocument(id);
    if (success) {
      toast({ title: 'Document deleted' });
    } else {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied to clipboard' });
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'detection':
        return <Target className="w-5 h-5 text-primary" />;
      case 'humanization':
        return <Wand2 className="w-5 h-5 text-success" />;
      default:
        return <TrendingUp className="w-5 h-5 text-foreground" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'detection':
        return <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">Detection</span>;
      case 'humanization':
        return <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">Humanized</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-secondary text-foreground rounded-full">Both</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your processed documents.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No documents yet</p>
                <p className="text-sm">Start by detecting or humanizing some text!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      doc.document_type === 'detection' 
                        ? 'bg-primary/10' 
                        : doc.document_type === 'humanization' 
                        ? 'bg-success/10' 
                        : 'bg-secondary'
                    }`}>
                      {getTypeIcon(doc.document_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">
                          {doc.title || 'Untitled'}
                        </p>
                        {getTypeBadge(doc.document_type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()} at {new Date(doc.created_at).toLocaleTimeString()}
                        {doc.ai_score !== null && ` · AI Score: ${doc.ai_score}%`}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy(doc.humanized_text || doc.original_text)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View document dialog */}
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDoc?.title || 'Document'}</DialogTitle>
            </DialogHeader>
            {selectedDoc && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Original Text</h4>
                  <div className="p-4 bg-muted/50 rounded-lg text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {selectedDoc.original_text}
                  </div>
                </div>
                
                {selectedDoc.humanized_text && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Humanized Text</h4>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selectedDoc.humanized_text}
                    </div>
                  </div>
                )}
                
                {selectedDoc.ai_score !== null && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>AI Detection Score: <strong className="text-foreground">{selectedDoc.ai_score}%</strong></span>
                    {selectedDoc.humanized_score !== null && (
                      <span>After Humanization: <strong className="text-success">{selectedDoc.humanized_score}%</strong></span>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
