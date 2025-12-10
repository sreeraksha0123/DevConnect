import pool from '../models/db.js';

// ------------------ GET RECOMMENDATIONS ------------------
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get current user's skills and interests
    const userResult = await pool.query(
      'SELECT skills, looking_for FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const currentUser = userResult.rows[0];
    const userSkills = currentUser.skills || [];
    const userLookingFor = currentUser.looking_for || [];

    // Get users that haven't been matched/rejected yet
    const result = await pool.query(
      `SELECT 
        u.id, u.username, u.avatar_url, u.bio, u.skills, u.looking_for, u.github_url
       FROM users u
       WHERE u.id != $1
       AND NOT EXISTS (
         SELECT 1 FROM matches m 
         WHERE m.user_id = $1 AND m.matched_user_id = u.id
       )
       AND u.active = true
       ORDER BY RANDOM()
       LIMIT 20`,
      [userId]
    );

    // Enhanced scoring algorithm
    const recommendations = result.rows.map(user => {
      let score = 0;
      const userSkillsSet = new Set(user.skills || []);
      const userLookingForSet = new Set(user.looking_for || []);

      // Check skill overlap (both ways)
      userSkills.forEach(skill => {
        if (userSkillsSet.has(skill)) score += 2;
      });

      // Check if user has skills we're looking for
      userLookingFor.forEach(interest => {
        if (userSkillsSet.has(interest)) score += 3;
      });

      // Check if we have skills they're looking for
      userSkills.forEach(skill => {
        if (userLookingForSet.has(skill)) score += 3;
      });

      // Bio similarity (simple check)
      if (currentUser.bio && user.bio) {
        const bioWords = user.bio.toLowerCase().split(' ');
        const currentBioWords = currentUser.bio.toLowerCase().split(' ');
        const commonWords = bioWords.filter(word => 
          currentBioWords.includes(word) && word.length > 3
        );
        score += commonWords.length;
      }

      return {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        skills: user.skills || [],
        lookingFor: user.looking_for || [],
        githubUrl: user.github_url,
        matchScore: Math.min(score, 100) // Cap at 100
      };
    });

    // Sort by score (descending)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: recommendations.slice(0, 10)
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ CREATE MATCH (ACCEPT/REJECT) ------------------
export const createMatch = async (req, res) => {
  try {
    const { matchedUserId, status } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!matchedUserId || !status) {
      return res.status(400).json({ 
        success: false,
        message: 'Matched user ID and status are required' 
      });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Status must be accepted or rejected' 
      });
    }

    if (userId === matchedUserId) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot match with yourself' 
      });
    }

    // Check if match already exists
    const existingMatch = await pool.query(
      'SELECT * FROM matches WHERE user_id = $1 AND matched_user_id = $2',
      [userId, matchedUserId]
    );

    if (existingMatch.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Already interacted with this user' 
      });
    }

    // Create match record
    const matchResult = await pool.query(
      `INSERT INTO matches (user_id, matched_user_id, status) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, matchedUserId, status]
    );

    const match = matchResult.rows[0];
    let isMutualMatch = false;
    let chatId = null;

    // Check for mutual acceptance (only if current user accepted)
    if (status === 'accepted') {
      const mutualMatchResult = await pool.query(
        `SELECT * FROM matches 
         WHERE user_id = $1 AND matched_user_id = $2 AND status = 'accepted'`,
        [matchedUserId, userId]
      );

      if (mutualMatchResult.rows.length > 0) {
        isMutualMatch = true;
        
        // Create chat for mutual match
        const chatResult = await pool.query(
          `INSERT INTO chats (user1_id, user2_id) 
           VALUES ($1, $2) 
           RETURNING id`,
          [userId, matchedUserId]
        );
        
        chatId = chatResult.rows[0].id;

        // Get user info for notification
        const [currentUser, matchedUser] = await Promise.all([
          pool.query('SELECT username, avatar_url FROM users WHERE id = $1', [userId]),
          pool.query('SELECT username, avatar_url FROM users WHERE id = $1', [matchedUserId])
        ]);

        // Emit socket event for mutual match (handled in socket.js)
        // This will be emitted when socket.js is set up
        res.app.get('io').to(`user:${userId}`).to(`user:${matchedUserId}`).emit('newMatch', {
          chatId,
          users: [
            {
              id: userId,
              username: currentUser.rows[0].username,
              avatarUrl: currentUser.rows[0].avatar_url
            },
            {
              id: matchedUserId,
              username: matchedUser.rows[0].username,
              avatarUrl: matchedUser.rows[0].avatar_url
            }
          ]
        });
      }
    }

    res.status(201).json({
      success: true,
      message: status === 'accepted' ? 'Match recorded' : 'Preference saved',
      data: {
        match,
        isMutualMatch,
        chatId
      }
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ GET USER'S MATCHES ------------------
export const getMatches = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get mutual matches (both accepted each other)
    const result = await pool.query(
      `SELECT 
        m1.id, m1.created_at,
        u.id as user_id, u.username, u.avatar_url, u.bio, u.skills, u.github_url,
        c.id as chat_id
       FROM matches m1
       JOIN matches m2 ON m1.user_id = m2.matched_user_id AND m1.matched_user_id = m2.user_id
       JOIN users u ON m1.matched_user_id = u.id
       LEFT JOIN chats c ON (c.user1_id = m1.user_id AND c.user2_id = m1.matched_user_id) 
                         OR (c.user1_id = m1.matched_user_id AND c.user2_id = m1.user_id)
       WHERE m1.user_id = $1 
         AND m1.status = 'accepted' 
         AND m2.status = 'accepted'
       ORDER BY m1.created_at DESC`,
      [userId]
    );

    const matches = result.rows.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      chatId: row.chat_id,
      user: {
        id: row.user_id,
        username: row.username,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        skills: row.skills || [],
        githubUrl: row.github_url
      }
    }));

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// ------------------ GET PENDING MATCHES (People who liked you) ------------------
export const getPendingMatches = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT 
        m.id, m.created_at,
        u.id as user_id, u.username, u.avatar_url, u.bio, u.skills, u.github_url
       FROM matches m
       JOIN users u ON m.user_id = u.id
       WHERE m.matched_user_id = $1 
         AND m.status = 'accepted'
         AND NOT EXISTS (
           SELECT 1 FROM matches m2 
           WHERE m2.user_id = $1 
           AND m2.matched_user_id = m.user_id
         )
       ORDER BY m.created_at DESC`,
      [userId]
    );

    const pendingMatches = result.rows.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        username: row.username,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        skills: row.skills || [],
        githubUrl: row.github_url
      }
    }));

    res.json({
      success: true,
      data: pendingMatches
    });
  } catch (error) {
    console.error('Get pending matches error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};