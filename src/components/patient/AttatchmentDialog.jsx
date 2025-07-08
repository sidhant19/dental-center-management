import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, X } from 'lucide-react';

function AttachmentDialog({ open, onOpenChange, files }) {
  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${file.url}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Attachments
          </DialogTitle>
          <DialogDescription>
            Download your appointment files and documents below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No attachments available.</p>
            </div>
          ) : (
            files.map((file, idx) => (
              <div key={file.name + idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownload(file)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AttachmentDialog;