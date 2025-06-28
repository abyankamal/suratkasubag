import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import LoginHeader from './login/login-header';
import LoginFooter from './login/login-footer';

interface LoginLayoutProps {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <LoginHeader />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-md">
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </div>
      
      <LoginFooter />
    </div>
  );
}
