const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Story = require('../models/Story');

//show add page view
router.get('/add', ensureAuth, (req, res) => {
  return res.render('stories/add');
});

//Add page
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    return res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    return res.render('error/500');
  }
});

//Show all public stories view
router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();
    return res.render('stories/index', {
      stories,
    });
  } catch (error) {
    console.error(error);
    return res.render('error/500');
  }
});

//Show single story
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await (await Story.findById(req.params.id))
      .populated('user')
      .lean();

    if (!story) return res.render('error/404');
    return res.render('stories/show', { story });
  } catch (error) {
    console.error(error);
    res.render('error/404');
  }
});

//show edit view
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();
    if (!story) return res.render('error/404');

    if (story.user != req.user.id) return res.redirect('/stories');
    return res.render('stories/edit', { story });
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

//edit story
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();
    if (!story) return res.render('error/404');
    if (story.user != req.user.id) return res.redirect('/stories');
    story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

//delete story
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Story.remove({ _id: req.params.id });
    return res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    return res.render('error/500');
  }
});

module.exports = router;
