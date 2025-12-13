import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 部署配置
// 开发环境使用根路径，生产环境使用仓库名作为 base
// 如果设置了 VITE_REPO_NAME 环境变量，使用它作为 base 路径
// 否则在生产构建时使用默认仓库名 'FactoryCalculator'
const repositoryName = process.env.VITE_REPO_NAME || 'FactoryCalculator';
const isProduction = process.env.NODE_ENV === 'production';
// 在生产构建时，如果设置了仓库名，使用子路径；否则使用根路径
// 开发环境始终使用根路径
const base = (isProduction && repositoryName) ? `/${repositoryName}/` : '/';

// 输出配置信息（用于调试）
console.log(`Building with base: ${base} (NODE_ENV: ${process.env.NODE_ENV}, REPO: ${repositoryName})`);

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保资源路径正确
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
});

