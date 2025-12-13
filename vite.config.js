import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 部署配置
// 开发环境使用根路径，生产环境使用仓库名作为 base
// 如果仓库名不是 'FactoryCalculator'，请设置环境变量 VITE_REPO_NAME
const repositoryName = process.env.VITE_REPO_NAME || 'FactoryCalculator';
// 如果有 VITE_REPO_NAME 环境变量，说明是生产构建，使用仓库名作为 base
// 否则使用根路径（开发环境）
const base = process.env.VITE_REPO_NAME ? `/${repositoryName}/` : '/';

// 输出配置信息（用于调试）
if (process.env.VITE_REPO_NAME) {
  console.log(`Building for GitHub Pages with base: ${base}`);
}

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

