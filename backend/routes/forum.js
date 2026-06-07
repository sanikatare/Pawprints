const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ForumPost = require('../models/ForumPost');

router.get('/', async (req, res) => {
  try {
    const posts = await ForumPost.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const post = new ForumPost({ ...req.body, author: req.user.id });
    await post.save();
    await post.populate('author', 'name');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!req.body.content?.trim()) return res.status(400).json({ message: 'Comment content is required' });
    post.comments.push({ author: req.user.id, content: req.body.content.trim() });
    await post.save();
    await post.populate('author', 'name');
    await post.populate('comments.author', 'name');
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex === -1) post.likes.push(req.user.id);
    else post.likes.splice(likeIndex, 1);
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await ForumPost.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
