const express = require("express")
const router = require('express').Router();
const User = require('../models/User');
const UserAnswer = require('../models/UserAnswer');

// @desc    Shows leaderboard for a given category
// @route   GET /leaderboard? Search params: circle and category
// @access  User with user role only
router.get('/', routeProtect.isUserLoggedIn, async (req, res, next) => {
    // we query all user answers and then filter out the answers to questions that belong to the queried category
    const circleId = req.query.circle;
    const categoryId = req.query.category;
    const circleObjectIds = req.payload.circles.map(id => mongoose.Types.ObjectId(id));
    if(!circleObjectIds.includes(circleId)) {
      res.status(403).json({msg: "User does not belong to this circle"});
    }
    try {
        const actions = await UserAnswer.find({}).populate('questionId');
        const actionsByCategory = actions.filter(action => ((action.questionId.category === category)));
        const users = await User.find({role: "user", isActive: true,});
        // this part calculates the score for every user in a given category
        let scores = [];
        for (let user of users) {
            let userScore = 0;
            for (let action of actionsByCategory) {
                //convert to string because comparison between objectId's is absolute trash
                if (String(action.userAnswered) === String(user._id)) {
                    if (action.questionId.effect) {
                        userScore += 127;
                    }
                    else {
                        userScore -= 127;
                    }
                }
            }
        scores.push({user: user.username, score: userScore});
        }
        scores = scores.sort((a, b) => b.score - a.score);
        console.log(scores);
        res.render('leaderboard', {data: scores, category: category});
    }
    catch (error) {
        res.render('error');
    }
})

module.exports = router;