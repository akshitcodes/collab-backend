import { pool, query } from "../DB/db.js";

export const home = (req, res) => {
  res.send('Welcome to collabLearn backend');
};

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
              SELECT UNNEST($2::text[])
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


