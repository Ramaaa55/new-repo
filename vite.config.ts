import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> d730f9b1befb58d3cba7e2a8520bb218e93d8791
    include: ['@excalidraw/excalidraw'],
    exclude: ['lucide-react'],
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  },
<<<<<<< HEAD
});
=======
});
=======
    exclude: ['lucide-react'],
  },
});
>>>>>>> 53cd0b6291fd472b0fc9ff1e8e8200c840339be3
>>>>>>> d730f9b1befb58d3cba7e2a8520bb218e93d8791
