import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2025. Built with{' '}
        <Heart className="inline w-4 h-4 text-red-500 mx-1" />
        using{' '}
        <a 
          href="https://caffeine.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </div>
    </footer>
  );
}
