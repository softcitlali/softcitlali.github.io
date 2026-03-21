// Supabase 数据操作 API
// 提供工具、教程、用户、评论、收藏等数据的增删改查功能

// 确保 supabaseClient 可用
const supabaseClient = window.supabaseClient;

if (!supabaseClient) {
    console.error('错误：supabaseClient 未初始化，请检查 Supabase 配置');
}

// ==================== 工具相关操作 ====================

// 获取所有AI工具
async function getAllTools() {
    const { data, error } = await supabaseClient
        .from('tools')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('获取工具列表失败:', error);
        return [];
    }
    return data;
}

// 获取单个工具详情
async function getToolById(toolId) {
    const { data, error } = await supabaseClient
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();
    
    if (error) {
        console.error('获取工具详情失败:', error);
        return null;
    }
    return data;
}

// 搜索工具
async function searchTools(keyword) {
    const { data, error } = await supabaseClient
        .from('tools')
        .select('*')
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    
    if (error) {
        console.error('搜索工具失败:', error);
        return [];
    }
    return data;
}

// ==================== 教程相关操作 ====================

// 获取所有教程
async function getAllTutorials() {
    const { data, error } = await supabaseClient
        .from('tutorials')
        .select(`
            *,
            tools (
                id,
                name,
                icon
            )
        `)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('获取教程列表失败:', error);
        return [];
    }
    return data;
}

// 获取单个工具的所有教程
async function getTutorialsByToolId(toolId) {
    const { data, error } = await supabaseClient
        .from('tutorials')
        .select('*')
        .eq('tool_id', toolId)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('获取工具教程失败:', error);
        return [];
    }
    return data;
}

// 获取教程详情
async function getTutorialById(tutorialId) {
    const { data, error } = await supabaseClient
        .from('tutorials')
        .select(`
            *,
            tools (
                id,
                name,
                icon,
                website_url
            )
        `)
        .eq('id', tutorialId)
        .single();
    
    if (error) {
        console.error('获取教程详情失败:', error);
        return null;
    }
    return data;
}

// ==================== 用户相关操作 ====================

// 注册新用户
async function signUp(email, password, username) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: username
            }
        }
    });
    
    if (error) {
        console.error('注册失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, data: data };
}

// 登录
async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        console.error('登录失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, data: data };
}

// 登出
async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
        console.error('登出失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true };
}

// 获取当前用户
async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

// 获取用户资料
async function getUserProfile(userId) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('获取用户资料失败:', error);
        return null;
    }
    return data;
}

// 更新用户资料
async function updateUserProfile(userId, updates) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) {
        console.error('更新用户资料失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, data: data };
}

// ==================== 评论相关操作 ====================

// 获取教程评论
async function getCommentsByTutorialId(tutorialId) {
    const { data, error } = await supabaseClient
        .from('comments')
        .select(`
            *,
            profiles (
                id,
                username,
                avatar_url
            )
        `)
        .eq('tutorial_id', tutorialId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('获取评论失败:', error);
        return [];
    }
    return data;
}

// 添加评论
async function addComment(tutorialId, content) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: '请先登录' };
    }
    
    const { data, error } = await supabaseClient
        .from('comments')
        .insert([
            {
                user_id: user.id,
                tutorial_id: tutorialId,
                content: content
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('添加评论失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, data: data };
}

// 删除评论
async function deleteComment(commentId) {
    const { error } = await supabaseClient
        .from('comments')
        .delete()
        .eq('id', commentId);
    
    if (error) {
        console.error('删除评论失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true };
}

// ==================== 收藏相关操作 ====================

// 获取用户收藏
async function getUserFavorites(userId) {
    const { data, error } = await supabaseClient
        .from('favorites')
        .select(`
            *,
            tools (
                id,
                name,
                description,
                icon,
                website_url
            )
        `)
        .eq('user_id', userId);
    
    if (error) {
        console.error('获取收藏列表失败:', error);
        return [];
    }
    return data;
}

// 添加收藏
async function addFavorite(toolId) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: '请先登录' };
    }
    
    const { data, error } = await supabaseClient
        .from('favorites')
        .insert([
            {
                user_id: user.id,
                tool_id: toolId
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('添加收藏失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, data: data };
}

// 取消收藏
async function removeFavorite(toolId) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: '请先登录' };
    }
    
    const { error } = await supabaseClient
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', toolId);
    
    if (error) {
        console.error('取消收藏失败:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true };
}

// 检查是否已收藏
async function checkIsFavorited(toolId) {
    const user = await getCurrentUser();
    if (!user) {
        return false;
    }
    
    const { data, error } = await supabaseClient
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('tool_id', toolId)
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error('检查收藏状态失败:', error);
        return false;
    }
    
    return !!data;
}

// ==================== 统计相关操作 ====================

// 获取工具收藏数量
async function getToolFavoriteCount(toolId) {
    const { count, error } = await supabaseClient
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('tool_id', toolId);
    
    if (error) {
        console.error('获取收藏数量失败:', error);
        return 0;
    }
    
    return count;
}

// 获取教程评论数量
async function getTutorialCommentCount(tutorialId) {
    const { count, error } = await supabaseClient
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('tutorial_id', tutorialId);
    
    if (error) {
        console.error('获取评论数量失败:', error);
        return 0;
    }
    
    return count;
}

// 导出函数供其他模块使用
window.dbOperations = {
    // 工具
    getAllTools,
    getToolById,
    searchTools,
    // 教程
    getAllTutorials,
    getTutorialsByToolId,
    getTutorialById,
    // 用户
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getUserProfile,
    updateUserProfile,
    // 评论
    getCommentsByTutorialId,
    addComment,
    deleteComment,
    // 收藏
    getUserFavorites,
    addFavorite,
    removeFavorite,
    checkIsFavorited,
    // 统计
    getToolFavoriteCount,
    getTutorialCommentCount
};
