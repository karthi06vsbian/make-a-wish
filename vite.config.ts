import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleCreateOrder, handleVerifyPayment } from './server/razorpayMiddleware';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for Node modules
  process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

  const razorpayApiPlugin: Plugin = {
    name: 'razorpay-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/create-order', (req, res) => {
        handleCreateOrder(req, res, env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET);
      });
      server.middlewares.use('/api/verify-payment', (req, res) => {
        handleVerifyPayment(req, res, env.RAZORPAY_KEY_SECRET);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/create-order', (req, res) => {
        handleCreateOrder(req, res, env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET);
      });
      server.middlewares.use('/api/verify-payment', (req, res) => {
        handleVerifyPayment(req, res, env.RAZORPAY_KEY_SECRET);
      });
    },
  };

  return {
    plugins: [react(), razorpayApiPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
            icons: ['lucide-react'],
          },
        },
      },
    },
  };
});
