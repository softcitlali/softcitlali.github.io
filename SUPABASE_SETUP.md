# Supabase 集成设置指南

本指南将帮助你将 AI 工具指南网站连接到 Supabase 数据库，实现真实数据存取。

## 步骤 1：创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com/) 并注册账号
2. 登录后，点击 "New Project" 创建新项目
3. 填写项目信息：
   - **Name**: ai-tool-guide（或你喜欢的名称）
   - **Database Password**: 设置一个强密码（请记住此密码）
   - **Region**: 选择离你最近的区域
4. 点击 "Create new project"，等待项目创建完成（约 2 分钟）

## 步骤 2：获取项目配置信息

1. 项目创建完成后，进入项目仪表板
2. 点击左侧菜单的 "Settings"（设置）图标
3. 选择 "API" 选项
4. 复制以下信息：
   - **Project URL**: 例如 `https://xxxxx.supabase.co`
   - **anon public key**: 一串很长的字符串

## 步骤 3：配置项目文件

1. 打开 `js/supabase-config.js` 文件
2. 替换以下占位符：
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 替换为你的 Project URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 替换为你的 anon public key
   ```

## 步骤 4：创建数据库表结构

1. 在 Supabase 项目中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query" 创建新查询
3. 将 `supabase-schema.sql` 文件的内容复制粘贴到查询编辑器中
4. 点击 "Run" 执行 SQL 脚本
5. 等待执行完成，确认没有错误

## 步骤 5：配置身份认证

1. 在 Supabase 项目中，点击左侧菜单的 "Authentication"
2. 选择 "Providers" 选项
3. 确保 "Email" 提供商已启用
4. （可选）配置其他登录方式：
   - Google OAuth
   - GitHub OAuth
   - 其他第三方登录

## 步骤 6：更新 HTML 文件

在 `index.html` 文件的 `<head>` 部分添加以下代码：

```html
<!-- Supabase SDK -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- Supabase 配置 -->
<script src="js/supabase-config.js"></script>
<!-- 数据库操作 -->
<script src="js/db-operations.js"></script>
```

## 步骤 7：测试连接

1. 打开浏览器开发者工具（F12）
2. 访问你的网站
3. 在控制台中运行以下命令测试：
   ```javascript
   // 测试获取所有工具
   dbOperations.getAllTools().then(tools => console.log(tools));
   
   // 测试获取所有教程
   dbOperations.getAllTutorials().then(tutorials => console.log(tutorials));
   ```

## 步骤 8：部署更新

完成配置后，将更新推送到 GitHub：

```bash
git add .
git commit -m "集成 Supabase 数据库"
git push origin main
```

## 功能说明

### 已实现的功能

1. **工具管理**
   - 获取所有 AI 工具列表
   - 搜索工具
   - 查看工具详情

2. **教程管理**
   - 获取所有教程
   - 按工具分类查看教程
   - 查看教程详情

3. **用户系统**
   - 用户注册
   - 用户登录/登出
   - 用户资料管理

4. **评论系统**
   - 查看教程评论
   - 添加评论
   - 删除评论

5. **收藏功能**
   - 收藏工具
   - 取消收藏
   - 查看收藏列表

## 安全注意事项

1. **不要泄露密钥**：
   - `anon public key` 可以公开，但不要泄露 `service_role key`
   - 不要将敏感信息提交到公开仓库

2. **行级安全策略（RLS）**：
   - 已为所有表启用 RLS
   - 确保用户只能访问和修改自己的数据

3. **API 限制**：
   - Supabase 免费版有 API 调用限制
   - 监控使用情况，避免超出限制

## 故障排除

### 问题 1：无法连接到 Supabase
- 检查网络连接
- 确认 URL 和 Key 配置正确
- 检查浏览器控制台的错误信息

### 问题 2：数据库操作失败
- 确认 SQL 脚本执行成功
- 检查表结构是否正确创建
- 查看 Supabase 仪表板的日志

### 问题 3：用户认证失败
- 确认 Email 提供商已启用
- 检查邮箱验证设置
- 查看 Authentication 日志

## 下一步

1. **添加用户界面**：创建登录/注册页面
2. **实现评论功能**：在教程页面添加评论区
3. **添加收藏按钮**：在工具卡片上添加收藏功能
4. **优化用户体验**：添加加载状态和错误提示

## 获取帮助

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Discord 社区](https://discord.supabase.com/)
