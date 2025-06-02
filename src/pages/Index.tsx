
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-teal-800 mb-6">
            Welcome to Mina's Tribe
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join our community and discover amazing connections
          </p>
          <div className="space-x-4">
            <Link to="/register">
              <Button className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-3">
                Join the Tribe
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
