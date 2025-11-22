declare const process: any;

export const environment = {
  production: false,
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || 'FIREBASE_API_KEY',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'FIREBASE_AUTH_DOMAIN',
    projectId: process.env.FIREBASE_PROJECT_ID || 'FIREBASE_PROJECT_ID',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'FIREBASE_STORAGE_BUCKET',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'FIREBASE_MESSAGING_SENDER_ID',
    appId: process.env.FIREBASE_APP_ID || 'FIREBASE_APP_ID',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'FIREBASE_MEASUREMENT_ID'
  }
};
