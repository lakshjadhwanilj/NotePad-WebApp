const express = require('express')
const router = express.Router()
const {
    ensureAuth
} = require('../middleware/auth')
const Story = require('../models/Story')

// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.locals.title = 'NotePad | Add Story'
    res.render('stories/add')
})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.locals.title = 'Error'
        res.render('error/500')
    }
})

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            status: 'public'
        }).populate('user').sort({
            createdAt: 'desc'
        }).lean()
        res.locals.title = 'NotePad'
        res.render('stories/index', {
            stories: stories
        })
    } catch (err) {
        console.error(err)
        res.locals.title = 'Error'
        res.render('error/500')
    }
})

// @desc    Show single story
// @route   GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).populate('user').lean()
        if (!story) {
            res.locals.title = 'Error'
            return res.render('error/404')
        }
        res.locals.title = 'NotePad'
        res.render('stories/show', {
            story: story
        })
    } catch (err) {
        console.error(err)
        res.locals.title = 'Error'
        res.render('error/404')
    }
})

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {

    try {
        const story = await Story.findOne({
            _id: req.params.id
        }).lean()
        if (!story) {
            res.locals.title = 'Error'
            return res.render('error/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.locals.title = 'NotePad | Edit'
            res.render('stories/edit', {
                story: story
            })
        }
    } catch (err) {
        console.error(err)
        res.locals.title = 'Error'
        return res.render('error/500')
    }
})

// @desc    Update story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {

    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            res.locals.title = 'Error'
            return res.render('error/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({
                _id: req.params.id
            }, req.body, {
                new: true,
                runValidators: true
            })
            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        res.locals.title = 'Error'
        return res.render('error/500')
    }
})
// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.remove({
            _id: req.params.id
        })
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.locals.title = 'Error'
        return res.render('error/500')
    }
})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public'
        }).populate('user').lean()
        res.locals.title = 'NotePad'
        res.render('stories/index', {
            stories: stories
        })
    } catch (err) {
        console.error(err)
        res.locals.title = 'Error'
        return res.render('error/500')
    }
})

module.exports = router