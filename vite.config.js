import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 部署配置
// 开发环境使用根路径，生产环境使用仓库名作为 base
// 如果仓库名不是 'FactoryCalculator'，请设置环境变量 VITE_REPO_NAME
const repositoryName = process.env.VITE_REPO_NAME || 'FactoryCalculator';
const base = process.env.NODE_ENV === 'production' ? `/${repositoryName}/` : '/';

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

