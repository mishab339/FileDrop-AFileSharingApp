import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          toast.error('Authentication failed. No token received.');
          navigate('/login');
          return;
        }

        // Use the oauthLogin function from AuthContext
        const result = await oauthLogin(token);
        
        if (result.success) {
          // Redirect to dashboard/folders
          navigate('/folders', { replace: true });
        } else {
          toast.error(result.message || 'Authentication failed. Please try again.');
          navigate('/login');
        }
        
      } catch (error) {
        console.error('OAuth success handler error:', error);
        toast.error('Authentication failed. Please try again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    handleOAuthSuccess();
  }, [searchParams, navigate, oauthLogin]);

  return (
    <>
      <Helmet>
        <title>Completing Sign In - FileShare</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="loading-spinner w-16 h-16"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Completing Sign In
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your account...
          </p>
        </div>
      </div>
    </>
  );
};

export default OAuthSuccess;