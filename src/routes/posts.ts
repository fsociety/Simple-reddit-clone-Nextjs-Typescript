import { Router, Request, Response } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import multer, { FileFilterCallback } from 'multer'
import path from 'path'

import auth from '../middleware/auth';
import user from '../middleware/user';
import { makeId } from "../utils/helper";

const createPost = async (req: Request, res: Response) => {
    const {title, body, sub} = req.body;

    const user = res.locals.user

    if(title.trim() === ''){
        return res.status(400).json({title: 'Title must not be empty'})
    }

    try {    
        const subRecord = await Sub.findOneOrFail({ name: sub })
        const post = new Post({ title, body, user, sub: subRecord})
        await post.save()

        return res.json(post)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const editPost = async (req: Request, res: Response) => {
    const {title, body} = req.body;
    const {identifier, slug} = req.params;

    const user = res.locals.user

    if(title.trim() === ''){
        return res.status(400).json({title: 'Title must not be empty'})
    }

    try {
        const post = await Post.findOneOrFail({ identifier, slug, username: user.username })
        post.title = title
        post.body = body
        await post.save()

        return res.json(post)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const deletePost = async (req: Request, res: Response) => {
    const {identifier, slug} = req.body;

    const user = res.locals.user

    try {
        const post = await Post.findOneOrFail({ identifier, slug, username: user.username })
        await post.remove()

        return res.json({ success: 'Post destroyed' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const getPosts = async (req: Request, res: Response) => {
    const currentPage : number = (req.query.page || 0) as number
    const postsPerPage: number = 5
    try {
        const posts = await Post.find({
            order : { createdAt:'DESC' },
            relations: ['comments','votes', 'sub'],
            skip: currentPage * postsPerPage,
            take: postsPerPage
        })

        if(res.locals.user){
            posts.forEach(p => {
                p.setUserVote(res.locals.user)
            })
        }

        return res.json(posts)
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: 'Something went wrong'})
    }
}

const getPost = async (req: Request, res: Response) => {
    const {identifier, slug} = req.params;
    try {
        const post = await Post.findOneOrFail(
            { identifier, slug },
            { relations: ['sub', 'votes', 'comments'] }
            )
        if(res.locals.user){
            post.setUserVote(res.locals.user)
        }

        return res.json(post)
    } catch (err) {
        console.log(err);
        return res.status(404).json({error: 'Post not found!'})
    }
}

const commentOnPost = async (req: Request, res: Response) => {
    const {identifier, slug} = req.params;
    const body = req.body.body;

    try {
        const post = await Post.findOneOrFail({ identifier, slug})

        const comment = new Comment({
            body,
            user: res.locals.user,
            post
        })
        
        await comment.save()

        return res.json(comment)
    } catch (err) {
        console.log(err)
        return res.status(404).json({error: 'Post not found!'})
    }
}

const getPostComments = async (req: Request, res: Response) =>{
    const {identifier, slug} = req.params
    try {
        const post = await Post.findOneOrFail({identifier, slug})

        const comments = await Comment.find({
            where: { post },
            order: { createdAt: 'DESC' },
            relations: ['votes']
        })

        if(res.locals.user){
            comments.forEach(c => c.setUserVote(res.locals.user))
        }

        return res.json(comments)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const upload = multer({
    storage: multer.diskStorage({
        destination: 'public/images',
        filename: (_, file, callback) => {
            const name = makeId(15)
            callback(null, name + path.extname(file.originalname)) // e.g abcdfgh + .png
        }
    }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => {
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
            callback(null, true)
        }else{
            callback(new Error('Not an image'))
        }
    }
})

const UploadFiles = async (req: Request, res: Response) =>{    
    try {
        return res.json({ image: process.env.APP_URL+ '/images/' + req.file.filename })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}


const router = Router()

router.post('/', user, auth, createPost)
router.get('/', user, getPosts)
router.get('/:identifier/:slug', user, getPost)
router.post('/edit/:identifier/:slug', user, auth, editPost)
router.post('/destroy', user, auth, deletePost)
router.post('/uploads', user, auth, upload.single('file'), UploadFiles)
router.post('/:identifier/:slug/comments', user, auth, commentOnPost)
router.get('/:identifier/:slug/comments', user, getPostComments)

export default router;