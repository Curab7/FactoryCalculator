# 部署信息

## GitHub Pages 部署路径

**重要：** 本项目部署在 GitHub Pages 的子路径下，而非根目录。

- **部署 URL**: `https://curab7.github.io/FactoryCalculator`
- **Base 路径**: `/FactoryCalculator/`

## 构建配置

构建时需要使用正确的 base 路径：

```bash
# 生产构建（GitHub Actions 自动执行）
NODE_ENV=production VITE_REPO_NAME=FactoryCalculator npm run build
```

## 本地预览

要预览 GitHub Pages 的效果，使用：

```bash
npm run preview:gh-pages
```

这将：
1. 使用 `/FactoryCalculator/` 作为 base 路径构建
2. 启动预览服务器，模拟 GitHub Pages 环境

## 注意事项

- 所有资源路径（JS、CSS）都会自动包含 `/FactoryCalculator/` 前缀
- 确保 `vite.config.js` 中的 `base` 配置正确
- GitHub Actions 会自动设置 `VITE_REPO_NAME` 环境变量
