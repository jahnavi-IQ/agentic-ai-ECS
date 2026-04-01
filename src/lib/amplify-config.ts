//Path: \src\lib\amplify-config.ts
import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  console.log('🔧 Configuring Amplify (User Pool only)...');
  
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: 'us-east-1_BRNkfjwLN',
        userPoolClientId: '1qdnmbr84efgbdapmjgef5cc64',
        
        // CRITICAL: Do NOT include identityPoolId
        // We only need User Pool for authentication
        
        loginWith: {
          email: true,
          phone: true,
          username: false,
        },
        
        signUpVerificationMethod: 'code',
        
        userAttributes: {
          email: {
            required: true,
          },
          phone_number: {
            required: false,
          },
        },
        
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true,
        },
        
        mfa: {
          status: 'optional',
          smsEnabled: true,
          totpEnabled: false,
        },
      },
    },
  }, {
    ssr: true,
  });

  console.log('✅ Amplify configured successfully (User Pool only)');
};