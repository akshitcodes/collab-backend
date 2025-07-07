import { pool, query } from "../DB/db.js";

export const home = (req, res) => {
  res.send('Welcome to collabLearn backend');
};
export const createCollab = async (req, res) => {
  console.time('createCollab');
  const {
    type,
    title,
    description,
    skills,
    interests,
    difficulty,
    duration,
    creator,
    tags,
    meeting_frequency,
    timezone,
    max_members,
    members,
    is_public,
    rating
  } = req.body;
  console.log('Creating collab with data:', req.body);  
  const creator_id = req.user?.id; // Assuming req.user is set by authentication middleware
  // Basic validation
  if (
    !type || typeof type !== 'string' || !type.trim() ||
    !title || typeof title !== 'string' || !title.trim() ||
    !Array.isArray(skills) || skills.length === 0 || skills.some(s => typeof s !== 'string' || !s.trim())
  ) {
    return res.status(400).json({ error: 'type, title, and skills (non-empty array of strings) are required.' });
  }
 console.timeLog('createCollab', 'Validation took %dms');
  try {
    await pool.query('BEGIN');
    const insertQuery = `
      INSERT INTO collab (
        type, title, description, skills, interests, difficulty, duration, creator, tags, meeting_frequency, timezone, max_members, members, is_public, rating,creator_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING *
    `;
    const values = [
      type.trim(),
      title.trim(),
      description || null,
      skills.map(s => s.trim()),
      Array.isArray(interests) ? interests.map(i => i.trim()) : null,
      difficulty || null,
      duration || null,
      creator || null,
      Array.isArray(tags) ? tags.map(t => t.trim()) : null,
      meeting_frequency || null,
      timezone || null,
      max_members || null,
      members || null,
      is_public !== undefined ? is_public : null,
      rating || null,
      creator_id // Assuming creator_id is the ID of the user creating the collab
    ];
    
 console.timeLog('createCollab', 'Preparing insert query took %dms');
    const result = await pool.query(insertQuery, values);
    console.timeLog('createCollab', 'Database queries took %dms');
    const newCollabId = result.rows[0].id;

const membershipResult = await pool.query(
  `INSERT INTO collab_memberships (user_id, collab_id, role) VALUES ($1, $2, 'owner')`,
  [creator_id, newCollabId]
);
console.timeLog('createCollab', 'Membership creation took %dms');
    if (membershipResult.rowCount === 0) {
      return res.status(500).json({ error: 'Failed to create membership for the creator.' });
    }
     await pool.query('COMMIT');
    console.timeEnd('createCollab');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
      await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Database error' });
  }
}


export const getCollabs = async (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
  const offset = (page - 1) * limit;

  try {
    // Get total count for pagination
    const countResult = await query('SELECT COUNT(*) FROM collab');
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await query(
      'SELECT * FROM collab  ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      data: result.rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Database error');
  }
};

  export const getFilteredCollabs = async (req, res) => {
  try {
    const skills = req.query.skills
      ? req.query.skills.split(',').map(s => s.trim())
      : [];
    const interests = req.query.interests
      ? req.query.interests.split(',').map(i => i.trim())
      : [];
    const matchedLimit = parseInt(req.query.matchedLimit) || 20;
    const extraLimit = parseInt(req.query.extraLimit) || 20;

    const query = `
      WITH matched AS (
        SELECT *, 
          ARRAY(
            SELECT UNNEST(skills)
            INTERSECT
            SELECT UNNEST($1::text[])
          ) AS matched_skills,
          ARRAY(
            SELECT UNNEST(interests)
            INTERSECT
            SELECT UNNEST($2::text[])
          ) AS matched_interests,
          CARDINALITY(
            ARRAY(
              SELECT UNNEST(skills)
              INTERSECT
              SELECT UNNEST($1::text[])
            )
          ) +
          CARDINALITY(
            ARRAY(
              SELECT UNNEST(interests)
              INTERSECT
              SELECT UNNEST($2::text[]) n
            )
          ) AS match_count
        FROM collab
        WHERE skills && $1::text[] OR interests && $2::text[]
        ORDER BY match_count DESC
        LIMIT $3
      ),
      others AS (
        SELECT *, 
          ARRAY[]::text[] AS matched_skills,
          ARRAY[]::text[] AS matched_interests,
          0 AS match_count
        FROM collab
        WHERE id NOT IN (SELECT id FROM matched)
        ORDER BY created_at DESC
        LIMIT $4
      )
      SELECT * FROM matched
      UNION ALL
      SELECT * FROM others
    `;
    const result = await pool.query(query, [skills, interests, matchedLimit, extraLimit]);
    res.status(200).json(result.rows.slice(0, matchedLimit));
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Database error');
  }
};
//   try{
//     const skills = req.query.skills
//       ? req.query.skills.split(',').map(s => s.trim())
//       : [];
//     const interests = req.query.interests
//       ? req.query.interests.split(',').map(i => i.trim())
//       : [];
//     const query = `
// SELECT *, 
//   ARRAY(
//     SELECT UNNEST(skills)

//     INTERSECT
//     SELECT UNNEST($1::text[])
//   ) AS matched_skills,
//   ARRAY(
//     SELECT UNNEST(interests)
//     INTERSECT
//     SELECT UNNEST($2::text[])
//   ) AS matched_interests,
//   CARDINALITY(
//     ARRAY(
//       SELECT UNNEST(skills)
//       INTERSECT
//       SELECT UNNEST($1::text[])
//     )
//   ) +
//   CARDINALITY(
//     ARRAY(
//       SELECT UNNEST(interests)
//       INTERSECT
//       SELECT UNNEST($2::text[])
//     )
//   ) AS match_count
// FROM collab
// WHERE skills && $1::text[] OR interests && $2::text[]
// ORDER BY match_count DESC
// `;

// const result = await pool.query(query, [skills, interests]);
    
//     res.status(200);
//     res.send(result.rows);
//   }catch (error) {
//     console.error('Database error:', error);
//     res.status(500).send('Database error');
//   }

export const getUserCreatedCollabs = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user
    console.log('Fetching collabs for user:', userId);
    try {
        const result = await pool.query(
            'SELECT * FROM collab WHERE creator_id = $1',
            [userId]
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching user collabs:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
export const getUserJoinedCollabs = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user
    console.log('Fetching joined collabs for user:', userId);
    try {
        const result = await pool.query(
            `SELECT c.* FROM collab c
             JOIN collab_memberships cm ON c.id = cm.collab_id
             WHERE cm.user_id = $1`,
            [userId]
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching joined collabs:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
