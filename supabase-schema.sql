-- Supabase 数据库表结构
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. AI工具表
CREATE TABLE tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    website_url VARCHAR(500),
    tutorial_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 教程表
CREATE TABLE tutorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    tag VARCHAR(100),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户表（扩展Supabase Auth）
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 评论表
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 收藏表
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_tutorials_tool_id ON tutorials(tool_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_tutorial_id ON comments(tutorial_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_tool_id ON favorites(tool_id);

-- 启用行级安全策略 (RLS)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 工具表：所有人可读，只有管理员可写
CREATE POLICY "工具表公开读取" ON tools
    FOR SELECT USING (true);

CREATE POLICY "工具表管理员写入" ON tools
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 教程表：所有人可读，只有管理员可写
CREATE POLICY "教程表公开读取" ON tutorials
    FOR SELECT USING (true);

CREATE POLICY "教程表管理员写入" ON tutorials
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 用户表：用户只能查看和更新自己的资料
CREATE POLICY "用户资料公开读取" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "用户资料自己更新" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户资料自己插入" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 评论表：所有人可读，登录用户可写
CREATE POLICY "评论公开读取" ON comments
    FOR SELECT USING (true);

CREATE POLICY "评论登录用户可写" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "评论作者可更新" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "评论作者可删除" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- 收藏表：登录用户可管理自己的收藏
CREATE POLICY "收藏用户可读" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "收藏用户可添加" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "收藏用户可删除" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 插入初始数据：AI工具
INSERT INTO tools (name, description, icon, website_url, tutorial_url) VALUES
('ChatGPT', 'OpenAI开发的强大语言模型，可用于对话、写作、编程等多种任务', '🤖', 'https://chat.openai.com', 'tutorials/chatgpt-tutorial.html'),
('Midjourney', '基于文本描述生成高质量图像的AI工具，适合创意设计', '🎨', 'https://www.midjourney.com', 'tutorials/midjourney-tutorial.html'),
('GitHub Copilot', 'AI驱动的代码助手，帮助开发者编写代码和解决编程问题', '💻', 'https://github.com/features/copilot', 'tutorials/github-copilot-tutorial.html'),
('Runway ML', 'AI视频编辑工具，提供多种视频处理和生成功能', '🎬', 'https://runwayml.com', 'tutorials/runway-ml-tutorial.html'),
('Seedance', '最新的AI视频生成模型，能够根据文本描述创建高质量的视频内容', '🎥', 'https://seedance.ai', 'tutorials/seedance-tutorial.html');

-- 插入初始数据：教程
INSERT INTO tutorials (tool_id, title, tag, content) VALUES
((SELECT id FROM tools WHERE name = 'ChatGPT'), '如何使用ChatGPT提高工作效率', '基础教程', '详细介绍ChatGPT的基本使用方法，以及如何将其应用到日常工作中'),
((SELECT id FROM tools WHERE name = 'Midjourney'), 'Midjourney提示词优化指南', '高级技巧', '学习如何编写有效的提示词，生成高质量的AI图像'),
((SELECT id FROM tools WHERE name = 'GitHub Copilot'), '使用GitHub Copilot加速开发流程', '实用案例', '通过实际案例展示如何利用Copilot提高代码编写效率'),
((SELECT id FROM tools WHERE name = 'Runway ML'), 'Runway ML视频编辑入门教程', '视频编辑', '学习如何使用Runway ML进行视频编辑和生成，提升视频制作效率'),
((SELECT id FROM tools WHERE name = 'Seedance'), 'Seedance AI视频生成教程', '最新模型', '学习如何使用Seedance创建逼真的舞蹈动作，根据音乐或提示词生成专业舞蹈');

-- 创建触发器：自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON tutorials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
