import { supabase } from "../config/SupabaseConfig.js";

/* =========================================================
   CREATE POST
========================================================= */
export const createPost = async (req, res) => {
  try {
    const { content, image_url } = req.body;
    const user_id = req.user.id;

    if (!content && !image_url) {
      return res.status(400).json({
        message: "Post must contain content or an image",
      });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([{ user_id, content, image_url }])
      .select(`
        id,
        content,
        image_url,
        created_at,
        likes_count,
        comments_count
      `)
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({ message: "Failed to create post" });
  }
};

/* =========================================================
   GET FEED
========================================================= */
export const getFeed = async (req, res) => {
  try {
    const user_id = req.user.id;

    // 1️⃣ Get posts with user
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        image_url,
        created_at,
        likes_count,
        comments_count,
        user_id,
        app_users(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!posts.length) return res.json([]);

    // 2️⃣ Get current user's likes
    const postIds = posts.map(p => p.id);

    const { data: userLikes } = await supabase
      .from("likes")
      .select("post_id")
      .in("post_id", postIds)
      .eq("user_id", user_id);

    const likedPostIds = new Set(userLikes?.map(l => l.post_id));

    // 3️⃣ Format response
    const formatted = posts.map(post => ({
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      likes_count: post.likes_count ?? 0,
      comments_count: post.comments_count ?? 0,
      username: post.app_users?.name ?? "Unknown",
      is_liked: likedPostIds.has(post.id),
      user_id: post.user_id
    }));

    res.json(formatted);

  } catch (err) {
    console.error("Get Feed Error:", err);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
};

/* =========================================================
   LIKE POST
========================================================= */
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user.id;

    // Prevent duplicate like
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "Post already liked" });
    }

    const { error } = await supabase
      .from("likes")
      .insert([{ post_id: postId, user_id }]);

    if (error) throw error;

    // Increment likes_count
    await supabase.rpc("increment_likes", {
      post_id_input: postId,
    });

    return res.json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Like Post Error:", error);
    return res.status(500).json({ message: "Failed to like post" });
  }
};

/* =========================================================
   UNLIKE POST
========================================================= */
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user.id;

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user_id);

    if (error) throw error;

    await supabase.rpc("decrement_likes", {
      post_id_input: postId,
    });

    return res.json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Unlike Post Error:", error);
    return res.status(500).json({ message: "Failed to unlike post" });
  }
};

/* =========================================================
   ADD COMMENT
========================================================= */
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: postId,
          user_id,
          content: content.trim(),
        },
      ])
      .select(`
        id,
        content,
        created_at,
        app_users(name)
      `)
      .single();

    if (error) throw error;

    // Trigger handles comments_count automatically

    return res.status(201).json(comment);
  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({ message: "Failed to add comment" });
  }
};

/* =========================================================
   DELETE COMMENT
========================================================= */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user.id;

    const { data: comment, error } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (error || !comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user_id !== user_id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) throw deleteError;

    // Trigger handles comments_count decrement

    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({ message: "Failed to delete comment" });
  }
};

/* =========================================================
   GET POST COMMENTS
========================================================= */
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        app_users(name)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error("Get Comments Error:", error);
    return res.status(500).json({ message: "Failed to fetch comments" });
  }
};

/* =========================================================
   DELETE POST
========================================================= */
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user.id;

    const { data: post, error } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (error || !post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user_id !== user_id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) throw deleteError;

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete Post Error:", error);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};


// Edit Post
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.user_id !== user_id) return res.status(403).json({ message: "Not authorized" });

  const { data, error } = await supabase
    .from("posts")
    .update({ content })
    .eq("id", postId)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};