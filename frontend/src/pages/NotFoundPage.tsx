/** @format */

import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-bg-elevated border border-white/5 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-gray-700">404</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Page not found</h1>
        <p className="text-sm text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => window.history.back()}><ArrowLeft className="w-4 h-4" />Go Back</Button>
          <Link to="/"><Button variant="primary"><Home className="w-4 h-4" />Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}
