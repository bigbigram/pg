import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { Session } from 'next-auth';

export function withAuth(gssp: GetServerSideProps) {
  return async (context: GetServerSidePropsContext) => {
    const { req, res } = context;
    
    // Get the user's session based on the request
    const session = await getServerSession(context.req, context.res, authOptions);
    
    // If no session, redirect to login
    if (!session) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }

    try {
      // Call the original getServerSideProps with the session
      const gsspData = await gssp(context);
      
      // Pass the session to the page component
      if ('props' in gsspData) {
        return {
          ...gsspData,
          props: {
            ...gsspData.props,
            session: session
          }
        };
      }
      
      return gsspData;
    } catch (error) {
      console.error('Error in withAuth middleware:', error);
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }
  };
}

// Helper type for pages that use withAuth
export type PageWithAuth = {
  auth?: boolean;
  role?: string;
};
