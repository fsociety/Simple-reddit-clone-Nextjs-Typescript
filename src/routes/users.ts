import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import User from "../entities/User";
import auth from "../middleware/auth";
import user from "../middleware/user";

const getUserSubmissions = async (req: Request, res: Response) => {
    try {
        const user = await User.findOneOrFail({
            where: { username: req.params.username },
            select: ['username', 'createdAt', 'email', 'bio']
        })

        const posts = await Post.find({
            where: {user},
            relations: ['comments','votes','sub']
        })

        const comments = await Comment.find({
            where: {user},
            relations: ['post']
        })

        if(res.locals.user){
            posts.forEach(p => p.setUserVote(res.locals.user))
            comments.forEach(c => c.setUserVote(res.locals.user))
        }

        let submissions: any[] = []
        posts.forEach(p => submissions.push({type: 'Post', ...p.toJSON()}));
        comments.forEach(c => submissions.push({type: 'Comment', ...c.toJSON()}));

        submissions.sort((a,b) => {
            if(b.createdAt > a.createdAt) return 1
            if(b.createdAt < a.createdAt) return -1
            return 0
        })

        return res.json({user, submissions})
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const profileEdit = async (req: Request, res: Response) => {
    const username = req.params.username
    const { bio } = req.body
    try {
        const user: User = res.locals.user
        const profile = await User.findOneOrFail({
            where: { username }
        })
        if(user.username !== username) return res.status(401).json({ error: 'invalid authentication credentials' })

        if(bio.trim().length > 500) return res.status(500).json({ error: 'Bio must be less then 500 characters.' })

        profile.bio = bio.trim()

        profile.save()

        return res.json(profile)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const router = Router()

router.get('/:username', user, getUserSubmissions)
router.post('/:username/profile', user, auth, profileEdit)

export default router