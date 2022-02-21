import { Request, Response, Router } from "express";
import { isEmpty } from "class-validator";
import { getRepository,getConnection } from 'typeorm';
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'

import User from '../entities/User'
import Sub from '../entities/Sub'
import auth from "../middleware/auth";
import user from "../middleware/user";
import Post from "../entities/Post";
import { makeId } from "../utils/helper";
import { NextFunction } from "express-serve-static-core";


const createSub = async (req: Request, res: Response) => {
    const {name, title, description} = req.body

    const user: User = res.locals.user

    try {
        let errors : any ={}

        if(isEmpty(name)) errors.name = 'Name must not be empty';
        if(isEmpty(title)) errors.name = 'Title must not be empty';

        const sub = await getRepository(Sub)
                    .createQueryBuilder('sub')
                    .where('lower(sub.name) = :name', { name: name.toLowerCase() })
                    .getOne()
        if(sub) errors.name = 'Sub exists already'

        if(Object.keys(errors).length > 0){
            throw errors;
        }

    } catch (err) {
        return res.status(400).json(err)
    }

    try {
        const sub = new Sub({ name: name.toLowerCase(), description, title, user })
        await sub.save()

        return res.json(sub)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const updateSub = async (req: Request, res: Response) => {
    const subName = req.params.name
    const {title, description} = req.body

    const user: User = res.locals.user

    try {
        let errors : any ={}

        if(isEmpty(subName)) errors.name = 'Name must not be empty';
        if(isEmpty(title)) errors.name = 'Title must not be empty';
        
        await Sub.findOneOrFail({ name: subName, username: user.username })

        await getConnection()
            .createQueryBuilder()
            .update(Sub)
            .set({ title: title, description: description })
            .where('lower(name) = :name', { name: subName.toLowerCase() })
            .execute()

        if(Object.keys(errors).length > 0){
            throw errors;
        }

        return res.json({ success: `${subName} successfully updated` })

    } catch (err) {
        return res.status(400).json(err)
    }
}

const getSub = async (req: Request, res: Response) => {
    const name = req.params.name

    try {
        const sub = await Sub.findOneOrFail({ name })
        const posts = await Post.find({
            where: { sub },
            order: { createdAt: 'DESC' },
            relations: ['comments', 'votes']
        })
        sub.posts = posts

        if(res.locals.user){
            sub.posts.forEach(p => p.setUserVote(res.locals.user))
        }

        return res.json(sub)
    } catch (err) {
        console.log(err)
        return res.status(404).json({ sub: 'Sub Not Found!' })
    }
}

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = res.locals.user

    try {
        const sub = await Sub.findOneOrFail({
            where: { name: req.params.name }
        })
        if(sub.username !== user.username){
            return res.status(403).json({ error: 'You dont own this sub' })
        }

        res.locals.sub = sub
        return next()
    } catch (err) {
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

const uploadSubImage = async (req: Request, res: Response) => {
    const sub: Sub = res.locals.sub
    try {
        const type = req.body.type

        if(type !== 'image' && type !== 'banner'){
            fs.unlinkSync(req.file.path)
            return res.status(400).json({ error: 'Invalid type' })
        }
        
        let oldImageUrn: string = ''
        if(type === 'image'){
            oldImageUrn = sub.imageUrn ?? ''
            sub.imageUrn = req.file.filename
        }else if (type === 'banner'){
            oldImageUrn = sub.bannerUrn ?? ''
            sub.bannerUrn = req.file.filename
        }
        await sub.save()

        
        if(oldImageUrn !== ''){
            fs.unlinkSync(`public/images/${oldImageUrn}`)
        }

        return res.json(sub)
    } catch (err) {
        return res.status(500).json({ error:'Something went Wrong' })
    }
}

const searchSubs = async (req: Request, res: Response) => {
    try {
        const name = req.params.name
        if(isEmpty(name)) return res.status(400).json({ error: 'Name must not be empty' })

        const sub = await getRepository(Sub)
                    .createQueryBuilder()
                    .where('LOWER(name) LIKE :name', {name : `${name.toLowerCase().trim()}%` })
                    .getMany()

                    return res.json(sub)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Something went wrong' })
    }
}

const router = Router()

router.post('/', user, auth, createSub)
router.post('/update/:name', user, auth, updateSub)
router.get('/:name', user, getSub)
router.get('/search/:name', searchSubs)
router.post('/:name/image', user, auth, ownSub, upload.single('file'), uploadSubImage)

export default router;