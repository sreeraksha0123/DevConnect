import pool from '../models/db.js';

// ------------------ GET PROFILE ------------------
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const result = await pool.query(
      `SELECT id, email, username, avatar_url, bio, skills, looking_for, github_url, theme, created_at
       FROM users WHERE id = $1 AND active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio || '',
        skills: user.skills || [],
        lookingFor: user.looking_for || [],
        githubUrl: user.github_url || '',
        theme: user.theme || 'light',
        createdAt: user.created_at,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ UPDATE PROFILE ------------------
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, bio, skills, lookingFor, githubUrl, avatarUrl, theme } = req.body;

    // Validate username uniqueness if changed
    if (username) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ 
          success: false,
          message: 'Username already taken' 
        });
      }
    }

    const result = await pool.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           bio = COALESCE($2, bio),
           skills = COALESCE($3, skills),
           looking_for = COALESCE($4, looking_for),
           github_url = COALESCE($5, github_url),
           avatar_url = COALESCE($6, avatar_url),
           theme = COALESCE($7, theme),
           updated_at = NOW()
       WHERE id = $8
       RETURNING id, email, username, avatar_url, bio, skills, looking_for, github_url, theme`,
      [username, bio, skills, lookingFor, githubUrl, avatarUrl, theme, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio || '',
        skills: user.skills || [],
        lookingFor: user.looking_for || [],
        githubUrl: user.github_url || '',
        theme: user.theme || 'light',
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during profile update' 
    });
  }
};

// ------------------ SEARCH USERS ------------------
export const searchUsers = async (req, res) => {
  try {
    const { q: searchTerm, skill } = req.query;
    const userId = req.user.userId;

    let query = `
      SELECT id, username, avatar_url, bio, skills, github_url, created_at
      FROM users
      WHERE id != $1 AND active = true
    `;
    
    const params = [userId];
    let paramCount = 1;

    if (searchTerm) {
      paramCount++;
      query += ` AND (
        username ILIKE $${paramCount} OR 
        bio ILIKE $${paramCount} OR
        github_url ILIKE $${paramCount}
      )`;
      params.push(`%${searchTerm}%`);
    }

    if (skill) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(skills)`;
      params.push(skill);
    }

    query += ' ORDER BY created_at DESC LIMIT 20';

    const result = await pool.query(query, params);
    
    const users = result.rows.map(user => ({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
      bio: user.bio || '',
      skills: user.skills || [],
      githubUrl: user.github_url || '',
      createdAt: user.created_at
    }));

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};