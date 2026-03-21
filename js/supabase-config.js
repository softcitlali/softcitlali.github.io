// Supabase 配置文件
// 请将下面的占位符替换为你的 Supabase 项目信息

const SUPABASE_URL = 'https://roltldpcislhvzqmyliy.supabase.co'; // 例如: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbHRsZHBjaXNsaHZ6cW15bGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTM2MzMsImV4cCI6MjA4OTYyOTYzM30.kWhRUnH_STmFRM9pQ-VBUFY4pPSUiEz9nehssm08Psg'; // 在 Supabase 项目设置中找到

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 导出供其他模块使用
window.supabaseClient = supabase;
