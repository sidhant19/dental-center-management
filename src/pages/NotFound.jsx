import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Home, 
  ArrowLeft, 
  Search,
  AlertTriangle
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        burgerMenu={false} 
        showLogout={true}
      />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <AlertTriangle className="h-16 w-16 text-destructive" />
                <Search className="h-8 w-8 text-muted-foreground absolute -bottom-2 -right-2" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
            <p className="text-muted-foreground mt-2">
              Sorry, the page you're looking for doesn't exist.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>You might have typed the wrong address or the page may have moved.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGoHome}
                className="flex items-center gap-2 flex-1"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              <Button 
                variant="outline"
                onClick={handleGoBack}
                className="flex items-center gap-2 flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
            
            <div className="text-center text-xs text-muted-foreground">
              <p>Error 404</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;