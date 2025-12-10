import pool from '../models/db.js';

// ------------------ GET ALL POSTS ------------------
export const getPosts = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT 
        p.id, p.title, p.content, p.tags, p.likes, p.created_at, p.updated_at,
        u.id as user_id, u.username, u.avatar_url, u.skills
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_active = true
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const posts = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      tags: row.tags || [],
      likes: row.likes || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        avatarUrl: row.avatar_url,
        skills: row.skills || []
      }
    }));

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ GET SINGLE POST ------------------
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        p.id, p.title, p.content, p.tags, p.likes, p.created_at, p.updated_at,
        u.id as user_id, u.username, u.avatar_url, u.skills
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    const row = result.rows[0];
    const post = {
      id: row.id,
      title: row.title,
      content: row.content,
      tags: row.tags || [],
      likes: row.likes || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        avatarUrl: row.avatar_url,
        skills: row.skills || []
      }
    };

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ CREATE POST ------------------
export const createPost = async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and content are required' 
      });
    }

    if (title.length > 200) {
      return res.status(400).json({ 
        success: false,
        message: 'Title too long (max 200 characters)' 
      });
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, title, content, tags) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, title, content, tags]
    );

    const post = result.rows[0];

    // Get user info
    const userResult = await pool.query(
      'SELECT id, username, avatar_url, skills FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags || [],
        likes: post.likes || 0,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatar_url,
          skills: user.skills || []
        }
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ UPDATE POST ------------------
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.userId;

    // Check if post exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found or unauthorized' 
      });
    }

    const result = await pool.query(
      `UPDATE posts 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content), 
           tags = COALESCE($3, tags),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title, content, tags, id, userId]
    );

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ DELETE POST ------------------
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Soft delete (mark as inactive)
    const result = await pool.query(
      `UPDATE posts 
       SET is_active = false, 
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found or unauthorized' 
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ LIKE POST ------------------
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if already liked
    const existingLike = await pool.query(
      'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [id, userId]
      );
      
      const result = await pool.query(
        'UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = $1 RETURNING likes',
        [id]
      );

      return res.json({
        success: true,
        liked: false,
        likes: result.rows[0].likes
      });
    } else {
      // Like
      await pool.query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
      
      const result = await pool.query(
        'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes',
        [id]
      );

      return res.json({
        success: true,
        liked: true,
        likes: result.rows[0].likes
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};